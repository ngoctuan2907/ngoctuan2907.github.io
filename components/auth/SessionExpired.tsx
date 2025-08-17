"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, ArrowRight } from "lucide-react"

interface SessionExpiredProps {
  title?: string
  description?: string
  showAlert?: boolean
}

export default function SessionExpired({ 
  title = "Session Expired",
  description = "Your session has expired. Please sign in again to continue.",
  showAlert = true
}: SessionExpiredProps) {
  const pathname = usePathname()
  const signInUrl = `/auth/signin?next=${encodeURIComponent(pathname)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {showAlert && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  For your security, we've logged you out after a period of inactivity. 
                  Your progress will be preserved once you sign back in.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href={signInUrl}>
                  Sign In Again
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Go to Homepage
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <Link href="/help" className="text-orange-600 hover:text-orange-700 font-medium">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}