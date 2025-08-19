"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Eye, Users, Star, DollarSign, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '@/lib/auth-context'

interface AnalyticsData {
  businessId: string
  businessName: string
  range: {
    from: string
    to: string
    timezone: string
  }
  kpis: {
    orders: number
    revenue: number
    aov: number
    totalViews: number
    averageRating: number
    ordersChange: number
    revenueChange: number
    viewsChange: number
  }
  revenueByMonth: Array<{ month: string; revenue: number }>
  topProducts: Array<{ item_name: string; total_orders: number; total_revenue: number }>
  dowHistogram: Array<{ dow: number; orders: number; revenue: number }>
  hourHistogram: Array<{ hour: number; orders: number; revenue: number }>
  dailyStats: Array<{ date: string; orders: number; revenue: number }>
  customerStats: {
    new_customers: number
    returning_customers: number
    total_customers: number
  }
}

export default function BusinessAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [businessData, setBusinessData] = useState<any>(null)
  const [period, setPeriod] = useState("30")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Fetch business data first
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user) return

      try {
        const businessResponse = await fetch('/api/businesses')
        if (businessResponse.ok) {
          const data = await businessResponse.json()
          if (data.businesses && data.businesses.length > 0) {
            setBusinessData(data.businesses[0])
          } else {
            setError('No business found. Please register your business first.')
          }
        } else {
          setError('Failed to load business data')
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error)
        setError('Failed to load business data')
      }
    }

    fetchBusinessData()
  }, [user])

  // Fetch analytics data when business data is loaded
  useEffect(() => {
    if (businessData?.id) {
      fetchAnalytics()
    }
  }, [businessData?.id, period])

  const fetchAnalytics = async () => {
    if (!businessData?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/stats/business/${businessData.id}?period=${period}`)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return null
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getDayName = (dow: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dow] || 'Unknown'
  }

  const formatHour = (hour: number) => {
    const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${h}:00 ${ampm}`
  }

  // Don't redirect during auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
              <p className="text-gray-600">Track your business performance and insights</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="text-red-600 text-xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Analytics</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
              <p className="text-gray-600">{analyticsData.businessName} • {new Date(analyticsData.range.from).toLocaleDateString()} - {new Date(analyticsData.range.to).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.totalViews.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-sm ${getChangeColor(analyticsData.kpis.viewsChange)}`}>
                    {getChangeIcon(analyticsData.kpis.viewsChange)}
                    <span>{Math.abs(analyticsData.kpis.viewsChange)}% from last period</span>
                  </div>
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
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.orders}</p>
                  <div className={`flex items-center gap-1 text-sm ${getChangeColor(analyticsData.kpis.ordersChange)}`}>
                    {getChangeIcon(analyticsData.kpis.ordersChange)}
                    <span>{Math.abs(analyticsData.kpis.ordersChange)}% from last period</span>
                  </div>
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
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.kpis.revenue)}</p>
                  <div className={`flex items-center gap-1 text-sm ${getChangeColor(analyticsData.kpis.revenueChange)}`}>
                    {getChangeIcon(analyticsData.kpis.revenueChange)}
                    <span>{Math.abs(analyticsData.kpis.revenueChange)}% from last period</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.kpis.aov)}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{analyticsData.kpis.averageRating} avg rating</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Customers</span>
                  <Badge variant="default">{analyticsData.customerStats.new_customers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Returning Customers</span>
                  <Badge variant="secondary">{analyticsData.customerStats.returning_customers}</Badge>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Customer Retention Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.customerStats.total_customers > 0 
                      ? Math.round((analyticsData.customerStats.returning_customers / analyticsData.customerStats.total_customers) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topProducts.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.item_name}</div>
                      <div className="text-sm text-gray-600">{item.total_orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{formatCurrency(item.total_revenue)}</div>
                    </div>
                  </div>
                ))}
                {analyticsData.topProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No menu items data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Day of Week Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.dowHistogram.map((day, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{getDayName(day.dow)}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{day.orders} orders</span>
                      <span className="text-sm text-green-600">{formatCurrency(day.revenue)}</span>
                    </div>
                  </div>
                ))}
                {analyticsData.dowHistogram.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No day-of-week data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.hourHistogram
                  .filter(h => h.orders > 0)
                  .sort((a, b) => b.orders - a.orders)
                  .slice(0, 8)
                  .map((hour, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{formatHour(hour.hour)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{hour.orders} orders</span>
                        <span className="text-sm text-green-600">{formatCurrency(hour.revenue)}</span>
                      </div>
                    </div>
                  ))}
                {analyticsData.hourHistogram.filter(h => h.orders > 0).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hourly data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Daily Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Performance ({period} days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-4 text-xs font-medium text-gray-600">
              <div>Date</div>
              <div>Orders</div>
              <div>Revenue</div>
              <div>Avg. Order</div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {analyticsData.dailyStats.slice(-10).map((day, index) => {
                const avgOrderValue = day.orders > 0 ? day.revenue / day.orders : 0
                return (
                  <div key={index} className="grid grid-cols-4 gap-2 text-sm py-2 border-b">
                    <div>{new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</div>
                    <div>{day.orders}</div>
                    <div>{formatCurrency(day.revenue)}</div>
                    <div>{formatCurrency(avgOrderValue)}</div>
                  </div>
                )
              })}
              {analyticsData.dailyStats.length === 0 && (
                <p className="text-gray-500 text-center py-4">No daily performance data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        {analyticsData.revenueByMonth.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.revenueByMonth.map((month, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{month.month}</span>
                    <span className="text-lg font-medium text-green-600">{formatCurrency(month.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights & Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Performance Highlights</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Total orders: {analyticsData.kpis.orders}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Customer retention: {analyticsData.customerStats.total_customers > 0 
                      ? Math.round((analyticsData.customerStats.returning_customers / analyticsData.customerStats.total_customers) * 100)
                      : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Average order value: {formatCurrency(analyticsData.kpis.aov)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Average rating: {analyticsData.kpis.averageRating}/5.0</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Growth Opportunities</h4>
                <div className="space-y-2">
                  {analyticsData.topProducts.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>{analyticsData.topProducts[0].item_name} is your top performer</span>
                    </div>
                  ) : null}
                  {analyticsData.kpis.viewsChange > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Views are trending up ({analyticsData.kpis.viewsChange}% increase)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Focus on increasing visibility to drive more views</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Encourage customer reviews to boost ratings</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}