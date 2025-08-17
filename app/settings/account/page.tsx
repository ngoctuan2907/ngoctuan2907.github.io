"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import SessionExpired from "@/components/auth/SessionExpired"
import { ArrowLeft, User, Mail, Lock, Trash2, Settings, Shield } from "lucide-react"

export default function AccountSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isOAuthUser, setIsOAuthUser] = useState(false)

  useEffect(() => {
    console.log('DEBUG: AccountSettings - user:', user, 'loading:', loading)
    if (!loading && !user) {
      router.push("/auth/signin?next=/settings/account")
    }
    
    // Check if user signed up with OAuth (no password)
    if (user?.app_metadata?.provider && user.app_metadata.provider !== "email") {
      setIsOAuthUser(true)
    }
  }, [user, loading, router])

  if (loading) {
    console.log('DEBUG: Still loading, user:', user, 'loading:', loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading account settings...</p>
          {/* <p className="mt-1 text-xs text-gray-400">Debug: loading={loading.toString()}, user={user ? 'exists' : 'null'}</p> */}
        </div>
      </div>
    )
  }

  if (!user) {
    return <SessionExpired />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <p className="text-gray-900 mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Account Type</label>
                <p className="text-gray-900 mt-1">
                  {isOAuthUser ? (
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      OAuth ({user.app_metadata?.provider})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email & Password
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-gray-900 mt-1">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Sign In</label>
                <p className="text-gray-900 mt-1">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Placeholder Cards */}
        <div className="space-y-6">
          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password Settings
              </CardTitle>
              <CardDescription>
                {isOAuthUser 
                  ? "Your account uses OAuth authentication" 
                  : "Change your account password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOAuthUser ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Your account uses {user.app_metadata?.provider} authentication. 
                    To manage your password, please visit your provider's account settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Change password functionality will be implemented here.
                  </p>
                  <Button disabled>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password (Coming Soon)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Settings
              </CardTitle>
              <CardDescription>
                {isOAuthUser 
                  ? "Your email is managed by your OAuth provider" 
                  : "Update your email address"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOAuthUser ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Your email is managed by {user.app_metadata?.provider}. 
                    To change your email, please visit your provider's account settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Change email functionality will be implemented here.
                  </p>
                  <Button disabled>
                    <Mail className="w-4 h-4 mr-2" />
                    Change Email (Coming Soon)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 mb-3">
                  <strong>Warning:</strong> This action is permanent and cannot be undone. 
                  All your data will be permanently deleted.
                </p>
                <Button disabled variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Security Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a strong, unique password for your account</li>
                  <li>• Enable two-factor authentication in your provider settings if using OAuth</li>
                  <li>• Regularly review your account activity and settings</li>
                  <li>• Contact support if you notice any suspicious activity</li>
                </ul>
                <div className="mt-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/help">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}