'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  amount_total: number
  currency: string
  payment_status: string
  status: string
  stripe_payment_intent_id?: string
  stripe_checkout_session_id?: string
  created_at: string
  businesses: {
    business_name: string
  }
}

interface TestOrder {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  customerInfo: {
    name: string
    phone: string
    email?: string
    notes?: string
  }
  businessId: string
}

export default function TestPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Mock business ID - in real app this would come from user's business
  const TEST_BUSINESS_ID = "123e4567-e89b-12d3-a456-426614174000"

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders.slice(0, 10)) // Show last 10 orders
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const createTestOrder = async () => {
    try {
      setCreating(true)
      setError(null)
      setSuccess(null)

      // Create a test order with mock items
      const testOrder: TestOrder = {
        items: [
          {
            id: "item-1",
            name: "Test Latte",
            price: 5.50,
            quantity: 1
          },
          {
            id: "item-2", 
            name: "Test Croissant",
            price: 3.50,
            quantity: 2
          }
        ],
        customerInfo: {
          name: "Test Customer",
          phone: "+65 9123 4567",
          email: "test@example.com",
          notes: "Test order for Stripe integration"
        },
        businessId: TEST_BUSINESS_ID
      }

      // This would fail in real environment since we don't have real menu items
      // but it will help us test the API structure
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testOrder)
      })

      const data = await response.json()

      if (data.success && data.checkout_url) {
        // Open Stripe Checkout in a new tab
        window.open(data.checkout_url, '_blank')
        setSuccess(`Test order created: ${data.order_number}`)
        
        // Refresh orders list after a short delay
        setTimeout(fetchOrders, 2000)
      } else {
        setError(data.error || 'Failed to create test order')
      }
    } catch (err) {
      console.error('Failed to create test order:', err)
      setError('Failed to create test order')
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'default'
      case 'requires_payment':
        return 'secondary'
      case 'failed':
        return 'destructive'
      case 'refunded':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4" />
      case 'requires_payment':
        return <CreditCard className="h-4 w-4" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      case 'refunded':
        return <RefreshCw className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatAmount = (amount: number, currency: string = 'sgd') => {
    // Convert from cents to dollars
    const dollars = amount / 100
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(dollars)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Test Payments (Stripe Test Mode)</h1>
          <p className="text-muted-foreground mt-2">
            Test the Stripe integration end-to-end with test orders and payments.
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Test Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>
              Create test orders and process payments through Stripe test mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={createTestOrder} 
                disabled={creating}
                className="flex items-center gap-2"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Create Test Order
              </Button>
              
              <Button 
                onClick={fetchOrders} 
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh Orders
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Test Cards:</strong></p>
              <ul className="list-disc list-inside mt-2">
                <li>Success: 4242 4242 4242 4242</li>
                <li>Requires Authentication: 4000 0025 0000 3155</li>
                <li>Declined: 4000 0000 0000 9995</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Last 10 orders with their payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No orders found. Create a test order to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getStatusBadgeVariant(order.payment_status)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(order.payment_status)}
                          {order.payment_status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-medium">
                          {formatAmount(order.amount_total || order.total_amount * 100, order.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Order Status:</span>
                        <p className="font-medium">{order.status}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Intent:</span>
                        <p className="font-mono text-xs">
                          {order.stripe_payment_intent_id 
                            ? `${order.stripe_payment_intent_id.substring(0, 20)}...`
                            : 'None'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Session:</span>
                        <p className="font-mono text-xs">
                          {order.stripe_checkout_session_id 
                            ? `${order.stripe_checkout_session_id.substring(0, 20)}...`
                            : 'None'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}