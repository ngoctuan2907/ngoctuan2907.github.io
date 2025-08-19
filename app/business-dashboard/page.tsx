"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Users, Star, TrendingUp, Edit, Eye, MessageSquare, Calendar, DollarSign, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/lib/auth-context'
import { useToast } from "@/components/ui/use-toast"

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [businessData, setBusinessData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user) return

      try {
        const businessResponse = await fetch('/api/businesses')
        if (businessResponse.ok) {
          const data = await businessResponse.json()
          if (data.businesses && data.businesses.length > 0) {
            setBusinessData(data.businesses[0]) // Use the first business
          }
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchBusinessData()
  }, [user])

  const handleUpdateMenu = () => {
    // Navigate to menu management page
    router.push('/business-dashboard/menu')
  }

  const handleSetHours = () => {
    // Navigate to business hours management page
    router.push('/business-dashboard/hours')
  }

  const handleReplyToReviews = () => {
    // Navigate to reviews management page
    router.push('/business-dashboard/reviews')
  }

    const handleViewAnalytics = () => {
    // Navigate to analytics page
    router.push('/business-dashboard/analytics')
  }

    const handleViewPublicProfile = () => {
    // Navigate to public profile if business has a slug
    if (businessInfo.slug) {
      window.open(`/cafe/${businessInfo.slug}`, '_blank')
    } else {
      toast({
        title: "Public Profile Not Available",
        description: "Complete your business setup to view your public profile.",
      })
    }
  }

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Business profile editing feature coming soon!",
    })
    // TODO: Navigate to business profile edit page
    // router.push('/business-dashboard/edit-profile')
  }

  // Don't redirect during auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/signin')
    return null
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const businessInfo = businessData || {
    business_name: "Your Business",
    status: "pending",
    slug: null,
    totalViews: 0,
    totalOrders: 0,
    rating: 0,
    totalReviews: 0,
    monthlyRevenue: 0
  }

  const recentReviews = [
    {
      customer: "Sarah T.",
      rating: 5,
      date: "2 days ago",
      comment: "Amazing authentic Peranakan food! The kueh lapis was exactly like my grandmother used to make.",
    },
    {
      customer: "David L.",
      rating: 5,
      date: "1 week ago",
      comment: "Best laksa lemak I've had in Singapore! The flavors are so rich and authentic.",
    },
    {
      customer: "Michelle C.",
      rating: 4,
      date: "2 weeks ago",
      comment: "Love supporting local home businesses. The ondeh ondeh was perfect!",
    },
  ]

  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "John D.",
      items: "Kueh Lapis x2, Laksa Lemak x1",
      amount: "$18.80",
      status: "Completed",
      date: "Today, 2:30 PM",
    },
    {
      id: "#ORD-002",
      customer: "Lisa W.",
      items: "Ondeh Ondeh x6, Kueh Salat x2",
      amount: "$17.20",
      status: "Preparing",
      date: "Today, 1:15 PM",
    },
    {
      id: "#ORD-003",
      customer: "Ahmad R.",
      items: "Ayam Buah Keluak x1, Mee Siam x1",
      amount: "$24.30",
      status: "Ready",
      date: "Today, 12:45 PM",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's how your cafe is performing.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {businessData.status}
              </Badge>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900">{businessInfo.totalViews?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{businessInfo.totalOrders || 0}</p>
                    <p className="text-sm text-green-600">+8% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{businessInfo.rating || 0}</p>
                    <p className="text-sm text-gray-600">{businessInfo.totalReviews || 0} reviews</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${businessInfo.monthlyRevenue || 0}</p>
                    <p className="text-sm text-green-600">+15% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Orders
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{order.id}</span>
                              <Badge
                                variant={
                                  order.status === "Completed"
                                    ? "default"
                                    : order.status === "Ready"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={
                                  order.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "Ready"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                            <p className="text-sm text-gray-500">{order.items}</p>
                            <p className="text-xs text-gray-400">{order.date}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">{order.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Reviews
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentReviews.map((review, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{review.customer}</span>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <Edit className="w-6 h-6 mb-2" />
                      Update Menu
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <Calendar className="w-6 h-6 mb-2" />
                      Set Hours
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <MessageSquare className="w-6 h-6 mb-2" />
                      Reply to Reviews
                    </Button>
                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <BarChart3 className="w-6 h-6 mb-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders
                      .concat([
                        {
                          id: "#ORD-004",
                          customer: "Rachel K.",
                          items: "Babi Pongteh x1, Kueh Lapis x3",
                          amount: "$20.00",
                          status: "Completed",
                          date: "Yesterday, 4:20 PM",
                        },
                        {
                          id: "#ORD-005",
                          customer: "Marcus T.",
                          items: "Ang Ku Kueh x4, Ondeh Ondeh x8",
                          amount: "$22.40",
                          status: "Completed",
                          date: "Yesterday, 2:15 PM",
                        },
                      ])
                      .map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{order.id}</span>
                              <Badge
                                variant={
                                  order.status === "Completed"
                                    ? "default"
                                    : order.status === "Ready"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={
                                  order.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "Ready"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                            <p className="text-sm text-gray-500">{order.items}</p>
                            <p className="text-xs text-gray-400">{order.date}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">{order.amount}</p>
                            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentReviews
                      .concat([
                        {
                          customer: "Jennifer L.",
                          rating: 5,
                          date: "3 weeks ago",
                          comment: "Mrs. Lim's cooking reminds me of my childhood. The ayam buah keluak is incredible!",
                        },
                        {
                          customer: "Kevin S.",
                          rating: 4,
                          date: "1 month ago",
                          comment:
                            "Great authentic Peranakan food. The kueh salat was a bit sweet for my taste but overall excellent.",
                        },
                      ])
                      .map((review, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{review.customer}</span>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{review.comment}</p>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Views Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Chart placeholder - Profile views by month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Popular Menu Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Kueh Lapis</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Laksa Lemak</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                          </div>
                          <span className="text-sm font-medium">72%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ondeh Ondeh</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "68%" }}></div>
                          </div>
                          <span className="text-sm font-medium">68%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ayam Buah Keluak</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                          </div>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Growing Popularity</h4>
                      <p className="text-sm text-gray-600">Your profile views increased by 23% this month</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Excellent Reviews</h4>
                      <p className="text-sm text-gray-600">Maintaining a 4.8-star average rating</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-8 h-8 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Loyal Customers</h4>
                      <p className="text-sm text-gray-600">40% of orders are from repeat customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
