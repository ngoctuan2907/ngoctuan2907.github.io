"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Coffee, Users, Star, TrendingUp } from "lucide-react"

export default function GetStartedPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"customer" | "business_owner" | null>(null)

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/auth/signup?type=${selectedType}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join SG Home Eats
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your account type to get started with Singapore's home-based cafe marketplace
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Customer Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedType === "customer" 
                ? "ring-2 ring-orange-500 bg-orange-50" 
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedType("customer")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">I'm a Food Lover</CardTitle>
              <CardDescription className="text-base">
                Discover and order from amazing home-based cafes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Browse and review local cafes
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Coffee className="w-4 h-4 mr-2 text-orange-500" />
                  Order authentic home-cooked meals
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Connect with passionate home chefs
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Easy ordering</Badge>
                <Badge variant="secondary" className="text-xs">Authentic flavors</Badge>
                <Badge variant="secondary" className="text-xs">Community-driven</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Business Owner Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedType === "business_owner" 
                ? "ring-2 ring-orange-500 bg-orange-50" 
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedType("business_owner")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Coffee className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">I'm a Home Chef</CardTitle>
              <CardDescription className="text-base">
                Share your culinary passion and build your food business
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Grow your food business
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Build a loyal customer base
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Showcase your unique recipes
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Business tools</Badge>
                <Badge variant="secondary" className="text-xs">Order management</Badge>
                <Badge variant="secondary" className="text-xs">Analytics</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
          >
            Continue as {selectedType === "customer" ? "Food Lover" : selectedType === "business_owner" ? "Home Chef" : "..."}
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
