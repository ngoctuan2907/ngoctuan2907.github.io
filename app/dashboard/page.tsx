"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Coffee, 
  Users, 
  Star, 
  TrendingUp, 
  Plus, 
  Settings, 
  Mail,
  BarChart3,
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  // Fetch user orders and favorites
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      
      setLoadingData(true)
      try {
        // Fetch orders and favorites in parallel
        const [ordersResponse, favoritesResponse] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/favorites')
        ])

        // Handle orders
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          if (ordersData.success) {
            setOrders(ordersData.orders || [])
          }
        }

        // Handle favorites  
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json()
          if (favoritesData.success) {
            setFavorites(favoritesData.favorites || [])
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const isBusinessOwner = userProfile.user_type === "business_owner"
  const isEmailVerified = user.email_confirmed_at !== null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <span className="font-bold text-lg text-gray-900">SG Home Eats</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {userProfile.first_name} {userProfile.last_name}
                </p>
                <Badge variant={isBusinessOwner ? "default" : "secondary"} className="text-xs">
                  {isBusinessOwner ? "Business Owner" : "Customer"}
                </Badge>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Email Verification Banner */}
        {!isEmailVerified && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Mail className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span>
                  Please verify your email address to access all features. Check your inbox for the verification link.
                </span>
                <Button variant="outline" size="sm" className="ml-4">
                  Resend Email
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile.first_name}! 👋
          </h1>
          <p className="text-gray-600">
            {isBusinessOwner 
              ? "Manage your food business and connect with customers"
              : "Discover amazing home-based cafes and place orders"
            }
          </p>
        </div>

        {/* Dashboard Content */}
        {isBusinessOwner ? (
          <BusinessOwnerDashboard userProfile={userProfile} isEmailVerified={isEmailVerified} />
        ) : (
          <CustomerDashboard 
            userProfile={userProfile} 
            orders={orders}
            favorites={favorites}
            loadingData={loadingData}
          />
        )}
      </div>
    </div>
  )
}

function BusinessOwnerDashboard({ userProfile, isEmailVerified }: { 
  userProfile: any, 
  isEmailVerified: boolean 
}) {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/businesses')
        const data = await response.json()
        
        if (data.success && data.businesses) {
          setBusinesses(data.businesses)
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error)
      } finally {
        setIsLoadingBusinesses(false)
      }
    }

    fetchBusinesses()
  }, [])

  const hasBusinesses = businesses.length > 0

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {hasBusinesses ? "Manage Business" : "List Your Cafe"}
                </p>
                <p className="text-xs text-orange-600">
                  {hasBusinesses ? "Go to dashboard" : "Get started now"}
                </p>
              </div>
              <Coffee className="w-8 h-8 text-orange-600" />
            </div>
            <Button 
              className="w-full mt-3 bg-orange-600 hover:bg-orange-700" 
              size="sm"
              disabled={!isEmailVerified}
              asChild
            >
              <Link href={hasBusinesses ? "/business-dashboard" : "/register-business"}>
                <Plus className="w-4 h-4 mr-2" />
                {hasBusinesses ? "Business Dashboard" : "Create Business"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Analytics</p>
                <p className="text-xs text-gray-600">View insights</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <Button variant="outline" className="w-full mt-3" size="sm" disabled>
              <TrendingUp className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Orders</p>
                <p className="text-xs text-gray-600">Manage orders</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <Button variant="outline" className="w-full mt-3" size="sm" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Profile</p>
                <p className="text-xs text-gray-600">Edit details</p>
              </div>
              <Settings className="w-8 h-8 text-gray-600" />
            </div>
            <Button variant="outline" className="w-full mt-3" size="sm" asChild>
              <Link href="/profile">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Businesses */}
      {!isLoadingBusinesses && hasBusinesses && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coffee className="w-5 h-5 mr-2 text-orange-600" />
              Your Businesses ({businesses.length})
            </CardTitle>
            <CardDescription>
              Manage your registered businesses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businesses.map((business) => (
                <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{business.business_name}</h4>
                    <p className="text-sm text-gray-600">{business.district} • {business.price_range}</p>
                    <Badge 
                      variant={business.status === 'active' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {business.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/cafe/${business.slug || business.id}`}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/business-dashboard">
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Setup Guide */}
      {!hasBusinesses && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coffee className="w-5 h-5 mr-2 text-orange-600" />
              Get Started with Your Business
            </CardTitle>
            <CardDescription>
              Follow these steps to set up your home-based cafe on SG Home Eats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {isEmailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                <span className={isEmailVerified ? "line-through text-gray-500" : "text-gray-900"}>
                  Verify your email address
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                <span className="text-gray-900">Create your business profile</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                <span className="text-gray-900">Add your menu items</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                <span className="text-gray-900">Go live and start receiving orders</span>
              </div>
            </div>

            {isEmailVerified && (
              <div className="mt-6 pt-4 border-t">
                <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href="/register-business">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Creating Your Business Profile
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Intended Business Name */}
      {userProfile.intended_business_name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Business Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You mentioned wanting to create: <strong>{userProfile.intended_business_name}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              You can use this name or choose a different one when creating your business profile.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CustomerDashboard({ 
  userProfile, 
  orders, 
  favorites, 
  loadingData 
}: { 
  userProfile: any,
  orders: any[],
  favorites: any[],
  loadingData: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Browse Cafes</p>
                <p className="text-xs text-blue-600">Discover new flavors</p>
              </div>
              <Coffee className="w-8 h-8 text-blue-600" />
            </div>
            <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700" size="sm" asChild>
              <Link href="/">
                <ExternalLink className="w-4 h-4 mr-2" />
                Explore Cafes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">My Orders</p>
                <p className="text-xs text-gray-600">
                  {loadingData ? "Loading..." : orders.length === 0 ? "No orders yet" : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <Button variant="outline" className="w-full mt-3" size="sm" asChild>
              <Link href="/orders">
                <Clock className="w-4 h-4 mr-2" />
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Favorites</p>
                <p className="text-xs text-gray-600">
                  {loadingData ? "Loading..." : favorites.length === 0 ? "No favorites yet" : `${favorites.length} saved cafe${favorites.length === 1 ? '' : 's'}`}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <Button variant="outline" className="w-full mt-3" size="sm" asChild>
              <Link href="/browse">
                <Star className="w-4 h-4 mr-2" />
                Browse Cafes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Profile</p>
                <p className="text-xs text-gray-600">Edit details</p>
              </div>
              <Settings className="w-8 h-8 text-gray-600" />
            </div>
            <Button variant="outline" className="w-full mt-3" size="sm" asChild>
              <Link href="/profile">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Cafes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Recommended for You
          </CardTitle>
          <CardDescription>
            Discover popular home-based cafes in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Start exploring amazing home-based cafes</p>
            <Button asChild>
              <Link href="/">
                <ExternalLink className="w-4 h-4 mr-2" />
                Browse All Cafes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
