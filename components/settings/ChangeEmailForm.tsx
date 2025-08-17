"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import { Mail, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"

const changeEmailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required for verification"),
})

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>

interface ChangeEmailFormProps {
  isOAuthUser?: boolean
}

export { ChangeEmailForm as default }

function ChangeEmailForm({ isOAuthUser = false }: ChangeEmailFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  })

  const onSubmit = async (data: ChangeEmailFormData) => {
    setIsLoading(true)
    setError(null)
    setEmailSent(false)

    try {
      const supabase = createClient()

      // For email/password users, reauthenticate first
      if (!isOAuthUser && user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: data.password,
        })

        if (signInError) {
          setError("Password is incorrect")
          return
        }
      }

      // Update email with redirect to verified page
      const { error: updateError } = await supabase.auth.updateUser({
        email: data.newEmail,
      }, {
        emailRedirectTo: `${window.location.origin}/auth/verified?next=/settings/account`
      })

      if (updateError) {
        if (updateError.message.includes("email") && updateError.message.includes("registered")) {
          setError("This email is already registered with another account.")
        } else if (updateError.message.includes("rate limit")) {
          setError("Too many attempts. Please wait a few minutes before trying again.")
        } else {
          setError(updateError.message)
        }
        return
      }

      setEmailSent(true)
      form.reset()
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox to confirm your new email address.",
      })

    } catch (error: any) {
      console.error("Change email error:", error)
      setError(error.message || "Failed to change email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isOAuthUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Change Email
          </CardTitle>
          <CardDescription>
            Update your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your account uses Google/GitHub authentication. 
              To change your email, please visit your provider's account settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Change Email
        </CardTitle>
        <CardDescription>
          Update your email address. You'll need to verify the new email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              A verification email has been sent to your new address. 
              Please check your inbox and click the confirmation link.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Current email:</strong> {user?.email}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              {...form.register("newEmail")}
              placeholder="Enter your new email address"
            />
            {form.formState.errors.newEmail && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.newEmail.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Confirm with Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                placeholder="Enter your current password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Required for security verification
            </p>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              After updating, you'll receive a verification email at your new address. 
              Your email won't change until you confirm it.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Verification...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Update Email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}