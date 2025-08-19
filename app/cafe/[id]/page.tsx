"use client"

import { ArrowLeft, MapPin, Clock, Phone, Mail, Instagram, Star, Heart, Share2, MessageSquare, Map, Navigation, Plus, Minus, ShoppingCart, X, Coffee } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabaseClient"

export default function CafeProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [nearestLocations, setNearestLocations] = useState<any[]>([])
  const [cafe, setCafe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Cart state
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    pickupTime: '',
    notes: ''
  })
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)

  useEffect(() => {
    const fetchCafe = async () => {
      try {
        const response = await fetch(`/api/businesses/${params.id}`)
        const data = await response.json()
        
        if (response.ok && data.success && data.business) {
          // Transform API data to component format
          const business = data.business
          setCafe({
            id: business.id,
            name: business.business_name,
            owner: business.owner_name || "Business Owner",
            cuisine: business.business_cuisines?.map((bc: any) => bc.cuisine_types?.name).filter(Boolean) || ["Various"],
            location: business.district,
            fullAddress: business.full_address || `${business.district}, Singapore ${business.postal_code}`,
            rating: business.reviews?.length > 0 
              ? (business.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / business.reviews.length).toFixed(1)
              : 4.5,
            reviewCount: business.reviews?.length || 0,
            priceRange: business.price_range || "$$",
            isOpen: business.status === 'active',
            description: business.description || "A wonderful home-based cafe serving delicious meals.",
            specialty: business.specialty || "Authentic home-cooked meals",
            images: business.cover_image_url ? [business.cover_image_url] : ["/placeholder.svg?height=400&width=600"],
            menu: business.menu_items ? transformMenuItems(business.menu_items) : [],
            hours: transformBusinessHours(business.business_hours),
            contact: {
              phone: business.phone || "+65 1234 5678",
              email: business.email || "contact@business.com",
              instagram: business.instagram_handle || "@business_sg",
              whatsapp: business.whatsapp_number || business.phone || "+65 1234 5678",
            },
            coordinates: {
              lat: 1.3521, // Default Singapore coordinates
              lng: 103.8198,
            },
            reviews: business.reviews || [],
          })
        } else {
          throw new Error(data.error || 'Business not found')
        }
      } catch (err: any) {
        console.error('Failed to fetch business:', err)
        setError(err.message || 'Failed to load business details')
      } finally {
        setLoading(false)
      }
    }

    fetchCafe()
  }, [params.id])

  // Check if cafe is favorited when user and cafe are available
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !cafe) return
      
      try {
        const response = await fetch(`/api/favorites/${cafe.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setIsSaved(data.isFavorited)
          }
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }

    checkFavoriteStatus()
  }, [user, cafe])

  // Transform menu items from database format
  const transformMenuItems = (menuItems: any[]) => {
    if (!menuItems || menuItems.length === 0) {
      return [{
        category: 'Menu Items',
        items: [
          { id: 'sample-1', name: 'House Special', price: 12.80, description: 'Chef\'s recommended dish' },
          { id: 'sample-2', name: 'Daily Fresh', price: 8.50, description: 'Fresh ingredients prepared daily' },
        ]
      }]
    }

    const categories: { [key: string]: any[] } = {}
    
    menuItems.forEach(item => {
      const category = item.category || 'Menu Items'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push({
        id: item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        price: parseFloat(item.price) || 0,
        description: item.description || '',
      })
    })

    return Object.entries(categories).map(([category, items]) => ({
      category,
      items,
    }))
  }

  // Transform business hours from database format
  const transformBusinessHours = (businessHours: any[]) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const defaultHours: { [key: string]: string } = {
      Monday: "9:00 AM - 6:00 PM",
      Tuesday: "9:00 AM - 6:00 PM",
      Wednesday: "9:00 AM - 6:00 PM",
      Thursday: "9:00 AM - 6:00 PM",
      Friday: "9:00 AM - 6:00 PM",
      Saturday: "8:00 AM - 7:00 PM",
      Sunday: "Closed",
    }

    if (!businessHours || businessHours.length === 0) {
      return defaultHours
    }

    const hours: { [key: string]: string } = {}
    
    businessHours.forEach(hour => {
      const dayName = days[hour.day_of_week]
      if (hour.is_open) {
        hours[dayName] = `${hour.open_time} - ${hour.close_time}`
      } else {
        hours[dayName] = 'Closed'
      }
    })

    // Fill in missing days as closed or use defaults
    days.forEach(day => {
      if (!hours[day]) {
        hours[day] = defaultHours[day] || 'Closed'
      }
    })

    return hours
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cafe details...</p>
        </div>
      </div>
    )
  }

  if (error || !cafe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cafe Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The cafe you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Button asChild>
            <Link href="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Interactive functions
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save cafes to your favorites",
        variant: "destructive",
      })
      return
    }

    try {
      if (isSaved) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?business_id=${cafe.id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setIsSaved(false)
          toast({
            title: "Removed from favorites",
            description: `${cafe.name} removed from your saved cafes`,
          })
        } else {
          throw new Error('Failed to remove from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_id: cafe.id,
          }),
        })
        
        if (response.ok) {
          setIsSaved(true)
          toast({
            title: "Added to favorites",
            description: `${cafe.name} saved to your favorites`,
          })
        } else {
          const data = await response.json()
          if (response.status === 409) {
            // Already in favorites
            setIsSaved(true)
            toast({
              title: "Already in favorites",
              description: `${cafe.name} is already in your favorites`,
            })
          } else {
            throw new Error(data.error || 'Failed to add to favorites')
          }
        }
      }
    } catch (error) {
      console.error("Error saving cafe:", error)
      toast({
        title: "Error",
        description: "Failed to save cafe. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `${cafe.name} - ${cafe.specialty}`,
      text: `Check out ${cafe.name} in ${cafe.location}! ${cafe.description.slice(0, 100)}...`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "Cafe link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCallToOrder = () => {
    const phoneNumber = cafe.contact.phone.replace(/\s/g, "")
    window.open(`tel:${phoneNumber}`)
    toast({
      title: "Calling cafe",
      description: `Dialing ${cafe.contact.phone}`,
    })
  }

  const handleInstagram = () => {
    const instagramHandle = cafe.contact.instagram.replace("@", "")
    window.open(`https://instagram.com/${instagramHandle}`, "_blank")
    toast({
      title: "Opening Instagram",
      description: `Following ${cafe.contact.instagram}`,
    })
  }

  const handleOpenInMaps = () => {
    const encodedAddress = encodeURIComponent(cafe.fullAddress)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    window.open(mapsUrl, "_blank")
    toast({
      title: "Opening in Maps",
      description: "Directions to " + cafe.name,
    })
  }

  const handleWriteReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to write a review",
        variant: "destructive",
      })
      return
    }
    setIsReviewDialogOpen(true)
  }

  const submitReview = async () => {
    if (!reviewText.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingReview(true)
    try {
      // Here you would save the review to your database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback",
      })
      setIsReviewDialogOpen(false)
      setReviewText("")
      setReviewRating(5)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Cart functionality
  const addToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    
    toast({
      title: "Added to cart",
      description: `${item.name} added to your order`,
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
    toast({
      title: "Removed from cart",
      description: "Item removed from your order",
    })
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const clearCart = () => {
    setCart([])
    setIsCartOpen(false)
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
    })
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place an order",
        variant: "destructive",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      })
      return
    }

    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const processOrder = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your name and phone number",
        variant: "destructive",
      })
      return
    }

    setIsProcessingOrder(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          customerInfo,
          businessId: cafe.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process order')
      }

      toast({
        title: "Order placed successfully!",
        description: `Order ${result.orderNumber} has been confirmed`,
      })

      // Redirect to success page
      window.location.href = result.url
      
      // Clear form and cart
      setCart([])
      setCustomerInfo({
        name: '',
        phone: '',
        email: '',
        pickupTime: '',
        notes: ''
      })
      setIsCheckoutOpen(false)

    } catch (error) {
      console.error("Order processing error:", error)
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to process order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingOrder(false)
    }
  }

  // Get current day for showing today's hours
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const todayHours = cafe.hours[getCurrentDay() as keyof typeof cafe.hours]

  useEffect(() => {
    // Mock nearby locations - in real app, this would be a geolocation-based API call
    setNearestLocations([
      { name: "Toa Payoh Central", distance: "0.5 km", walkTime: "6 min" },
      { name: "Toa Payoh MRT Station", distance: "0.8 km", walkTime: "10 min" },
      { name: "HDB Hub", distance: "1.2 km", walkTime: "15 min" },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Browse</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={cafe.images[0] || "/placeholder.svg"}
                  alt={cafe.name}
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant={cafe.isOpen ? "default" : "secondary"} className="bg-white/90 text-gray-900">
                    {cafe.isOpen ? "Open Now" : "Closed"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {cafe.images.slice(1).map((image: string, index: number) => (
                  <Image
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`${cafe.name} ${index + 2}`}
                    width={200}
                    height={150}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{cafe.name}</h1>
                  <p className="text-lg text-orange-600 mb-2">{cafe.specialty}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{cafe.rating}</span>
                      <span className="ml-1">({cafe.reviewCount} reviews)</span>
                    </div>
                    <span>•</span>
                    <span>{cafe.priceRange}</span>
                    <span>•</span>
                    <div className="flex flex-wrap gap-1">
                      {cafe.cuisine.map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{cafe.description}</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-orange-600" />
                  <div>
                    <p className="font-medium">{cafe.fullAddress}</p>
                    <p className="text-sm text-gray-500">Home-based cafe in {cafe.location}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-orange-600" />
                  <div>
                    <p className="font-medium">Open today: {todayHours}</p>
                    <p className="text-sm text-gray-500">See all hours below</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-orange-600 hover:bg-orange-700 flex-1" onClick={handleCallToOrder}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call to Order
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleInstagram}>
                  <Instagram className="w-4 h-4 mr-2" />
                  Follow on Instagram
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Menu */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>
                  {cafe.menu.map((category: any, categoryIndex: number) => (
                    <div key={categoryIndex} className="mb-8 last:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h3>
                      <div className="space-y-4">
                        {category.items.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <span className="font-semibold text-orange-600 text-lg">S${item.price.toFixed(2)}</span>
                            </div>
                            <Button 
                              onClick={() => addToCart(item)}
                              className="bg-orange-600 hover:bg-orange-700 ml-4"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                      {categoryIndex < cafe.menu.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                    <Button variant="outline" size="sm" onClick={handleWriteReview}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {cafe.reviews.map((review: any, index: number) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{review.name}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm">{cafe.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm">{cafe.contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Instagram className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm">{cafe.contact.instagram}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Opening Hours</h3>
                  <div className="space-y-2">
                    {Object.entries(cafe.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600">{day}</span>
                        <span className={hours === "Closed" ? "text-red-600" : "text-gray-900"}>{String(hours)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    *Please call ahead to confirm availability as this is a home-based business
                  </p>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
                  <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Map placeholder</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{cafe.fullAddress}</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent mb-2" onClick={handleOpenInMaps}>
                    <Map className="w-4 h-4 mr-2" />
                    Open in Maps
                  </Button>
                  
                  {/* Nearest Locations */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Nearest Landmarks</h4>
                    <div className="space-y-1">
                      {nearestLocations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <Navigation className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="text-gray-600">{location.name}</span>
                          </div>
                          <div className="text-gray-500">
                            <span>{location.distance}</span>
                            <span className="ml-1">({location.walkTime} walk)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review for {cafe.name}</DialogTitle>
            <DialogDescription>
              Share your thoughts about this cafe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating" className="text-sm font-medium">Rating</Label>
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      star <= reviewRating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review" className="text-sm font-medium">Your Review</Label>
              <Textarea
                id="review"
                placeholder="Share your experience with this cafe..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitReview} 
                disabled={isSubmittingReview}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Your Order
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 hover:text-red-700">
                  Clear All
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Review your selected items before proceeding to checkout
            </DialogDescription>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add some delicious items from the menu!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-orange-600">S${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-orange-600">
                    S${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Please provide your details to complete the order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <h4 className="font-medium mb-2">Order Summary</h4>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-1">
                  <span>{item.name} x{item.quantity}</span>
                  <span>S${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold">
                Total: S${getCartTotal().toFixed(2)}
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="customer-name">Name *</Label>
                <Input
                  id="customer-name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="customer-phone">Phone Number *</Label>
                <Input
                  id="customer-phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  placeholder="+65 9123 4567"
                />
              </div>
              
              <div>
                <Label htmlFor="customer-email">Email (Optional)</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="pickup-time">Preferred Pickup Time</Label>
                <Select value={customerInfo.pickupTime} onValueChange={(value) => setCustomerInfo({...customerInfo, pickupTime: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                    <SelectItem value="30min">In 30 minutes</SelectItem>
                    <SelectItem value="1hour">In 1 hour</SelectItem>
                    <SelectItem value="2hours">In 2 hours</SelectItem>
                    <SelectItem value="later">Later today</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                  placeholder="Any special requests or dietary requirements..."
                  rows={2}
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="border rounded-lg p-3 bg-blue-50">
              <p className="text-sm text-blue-800">
                💳 <strong>Payment:</strong> This is a demo order. No real payment will be processed.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="flex-1">
                Back to Cart
              </Button>
              <Button 
                onClick={processOrder}
                disabled={isProcessingOrder}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isProcessingOrder ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
