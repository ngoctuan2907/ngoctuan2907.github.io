"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CategoriesPage() {
  const categories = [
    { 
      name: "Local", 
      icon: "🇸🇬", 
      count: 45,
      description: "Authentic Singaporean and traditional dishes",
      slug: "local"
    },
    { 
      name: "Western", 
      icon: "🍔", 
      count: 32,
      description: "Western cuisine and international favorites",
      slug: "western"
    },
    { 
      name: "Asian Fusion", 
      icon: "🍜", 
      count: 28,
      description: "Creative fusion of Asian flavors",
      slug: "asian-fusion"
    },
    { 
      name: "Desserts", 
      icon: "🧁", 
      count: 19,
      description: "Sweet treats and handmade pastries",
      slug: "desserts"
    },
    { 
      name: "Coffee", 
      icon: "☕", 
      count: 41,
      description: "Artisan coffee and specialty brews",
      slug: "coffee"
    },
    { 
      name: "Healthy", 
      icon: "🥗", 
      count: 23,
      description: "Nutritious and organic options",
      slug: "healthy"
    },
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
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover home cafes by cuisine type and find exactly what you're craving
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {categories.map((category, index) => (
            <Link key={index} href={`/category/${category.slug}`}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-6 text-center h-full flex flex-col">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-1">
                    {category.description}
                  </p>
                  <div className="text-orange-600 font-semibold">
                    {category.count} cafes
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/browse">Browse All Cafes</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
