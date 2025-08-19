"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, User, Mail, Phone, Save, Loader2 } from "lucide-react"
import Link from "next/link"

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  intendedBusinessName: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, userProfile, loading, refreshUser, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      intendedBusinessName: "",
    },
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        phone: userProfile.phone || "",
        intendedBusinessName: userProfile.intended_business_name || "",
      })
    }
  }, [userProfile, form])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          intended_business_name: data.intendedBusinessName,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Profile updated!",
          description: result.message || "Your profile has been updated successfully.",
        })
        
        // Refresh user data from context
        await refreshUser()
      } else {
        throw new Error(result.error || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isBusinessOwner = userProfile.user_type === "business_owner"
  const isEmailVerified = user.email_confirmed_at !== null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>

            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Information
              </CardTitle>
              <CardDescription>
                Update your personal details and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email (readonly) */}
              <div>
                <Label>Email Address</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={user.email || ""} disabled />
                  <Badge variant={isEmailVerified ? "default" : "secondary"}>
                    {isEmailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                {!isEmailVerified && (
                  <p className="text-sm text-orange-600 mt-1">
                    Please check your email to verify your account
                  </p>
                )}
              </div>

              {/* Account Type (readonly) */}
              <div>
                <Label>Account Type</Label>
                <div className="mt-1">
                  <Badge variant={isBusinessOwner ? "default" : "secondary"} className="text-sm">
                    {isBusinessOwner ? "Business Owner" : "Customer"}
                  </Badge>
                </div>
              </div>

              {/* User ID (readonly) */}
              <div>
                <Label>User ID</Label>
                <Input value={user.id} disabled className="text-xs font-mono" />
                <p className="text-xs text-gray-500 mt-1">
                  This is your unique user identifier
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">
                    Phone Number {isBusinessOwner && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="+65 8123 4567"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                  {isBusinessOwner && (
                    <p className="text-sm text-gray-500 mt-1">
                      Phone number is required for business accounts
                    </p>
                  )}
                </div>

                {/* Business Name (for business owners) */}
                {isBusinessOwner && (
                  <div>
                    <Label htmlFor="intendedBusinessName">
                      Intended Business Name <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id="intendedBusinessName"
                      {...form.register("intendedBusinessName")}
                      placeholder="Ah Ma's Kitchen"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This can be changed when creating your business profile
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Account deletion will be available in a future update
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
