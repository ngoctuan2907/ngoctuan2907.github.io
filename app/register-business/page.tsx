"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Camera, Plus, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

interface FormData {
  business_name: string
  owner_name: string
  description: string
  cuisine_types: string[]
  phone: string
  email: string
  full_address: string
  district: string
  postal_code: string
  price_range: string
  business_hours: Array<{
    day_of_week: number
    is_open: boolean
    open_time: string
    close_time: string
  }>
  special_notes: string
  menu_items: Array<{
    name: string
    price: string
    description: string
  }>
  specialty: string
  cover_image_url: string
  instagram_handle: string
  facebook_url: string
  whatsapp_number: string
  additional_info: string
}

export default function RegisterBusinessPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // State machine for UI state
  const [uiState, setUiState] = useState<'loading' | 'guest' | 'needs-subscription' | 'form' | 'error' | 'timeout'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [formData, setFormData] = useState<FormData>({
    business_name: '',
    owner_name: '',
    description: '',
    cuisine_types: [],
    phone: '',
    email: '',
    full_address: '',
    district: '',
    postal_code: '',
    price_range: '',
    business_hours: Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i === 0 ? 0 : i, // Sunday = 0, Monday = 1, etc.
      is_open: false,
      open_time: '09:00',
      close_time: '18:00'
    })),
    special_notes: '',
    menu_items: [{ name: '', price: '', description: '' }],
    specialty: '',
    cover_image_url: '',
    instagram_handle: '',
    facebook_url: '',
    whatsapp_number: '',
    additional_info: ''
  })

  // Handle authentication and profile creation with finite state machine
  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const determineUIState = async () => {
      if (authLoading) return

      // Set timeout guard (8 seconds)
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          setUiState('timeout')
          setErrorMessage('Loading took too long. Please refresh and try again.')
        }
      }, 8000)

      try {
        // State 1: Guest (not authenticated)
        if (!user) {
          clearTimeout(timeoutId)
          if (!cancelled) {
            setUiState('guest')
          }
          return
        }

        // For now, let's simplify: if user is authenticated and has profile, show form
        // TODO: Add proper subscription check via /api/stripe/subscription
        
        // If no profile exists, bootstrap it
        if (!userProfile) {
          const bootstrapResponse = await fetch('/api/auth/bootstrap-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (bootstrapResponse.ok) {
            // Refresh to get new profile
            window.location.reload()
            return
          } else {
            throw new Error('Failed to bootstrap profile')
          }
        }

        // State 2: Check if business owner already has a business
        if (userProfile?.user_type === 'business_owner') {
          // Check if already has a business
          const businessResponse = await fetch('/api/businesses')
          if (businessResponse.ok) {
            const businessData = await businessResponse.json()
            if (businessData.businesses?.length > 0) {
              toast({
                title: "Business Already Registered",
                description: "You already have a business. Redirecting to dashboard.",
              })
              router.push('/business-dashboard')
              return
            }
          }

          // State 3: Show form
          clearTimeout(timeoutId)
          if (!cancelled) {
            setUiState('form')
          }
        } else {
          // Regular user - show form directly for now
          clearTimeout(timeoutId)
          if (!cancelled) {
            setUiState('form')
          }
        }
      } catch (error) {
        console.error('Error determining UI state:', error)
        clearTimeout(timeoutId)
        if (!cancelled) {
          setUiState('error')
          setErrorMessage('Failed to load business registration. Please try again.')
        }
      }
    }

    determineUIState()
    return () => { 
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [user, userProfile, authLoading, router, toast])

  // Render based on UI state
  if (uiState === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (uiState === 'guest') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to register your business</p>
          <Button asChild>
            <Link href="/auth/signin?next=/register-business">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (uiState === 'needs-subscription') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Subscription Required</h1>
          <p className="text-gray-600 mb-6">
            You need an active business subscription to register a home cafe
          </p>
          <Button asChild>
            <Link href="/pricing">View Pricing & Subscribe</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (uiState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (uiState === 'timeout') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Timeout</h1>
          <p className="text-gray-600 mb-6">Loading took too long. Please refresh and try again.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    )
  }

  // If we get here, uiState should be 'form'

  const cuisineTypes = [
    "Local Singaporean",
    "Chinese",
    "Malay",
    "Indian",
    "Peranakan",
    "Western",
    "Japanese",
    "Korean",
    "Thai",
    "Vietnamese",
    "Italian",
    "Mexican",
    "Fusion",
  ]

  const addMenuItem = () => {
    setFormData(prev => ({
      ...prev,
      menu_items: [...prev.menu_items, { name: "", price: "", description: "" }]
    }))
  }

  const removeMenuItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      menu_items: prev.menu_items.filter((_, i) => i !== index)
    }))
  }

  const updateMenuItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      menu_items: prev.menu_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const toggleCuisine = (cuisine: string) => {
    const newSelectedCuisines = selectedCuisines.includes(cuisine) 
      ? selectedCuisines.filter(c => c !== cuisine)
      : [...selectedCuisines, cuisine]
    
    setSelectedCuisines(newSelectedCuisines)
    setFormData(prev => ({
      ...prev,
      cuisine_types: newSelectedCuisines
    }))
  }

  const steps = [
    { number: 1, title: "Basic Information", description: "Tell us about your cafe" },
    { number: 2, title: "Location & Hours", description: "Where and when you operate" },
    { number: 3, title: "Menu & Pricing", description: "Showcase your offerings" },
    { number: 4, title: "Photos & Final Details", description: "Make your listing shine" },
  ]

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateBusinessHour = (dayIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      business_hours: prev.business_hours.map((hour, i) => 
        i === dayIndex ? { ...hour, [field]: value } : hour
      )
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.business_name && formData.description && 
                 selectedCuisines.length > 0 && formData.phone && formData.email)
      case 2:
        return !!(formData.full_address && formData.district && formData.postal_code &&
                 formData.price_range)
      case 3:
        return formData.menu_items.some(item => item.name && item.price)
      case 4:
        return true // Optional step
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Convert menu items with proper types
      const menuItems = formData.menu_items
        .filter(item => item.name && item.price)
        .map(item => ({
          name: item.name,
          price: parseFloat(item.price) || 0,
          description: item.description || ''
        }))

      // Prepare business data
      const businessData = {
        business_name: formData.business_name,
        description: formData.description,
        full_address: formData.full_address,
        district: formData.district,
        postal_code: formData.postal_code,
        phone: formData.phone,
        email: formData.email,
        price_range: formData.price_range as '$' | '$$' | '$$$' | '$$$$',
        cuisine_types: formData.cuisine_types,
        specialty: formData.specialty || undefined,
        instagram_handle: formData.instagram_handle || undefined,
        facebook_url: formData.facebook_url || undefined,
        whatsapp_number: formData.whatsapp_number || undefined,
        cover_image_url: formData.cover_image_url || undefined,
        business_hours: formData.business_hours,
        menu_items: menuItems
      }

      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: result.message || "Business registered successfully",
        })
        router.push('/business-dashboard')
      } else {
        throw new Error(result.error || 'Failed to register business')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setErrorMessage(err.message || 'Failed to register business')
      toast({
        title: "Registration Failed",
        description: err.message || "Please try again or contact support",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <span className="font-bold text-lg text-gray-900">SG Home Eats</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step.number ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-1 mx-4 ${currentStep > step.number ? "bg-orange-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep - 1].title}</h1>
              <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input 
                        id="businessName" 
                        value={formData.business_name}
                        onChange={(e) => updateFormData('business_name', e.target.value)}
                        placeholder="e.g., Ah Ma's Kitchen" 
                        className="mt-2" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input 
                        id="ownerName" 
                        value={formData.owner_name}
                        onChange={(e) => updateFormData('owner_name', e.target.value)}
                        placeholder="Your full name" 
                        className="mt-2" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Tell customers about your story, specialties, and what makes your cafe unique..."
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Cuisine Types *</Label>
                    <p className="text-sm text-gray-600 mb-4">Select all that apply to your offerings</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {cuisineTypes.map((cuisine) => (
                        <div key={cuisine} className="flex items-center space-x-2">
                          <Checkbox
                            id={cuisine}
                            checked={selectedCuisines.includes(cuisine)}
                            onCheckedChange={() => toggleCuisine(cuisine)}
                          />
                          <Label htmlFor={cuisine} className="text-sm">
                            {cuisine}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedCuisines.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedCuisines.map((cuisine) => (
                          <Badge key={cuisine} variant="secondary">
                            {cuisine}
                            <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleCuisine(cuisine)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="+65 9123 4567" 
                        className="mt-2" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="hello@yourbusiness.com" 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="address">Full Address *</Label>
                    <Input
                      id="address"
                      value={formData.full_address}
                      onChange={(e) => updateFormData('full_address', e.target.value)}
                      placeholder="Blk 123 Toa Payoh Lorong 1, #01-456"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">Include block number and unit number</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="district">District/Area *</Label>
                      <Select value={formData.district} onValueChange={(value) => updateFormData('district', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="central">Central</SelectItem>
                          <SelectItem value="north">North</SelectItem>
                          <SelectItem value="south">South</SelectItem>
                          <SelectItem value="east">East</SelectItem>
                          <SelectItem value="west">West</SelectItem>
                          <SelectItem value="northeast">Northeast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postal_code}
                        onChange={(e) => updateFormData('postal_code', e.target.value)}
                        placeholder="310123"
                        className="mt-2"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priceRange">Price Range *</Label>
                      <Select value={formData.price_range} onValueChange={(value) => updateFormData('price_range', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="$">$ (Under $10 per person)</SelectItem>
                          <SelectItem value="$$">$$ ($10-20 per person)</SelectItem>
                          <SelectItem value="$$$">$$$ ($20-35 per person)</SelectItem>
                          <SelectItem value="$$$$">$$$$ (Above $35 per person)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Operating Hours *</Label>
                    <div className="mt-4 space-y-4">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, dayIndex) => {
                        const dayData = formData.business_hours[dayIndex];
                        return (
                          <div key={day} className="flex items-center space-x-4">
                            <div className="w-24">
                              <Label className="text-sm">{day}</Label>
                            </div>
                            <Checkbox 
                              id={`${day}-open`}
                              checked={dayData.is_open}
                              onCheckedChange={(checked) => updateBusinessHour(dayIndex, 'is_open', checked)}
                            />
                            <Label htmlFor={`${day}-open`} className="text-sm">
                              Open
                            </Label>
                            <Input 
                              placeholder="09:00" 
                              className="w-24"
                              value={dayData.open_time}
                              onChange={(e) => updateBusinessHour(dayIndex, 'open_time', e.target.value)}
                              disabled={!dayData.is_open}
                            />
                            <span className="text-gray-500">to</span>
                            <Input 
                              placeholder="18:00" 
                              className="w-24"
                              value={dayData.close_time}
                              onChange={(e) => updateBusinessHour(dayIndex, 'close_time', e.target.value)}
                              disabled={!dayData.is_open}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialNotes">Special Notes</Label>
                    <Textarea
                      id="specialNotes"
                      value={formData.special_notes}
                      onChange={(e) => updateFormData('special_notes', e.target.value)}
                      placeholder="e.g., Please call ahead, Closed during public holidays, etc."
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Menu Items *</Label>
                    <p className="text-sm text-gray-600 mb-4">Add your signature dishes and popular items</p>

                    {formData.menu_items.map((item, index) => (
                      <Card key={index} className="mb-4">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">Item {index + 1}</h4>
                            {formData.menu_items.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMenuItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`item-name-${index}`}>Item Name *</Label>
                              <Input
                                id={`item-name-${index}`}
                                value={item.name}
                                onChange={(e) => updateMenuItem(index, "name", e.target.value)}
                                placeholder="e.g., Kaya Toast Set"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`item-price-${index}`}>Price *</Label>
                              <Input
                                id={`item-price-${index}`}
                                value={item.price}
                                onChange={(e) => updateMenuItem(index, "price", e.target.value)}
                                placeholder="e.g., $6.80"
                                className="mt-1"
                              />
                            </div>
                            <div className="md:col-span-1">
                              <Label htmlFor={`item-description-${index}`}>Description</Label>
                              <Input
                                id={`item-description-${index}`}
                                value={item.description}
                                onChange={(e) => updateMenuItem(index, "description", e.target.value)}
                                placeholder="Brief description"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button variant="outline" onClick={addMenuItem} className="w-full border-dashed bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Item
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="specialties">Signature Specialties</Label>
                    <Input
                      id="specialties"
                      value={formData.specialty}
                      onChange={(e) => updateFormData('specialty', e.target.value)}
                      placeholder="e.g., Homemade Kaya, Traditional Nyonya Kueh"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">What are you most known for?</p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Business Photos</Label>
                    <p className="text-sm text-gray-600 mb-4">Upload photos of your food, setup, and workspace</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Cover Photo *</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Click to upload your main photo</p>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                        </div>
                      </div>

                      <div>
                        <Label>Additional Photos</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Upload more photos</p>
                          <p className="text-sm text-gray-500 mt-1">Up to 10 photos</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="socialMedia">Social Media (Optional)</Label>
                    <div className="mt-2 space-y-3">
                      <Input 
                        value={formData.instagram_handle}
                        onChange={(e) => updateFormData('instagram_handle', e.target.value)}
                        placeholder="Instagram: @yourbusiness" 
                      />
                      <Input 
                        value={formData.facebook_url}
                        onChange={(e) => updateFormData('facebook_url', e.target.value)}
                        placeholder="Facebook: facebook.com/yourbusiness" 
                      />
                      <Input 
                        value={formData.whatsapp_number}
                        onChange={(e) => updateFormData('whatsapp_number', e.target.value)}
                        placeholder="WhatsApp: +65 9123 4567" 
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additional_info}
                      onChange={(e) => updateFormData('additional_info', e.target.value)}
                      placeholder="Any other details customers should know? Dietary options, special services, etc."
                      className="mt-2"
                    />
                  </div>

                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">Ready to Launch!</h3>
                    <p className="text-orange-800 text-sm">
                      Once you submit, our team will review your listing within 24 hours. You'll receive an email
                      confirmation and can start managing your profile through the business dashboard.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={() => {
                      if (validateStep(currentStep)) {
                        setCurrentStep(Math.min(4, currentStep + 1))
                      } else {
                        toast({
                          title: "Incomplete Information",
                          description: "Please fill in all required fields before proceeding",
                          variant: "destructive"
                        })
                      }
                    }}
                    disabled={isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit for Review'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
