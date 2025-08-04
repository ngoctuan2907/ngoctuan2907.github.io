'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) {
      // In real app, fetch order details from API
      // For now, show mock success data
      setTimeout(() => {
        setOrderDetails({
          orderNumber,
          totalAmount: 15.50,
          pickupTime: '15-20 minutes',
          businessName: 'The Local Brew',
          businessAddress: '123 Coffee Street, Singapore',
          businessPhone: '+65 9123 4567',
          items: [
            { name: 'Flat White', quantity: 2, price: 5.50 },
            { name: 'Croissant', quantity: 1, price: 4.50 }
          ]
        })
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [orderNumber])

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Order Not Found</CardTitle>
            <CardDescription>
              No order information was provided.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Success Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your order. We're preparing it now.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Order Number:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {orderDetails?.orderNumber}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Estimated Pickup:</span>
                <span className="text-orange-600 font-medium">
                  {orderDetails?.pickupTime}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-lg">
                  S${orderDetails?.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{orderDetails?.businessName}</h3>
              <p className="text-gray-600">{orderDetails?.businessAddress}</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{orderDetails?.businessPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderDetails?.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    S${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/orders" className="flex-1">
            <Button variant="outline" className="w-full">
              View All Orders
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>📱 <strong>SMS updates:</strong> You'll receive SMS notifications about your order status.</p>
              <p>⏰ <strong>Pickup time:</strong> Please arrive within 10 minutes of the estimated time.</p>
              <p>❓ <strong>Questions?</strong> Call the café directly or check your order status in the Orders page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
