"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Heart } from "lucide-react"

export default function GoodbyePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            
            <CardTitle className="text-2xl">Account Deleted</CardTitle>
            <CardDescription>
              Your account has been permanently deleted from our system.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                ✅ All your data has been securely removed from our platform.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Thank you for being part of the SG Home Eats community. We're sorry to see you go!
              </p>
              
              <div className="text-sm text-gray-500 space-y-2">
                <p><strong>What we deleted:</strong></p>
                <ul className="text-left space-y-1">
                  <li>• Your account and authentication data</li>
                  <li>• Profile information and preferences</li>
                  <li>• Order history and reviews</li>
                  <li>• Business listings (if applicable)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button asChild className="w-full">
                <Link href="/">
                  Visit Homepage
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Changed your mind? You can always{" "}
                <Link href="/auth/get-started" className="text-orange-600 hover:text-orange-700 font-medium">
                  create a new account
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-400 fill-current" />
              <span>in Singapore</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}