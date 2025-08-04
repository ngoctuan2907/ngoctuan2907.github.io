"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  // Mock orders data - in real app, this would be fetched from API
  const orders = [
    {
      id: "ORD-001",
      cafeName: "Ah Ma's Kitchen",
      orderDate: "2025-01-02",
      status: "completed",
      total: 28.50,
      items: ["Kueh Lapis x2", "Ondeh Ondeh x3", "Laksa Lemak x1"]
    },
    {
      id: "ORD-002", 
      cafeName: "Brew & Bite",
      orderDate: "2025-01-01",
      status: "preparing",
      total: 45.00,
      items: ["Artisan Coffee x2", "Avocado Toast x1", "Breakfast Bowl x1"]
    },
    {
      id: "ORD-003",
      cafeName: "Spice Route Home", 
      orderDate: "2024-12-30",
      status: "cancelled",
      total: 22.00,
      items: ["Butter Chicken x1", "Garlic Naan x2"]
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'preparing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />Preparing</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            Track your orders and reorder your favorites
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.cafeName}</CardTitle>
                      <p className="text-sm text-gray-600">Order #{order.id} • {order.orderDate}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-semibold text-gray-900 mt-1">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items Ordered:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">• {item}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-3 border-t">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'completed' && (
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Reorder
                        </Button>
                      )}
                      {order.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          Write Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring amazing home cafes and place your first order!
            </p>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/browse">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Cafes
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
