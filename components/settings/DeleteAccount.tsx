"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { postJson } from "@/lib/http/fetcher"
import { useAuth } from "@/lib/auth-context"
import { Trash2, AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react"

const deleteAccountSchema = z.object({
  confirmPhrase: z.string().refine(
    (val) => val === "DELETE MY ACCOUNT",
    "You must type exactly 'DELETE MY ACCOUNT' to confirm"
  ),
  password: z.string().min(1, "Password is required for verification"),
  deleteProfileData: z.boolean().default(false),
})

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>

interface DeleteAccountProps {
  isOAuthUser?: boolean
}

export { DeleteAccount as default }

function DeleteAccount({ isOAuthUser = false }: DeleteAccountProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmPhrase: "" as any,
      password: "",
      deleteProfileData: false,
    },
  })

  const confirmPhrase = form.watch("confirmPhrase")
  const deleteProfileData = form.watch("deleteProfileData")

  const onSubmit = async (data: DeleteAccountFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Call the delete account API
      await postJson("/api/account/delete", {
        confirmPhrase: data.confirmPhrase,
        password: data.password,
        deleteProfileData: data.deleteProfileData,
      })

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })

      // Clear auth context and redirect to goodbye page
      await refreshUser()
      router.push("/goodbye")

    } catch (error: any) {
      console.error("Delete account error:", error)
      if (error.message.includes("Password is incorrect")) {
        setError("Password is incorrect. Please try again.")
      } else if (error.message.includes("rate limit")) {
        setError("Too many attempts. Please wait before trying again.")
      } else if (error.message.includes("recent")) {
        setError("Please sign in again to verify your identity before deleting your account.")
      } else {
        setError(error.message || "Failed to delete account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    form.reset()
    setError(null)
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Trash2 className="w-5 h-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action is permanent and cannot be undone. 
            All your data will be permanently deleted.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>What will be deleted:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your account and authentication data</li>
            <li>Profile information and settings</li>
            <li>Order history and preferences</li>
            <li>Reviews and ratings you've submitted</li>
            <li>Business listings (if you're a business owner)</li>
          </ul>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full mt-4">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-700">Confirm Account Deletion</DialogTitle>
              <DialogDescription>
                This action is permanent. Please confirm you want to delete your account.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="confirmPhrase" className="text-red-700">
                  Type <code className="bg-red-100 px-1 rounded text-red-800">DELETE MY ACCOUNT</code> to confirm:
                </Label>
                <Input
                  id="confirmPhrase"
                  {...form.register("confirmPhrase")}
                  placeholder="DELETE MY ACCOUNT"
                  className={confirmPhrase === "DELETE MY ACCOUNT" ? "border-red-200 bg-red-50" : ""}
                />
                {form.formState.errors.confirmPhrase && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.confirmPhrase.message}
                  </p>
                )}
              </div>

              {!isOAuthUser && (
                <div>
                  <Label htmlFor="password">Confirm with Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      placeholder="Enter your password"
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
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deleteProfileData"
                  checked={deleteProfileData}
                  onCheckedChange={(checked) => form.setValue("deleteProfileData", checked as boolean)}
                />
                <Label htmlFor="deleteProfileData" className="text-sm">
                  Also delete all profile and business data
                </Label>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will permanently delete your account. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={isLoading || confirmPhrase !== "DELETE MY ACCOUNT"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}