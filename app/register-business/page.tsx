"use client"

import { useState } from "react"
import { ArrowLeft, Upload, Camera, Plus, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function RegisterBusinessPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [menuItems, setMenuItems] = useState([{ name: "", price: "", description: "" }])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])

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
    setMenuItems([...menuItems, { name: "", price: "", description: "" }])
  }

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index))
  }

  const updateMenuItem = (index: number, field: string, value: string) => {
    const updated = menuItems.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setMenuItems(updated)
  }

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) => (prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]))
  }

  const steps = [
    { number: 1, title: "Basic Information", description: "Tell us about your cafe" },
    { number: 2, title: "Location & Hours", description: "Where and when you operate" },
    { number: 3, title: "Menu & Pricing", description: "Showcase your offerings" },
    { number: 4, title: "Photos & Final Details", description: "Make your listing shine" },
  ]

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
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input id="businessName" placeholder="e.g., Ah Ma's Kitchen" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input id="ownerName" placeholder="Your full name" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
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
                      <Input id="phone" placeholder="+65 9123 4567" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="hello@yourbusiness.com" className="mt-2" />
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
                      placeholder="Blk 123 Toa Payoh Lorong 1, #01-456, Singapore 310123"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">Include block number, unit number, and postal code</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="district">District/Area *</Label>
                      <Select>
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
                      <Label htmlFor="priceRange">Price Range *</Label>
                      <Select>
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
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <div key={day} className="flex items-center space-x-4">
                          <div className="w-24">
                            <Label className="text-sm">{day}</Label>
                          </div>
                          <Checkbox id={`${day}-open`} />
                          <Label htmlFor={`${day}-open`} className="text-sm">
                            Open
                          </Label>
                          <Input placeholder="9:00 AM" className="w-24" />
                          <span className="text-gray-500">to</span>
                          <Input placeholder="6:00 PM" className="w-24" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialNotes">Special Notes</Label>
                    <Textarea
                      id="specialNotes"
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

                    {menuItems.map((item, index) => (
                      <Card key={index} className="mb-4">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">Item {index + 1}</h4>
                            {menuItems.length > 1 && (
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
                      <Input placeholder="Instagram: @yourbusiness" />
                      <Input placeholder="Facebook: facebook.com/yourbusiness" />
                      <Input placeholder="WhatsApp: +65 9123 4567" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
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
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700">Submit for Review</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
