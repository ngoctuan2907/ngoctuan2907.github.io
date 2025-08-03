"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Star } from "lucide-react"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryMap: Record<string, { name: string; icon: string; description: string }> = {
    "local": { 
      name: "Local", 
      icon: "🇸🇬", 
      description: "Authentic Singaporean and traditional dishes" 
    },
    "western": { 
      name: "Western", 
      icon: "🍔", 
      description: "Western cuisine and international favorites" 
    },
    "asian-fusion": { 
      name: "Asian Fusion", 
      icon: "🍜", 
      description: "Creative fusion of Asian flavors" 
    },
    "desserts": { 
      name: "Desserts", 
      icon: "🧁", 
      description: "Sweet treats and handmade pastries" 
    },
    "coffee": { 
      name: "Coffee", 
      icon: "☕", 
      description: "Artisan coffee and specialty brews" 
    },
    "healthy": { 
      name: "Healthy", 
      icon: "🥗", 
      description: "Nutritious and organic options" 
    },
  }

  const category = categoryMap[params.slug] || {
    name: "Category",
    icon: "🍽️",
    description: "Delicious home-cooked meals"
  }

  // Sample cafes for the category
  const cafes = [
    {
      id: 1,
      name: "Auntie May's Kitchen",
      description: "Traditional Hainanese chicken rice and local favorites made with love",
      district: "Toa Payoh",
      rating: 4.8,
      reviewCount: 234,
      image: "/placeholder.jpg",
      tags: ["Halal", "Local Favorites"],
      openingHours: "9:00 AM - 8:00 PM"
    },
    {
      id: 2,
      name: "Spice Garden Home",
      description: "Authentic Malaysian and Peranakan dishes with family recipes",
      district: "Katong",
      rating: 4.7,
      reviewCount: 189,
      image: "/placeholder.jpg",
      tags: ["Spicy", "Family Recipe"],
      openingHours: "11:00 AM - 9:00 PM"
    },
    {
      id: 3,
      name: "Sunny's Laksa Corner",
      description: "Award-winning laksa and other local noodle dishes",
      district: "Bedok",
      rating: 4.9,
      reviewCount: 412,
      image: "/placeholder.jpg",
      tags: ["Award Winner", "Noodles"],
      openingHours: "8:00 AM - 3:00 PM"
    },
    {
      id: 4,
      name: "Heritage Flavors",
      description: "Multi-generational recipes from various Asian cultures",
      district: "Chinatown",
      rating: 4.6,
      reviewCount: 156,
      image: "/placeholder.jpg",
      tags: ["Heritage", "Multi-cultural"],
      openingHours: "10:00 AM - 7:00 PM"
    },
    {
      id: 5,
      name: "Mama's Secret Recipe",
      description: "Hidden gems of Southeast Asian cuisine in a cozy home setting",
      district: "Hougang",
      rating: 4.8,
      reviewCount: 298,
      image: "/placeholder.jpg",
      tags: ["Secret Recipe", "Cozy"],
      openingHours: "12:00 PM - 8:00 PM"
    },
    {
      id: 6,
      name: "Golden Wok Express",
      description: "Fast and delicious zi char dishes for the modern family",
      district: "Jurong",
      rating: 4.5,
      reviewCount: 178,
      image: "/placeholder.jpg",
      tags: ["Zi Char", "Quick Service"],
      openingHours: "5:00 PM - 11:00 PM"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SG</span>
              </div>
              <span className="font-bold text-xl text-gray-900">SG Home Eats</span>
            </Link>
            <Button asChild variant="outline">
              <Link href="/categories">← Back to Categories</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">{category.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name} Cafes</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {category.description}
          </p>
          <div className="text-gray-500">
            {cafes.length} cafes found
          </div>
        </div>

        {/* Cafes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map((cafe) => (
            <Link key={cafe.id} href={`/cafe/${cafe.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={cafe.image}
                    alt={cafe.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {cafe.rating}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                    {cafe.name}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2 flex-1">
                    {cafe.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {cafe.district}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {cafe.openingHours}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <div className="w-full space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {cafe.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cafe.reviewCount} reviews
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {/* Back to Categories */}
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="mr-4">
            <Link href="/categories">View All Categories</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/browse">Browse All Cafes</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
