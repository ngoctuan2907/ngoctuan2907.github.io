"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Coffee, Users, Eye, EyeOff, Loader2 } from "lucide-react"
import { 
  customerSignUpSchema, 
  businessOwnerSignUpSchema, 
  type CustomerSignUpData, 
  type BusinessOwnerSignUpData 
} from "@/lib/auth-schemas"
import OAuthButtons from "@/components/auth/OAuthButtons"

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [userType, setUserType] = useState<"customer" | "business_owner">("customer")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Get user type from URL params
  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "customer" || type === "business_owner") {
      setUserType(type)
    }
  }, [searchParams])

  // Setup form with appropriate schema
  const schema = userType === "customer" ? customerSignUpSchema : businessOwnerSignUpSchema
  const form = useForm<CustomerSignUpData | BusinessOwnerSignUpData>({
    resolver: zodResolver(schema),
    defaultValues: {
      userType,
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      intendedBusinessName: "",
    },
  })

  // Update form when userType changes
  useEffect(() => {
    form.setValue("userType", userType as any)
  }, [userType, form])

  // Check email existence
  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (data.exists) {
        setEmailError(`An account with this email already exists as a ${data.userType.replace("_", " ")}`)
        return true
      }
      
      setEmailError(null)
      return false
    } catch (error) {
      console.error("Error checking email:", error)
      return false
    }
  }

  const onSubmit = async (data: CustomerSignUpData | BusinessOwnerSignUpData) => {
    console.log("🚀 [DEBUG] onSubmit called with data:", data)
    setIsLoading(true)
    setEmailError(null)

    try {
      // Check if email exists before submitting
      console.log("🔍 [DEBUG] Checking if email exists...")
      const emailExists = await checkEmailExists(data.email)
      console.log("📧 [DEBUG] Email exists result:", emailExists)
      if (emailExists) {
        console.log("❌ [DEBUG] Email exists, stopping submission")
        setIsLoading(false)
        return
      }

      console.log("📤 [DEBUG] Sending signup request...")
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      console.log("📥 [DEBUG] Signup response received:", response.status)
      const result = await response.json()
      console.log("📝 [DEBUG] Signup result:", result)

      if (!response.ok) {
        if (response.status === 409) {
          setEmailError(result.error)
        } else if (response.status === 400) {
          // Handle validation errors
          toast({
            title: "Input Error",
            description: result.error || "Please check your information and try again.",
            variant: "destructive",
          })
        } else {
          throw new Error(result.error || "Failed to create account")
        }
        return
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      })

      // Redirect to verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Link 
              href="/auth/get-started" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
            
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              {userType === "customer" ? (
                <Users className="w-6 h-6 text-orange-600" />
              ) : (
                <Coffee className="w-6 h-6 text-orange-600" />
              )}
            </div>
            
            <CardTitle className="text-2xl">
              {userType === "customer" ? "Join as Food Lover" : "Join as Home Chef"}
            </CardTitle>
            <CardDescription>
              {userType === "customer" 
                ? "Discover amazing home-based cafes in Singapore" 
                : "Share your culinary passion with food lovers"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {emailError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {emailError}.{" "}
                  <Link href="/auth/signin" className="underline font-medium">
                    Sign in instead
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="John"
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
                    placeholder="Doe"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="john@example.com"
                  onBlur={(e) => {
                    if (e.target.value) {
                      checkEmailExists(e.target.value)
                    }
                  }}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Phone (required for business owners) */}
              <div>
                <Label htmlFor="phone">
                  Phone Number {userType === "business_owner" && <span className="text-red-500">*</span>}
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
              </div>

              {/* Business Name (for business owners) */}
              {userType === "business_owner" && (
                <div>
                  <Label htmlFor="intendedBusinessName">
                    Intended Business Name <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    id="intendedBusinessName"
                    {...form.register("intendedBusinessName")}
                    placeholder="Ah Ma's Kitchen"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        form.handleSubmit(onSubmit)()
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can change this later when setting up your business profile
                  </p>
                </div>
              )}

              <Button 
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <OAuthButtons mode="signup" className="mt-6" />

            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
