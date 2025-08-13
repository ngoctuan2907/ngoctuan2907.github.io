"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Mail, CheckCircle, Loader2, ArrowLeft } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return

    setIsResending(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend verification email")
      }

      toast({
        title: "Email sent!",
        description: "Please check your inbox for the verification email.",
      })

      setResendCooldown(60) // 60 second cooldown
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const maskedEmail = email 
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Link 
              href="/auth/signin" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
            
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {email && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Verification email sent to <strong>{maskedEmail}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <p>Please check your email and click the verification link to activate your account.</p>
              <p>Don't forget to check your spam folder if you don't see the email.</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the email?
              </p>
              
              <Button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0 || !email}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend verification email"
                )}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Already verified?{" "}
                <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
