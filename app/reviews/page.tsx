"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Star, 
  Search, 
  Filter,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  TrendingUp
} from "lucide-react"

export default function ReviewsPage() {
  const featuredReviews = [
    {
      id: 1,
      reviewer: "Sarah Chen",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      date: "2 days ago",
      cafe: "Ah Ma's Kitchen",
      cafeLocation: "Toa Payoh",
      title: "Absolutely Amazing Laksa!",
      content: "I've been searching for authentic laksa in Singapore, and Ah Ma's Kitchen delivered beyond my expectations. The broth was rich and aromatic, with just the right amount of spice. The prawns were fresh and the cockles were perfectly cooked. Will definitely order again!",
      helpful: 24,
      images: ["/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200"],
      verified: true
    },
    {
      id: 2,
      reviewer: "Marcus Wong",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      date: "1 week ago",
      cafe: "Brew & Bite",
      cafeLocation: "Tampines",
      title: "Best Home-Brewed Coffee Experience",
      content: "The barista's attention to detail is incredible. They take time to explain each step of the brewing process. The coffee beans are sourced locally and roasted to perfection. The homemade pastries complement the coffee beautifully. A hidden gem in Tampines!",
      helpful: 18,
      images: ["/placeholder.svg?height=200&width=200"],
      verified: true
    },
    {
      id: 3,
      reviewer: "Priya Sharma",
      avatar: "/placeholder-user.jpg",
      rating: 4,
      date: "3 days ago",
      cafe: "Spice Route Home",
      cafeLocation: "Jurong West",
      title: "Homestyle Indian Comfort Food",
      content: "Reminds me of my grandmother's cooking. The dal was perfectly seasoned and the roti was soft and warm. The portion sizes are generous and the prices are very reasonable. Only minor feedback is that delivery took a bit longer than expected, but the quality made up for it.",
      helpful: 15,
      images: ["/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200"],
      verified: true
    },
    {
      id: 4,
      reviewer: "David Lim",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      date: "5 days ago",
      cafe: "Noodle Nest",
      cafeLocation: "Ang Mo Kio",
      title: "Hand-Pulled Noodles Worth the Wait",
      content: "Watched through the window as they hand-pulled the noodles. The texture was incredible - springy and fresh. The broth had depth of flavor that you can only get from hours of simmering. This is what authentic Chinese noodles should taste like. Highly recommended!",
      helpful: 31,
      images: ["/placeholder.svg?height=200&width=200"],
      verified: true
    },
    {
      id: 5,
      reviewer: "Lisa Tan",
      avatar: "/placeholder-user.jpg",
      rating: 4,
      date: "1 day ago",
      cafe: "Sweet Treats Corner",
      cafeLocation: "Bedok",
      title: "Delightful Homemade Desserts",
      content: "The kueh lapis was incredibly moist and flavorful. You can taste the love and traditional techniques in every layer. The ondeh ondeh burst with gula melaka sweetness. Perfect for satisfying my dessert cravings with authentic local flavors.",
      helpful: 12,
      images: ["/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200"],
      verified: true
    }
  ]

  const topRatedCafes = [
    { name: "Ah Ma's Kitchen", rating: 4.9, reviews: 124, cuisine: "Peranakan" },
    { name: "Spice Route Home", rating: 4.8, reviews: 156, cuisine: "Indian" },
    { name: "Brew & Bite", rating: 4.7, reviews: 89, cuisine: "Western" },
    { name: "Noodle Nest", rating: 4.7, reviews: 203, cuisine: "Chinese" },
    { name: "Sweet Treats Corner", rating: 4.6, reviews: 67, cuisine: "Desserts" }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ))
  }

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Community
            <br />
            <span className="text-orange-600">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover what our food-loving community has to say about Singapore's best home cafes. 
            Real reviews from real customers help you find your next favorite meal.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search reviews by cafe name, cuisine, or location..."
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-12 px-8">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Reviews Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Latest Reviews</h2>
              <Badge variant="outline" className="px-3 py-1">
                {featuredReviews.length} Reviews
              </Badge>
            </div>

            <div className="space-y-6">
              {featuredReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={review.avatar}
                            alt={review.reviewer}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-user.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{review.reviewer}</h3>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 font-semibold text-gray-900">{review.rating}.0</span>
                      </div>
                    </div>

                    {/* Cafe Info */}
                    <div className="mb-4">
                      <Link href={`/cafe/${review.id}`} className="hover:text-orange-600 transition-colors">
                        <h4 className="font-semibold text-lg text-gray-900">{review.cafe}</h4>
                      </Link>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {review.cafeLocation}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                      <p className="text-gray-600 leading-relaxed">{review.content}</p>
                    </div>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover hover:scale-105 transition-transform cursor-pointer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-orange-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Helpful ({review.helpful})</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-orange-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/cafe/${review.id}`}>Visit Cafe</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Reviews
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Top Rated Cafes */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Top Rated Cafes</h3>
                </div>
                <div className="space-y-4">
                  {topRatedCafes.map((cafe, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link href={`/cafe/${index + 1}`} className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                          {cafe.name}
                        </Link>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{cafe.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{cafe.reviews} reviews</span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {cafe.cuisine}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Review Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">12,450+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold">4.7</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">1,240 new</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Verified Reviews</span>
                    <span className="font-semibold">98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Share Your Experience</h2>
          <p className="text-xl mb-8 opacity-90">
            Help others discover amazing home cafes by sharing your honest reviews.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/browse">Find a Cafe to Review</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
              <Link href="/dashboard">My Reviews</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
