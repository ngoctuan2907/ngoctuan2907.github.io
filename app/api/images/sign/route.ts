import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const signRequestSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  shopId: z.string().uuid("Invalid shop ID").optional(),
  imageType: z.enum(['logo', 'cover', 'menu', 'gallery']).default('gallery')
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = signRequestSchema.parse(body)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(validatedData.fileType)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" 
      }, { status: 400 })
    }

    // If shopId is provided, check permissions
    if (validatedData.shopId) {
      // Get the business to check stakeholder_id
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('stakeholder_id')
        .eq('id', validatedData.shopId)
        .single()

      if (businessError) {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 })
      }

      // Check if user has permission to upload images for this shop
      const { data: membership } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .or(`stakeholder_id.eq.${business.stakeholder_id},shop_id.eq.${validatedData.shopId}`)
        .in('role', ['stakeholder_owner', 'staff', 'clerk'])
        .single()

      if (!membership) {
        return NextResponse.json({ 
          error: "Insufficient permissions to upload images for this shop" 
        }, { status: 403 })
      }
    }

    // Generate unique file path
    const fileExtension = validatedData.fileName.split('.').pop()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    
    const filePath = validatedData.shopId 
      ? `shops/${validatedData.shopId}/${validatedData.imageType}/${timestamp}-${randomString}.${fileExtension}`
      : `temp/${user.id}/${timestamp}-${randomString}.${fileExtension}`

    // Create signed URL for upload
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from('business-images')
      .createSignedUploadUrl(filePath, {
        upsert: false // Don't overwrite existing files
      })

    if (signError) {
      console.error('Error creating signed URL:', signError)
      throw signError
    }

    // Return the signed URL and file path
    return NextResponse.json({
      success: true,
      uploadUrl: signedUrlData.signedUrl,
      filePath,
      publicUrl: supabase.storage
        .from('business-images')
        .getPublicUrl(filePath).data.publicUrl
    })

  } catch (error: any) {
    console.error("Error creating signed upload URL:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create upload URL" 
    }, { status: 500 })
  }
}