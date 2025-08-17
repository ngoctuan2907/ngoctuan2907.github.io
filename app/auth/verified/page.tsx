"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function EmailVerifiedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [countdown, setCountdown] = useState(5)
  
  const next = searchParams.get("next") || "/dashboard"
  const redirectUrl = user ? next : "/auth/signin"

  useEffect(() => {
    if (countdown === 0) {
      router.push(redirectUrl)
      return
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, router, redirectUrl])

  const handleManualContinue = () => {
    router.push(redirectUrl)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            
            <CardTitle className="text-2xl text-green-700">Email Verified!</CardTitle>
            <CardDescription>
              Your email address has been successfully verified.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                ✅ Your account is now fully activated and ready to use.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {user ? (
                  <>Redirecting to your dashboard in <strong>{countdown}</strong> seconds...</>
                ) : (
                  <>Redirecting to sign in in <strong>{countdown}</strong> seconds...</>
                )}
              </p>
              
              <Button 
                onClick={handleManualContinue}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {user ? "Continue to Dashboard" : "Continue to Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {!user && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Don't have the cookies needed?{" "}
                  <Link href="/auth/signin" className="text-green-600 hover:text-green-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}