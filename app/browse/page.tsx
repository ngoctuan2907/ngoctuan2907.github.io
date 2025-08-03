"use client"

import { Search, MapPin, Star, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function BrowsePage() {
  const cafes = [
    {
      id: 1,
      name: "Ah Ma's Kitchen",
      cuisine: "Peranakan",
      location: "Toa Payoh",
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg?height=200&width=300",
      specialty: "Authentic Nyonya Kueh",
      priceRange: "$$",
      isOpen: true,
    },
    {
      id: 2,
      name: "Brew & Bite",
      cuisine: "Western Fusion",
      location: "Tampines",
      rating: 4.6,
      reviews: 89,
      image: "/placeholder.svg?height=200&width=300",
      specialty: "Artisan Coffee & Brunch",
      priceRange: "$$$",
      isOpen: true,
    },
    {
      id: 3,
      name: "Spice Route Home",
      cuisine: "Indian",
      location: "Jurong West",
      rating: 4.9,
      reviews: 156,
      image: "/placeholder.svg?height=200&width=300",
      specialty: "Homestyle Curries",
      priceRange: "$",
      isOpen: false,
    },
    {
      id: 4,
      name: "Noodle Nest",
      cuisine: "Chinese",
      location: "Ang Mo Kio",
      rating: 4.7,
      reviews: 203,
      image: "/placeholder.svg?height=200&width=300",
      specialty: "Hand-pulled Noodles",
      priceRange: "$$",
      isOpen: true,
    },
    {
      id: 5,
      name: "Sweet Treats Corner",
      cuisine: "Desserts",
      location: "Orchard",
      rating: 4.5,
      reviews: 78,
      image: "/placeholder.svg?height=200&width=300",
      specialty: "Handmade Pastries",
      priceRange: "$$$",
      isOpen: true,
    },
    {
      id: 6,
      name: "Healthy Bites",
      cuisine: "Healthy",
      location: "Clarke Quay",
      rating: 4.4,
      reviews: 92,
      image: "/placeholder.svg?height=200&width=300",
      specialty: "Organic Bowls",
      priceRange: "$$",
      isOpen: true,
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse All Home Cafes</h1>
          <p className="text-lg text-gray-600">Discover amazing home-based cafes across Singapore</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search cafes, cuisines, or locations..."
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" className="h-12 px-6">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map((cafe) => (
            <Link key={cafe.id} href={`/cafe/${cafe.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden h-full flex flex-col">
                <div className="relative">
                  <Image
                    src={cafe.image || "/placeholder.svg"}
                    alt={cafe.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={cafe.isOpen ? "default" : "secondary"} className="bg-white/90 text-gray-900">
                      {cafe.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {cafe.name}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-2">{cafe.priceRange}</span>
                  </div>
                  <p className="text-sm text-orange-600 mb-2 line-clamp-1">{cafe.specialty}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <div className="flex items-center min-w-0 flex-1">
                      <MapPin className="w-4 h-4 mr-1 shrink-0" />
                      <span className="truncate">{cafe.location}</span>
                    </div>
                    <div className="flex items-center ml-2 whitespace-nowrap">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {cafe.rating} ({cafe.reviews})
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Badge variant="outline" className="text-xs truncate max-w-full">
                      {cafe.cuisine}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Cafes
          </Button>
        </div>
      </div>
    </div>
  )
}
