import { Search, MapPin, Star, Plus, TrendingUp, Users, Coffee } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const featuredCafes = [
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
  ]

  const categories = [
    { name: "Local", icon: "🇸🇬", count: 45 },
    { name: "Western", icon: "🍔", count: 32 },
    { name: "Asian Fusion", icon: "🍜", count: 28 },
    { name: "Desserts", icon: "🧁", count: 19 },
    { name: "Coffee", icon: "☕", count: 41 },
    { name: "Healthy", icon: "🥗", count: 23 },
  ]

  const stats = [
    { label: "Home Cafes", value: "200+", icon: Coffee },
    { label: "Happy Customers", value: "15K+", icon: Users },
    { label: "Orders Completed", value: "50K+", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SG</span>
              </div>
              <div>
                <span className="font-bold text-xl text-gray-900">SG Home Eats</span>
                <p className="text-xs text-gray-500">Discover Local Home Cafes</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/browse" className="text-gray-600 hover:text-orange-600 transition-colors">
                Browse
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-orange-600 transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
                About
              </Link>
              <Button asChild variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/register-business">
                  <Plus className="w-4 h-4 mr-2" />
                  List Your Cafe
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Singapore's Best
              <span className="text-orange-600 block">Home-Based Cafes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Support local entrepreneurs and taste authentic flavors from passionate home chefs across Singapore
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input placeholder="Search for cuisine, location, or cafe name..." className="pl-10 h-12 text-lg" />
                </div>
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 h-12 px-8">
                  Search
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <Link key={index} href={`/category/${category.name.toLowerCase()}`}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} cafes</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cafes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Home Cafes</h2>
            <Button variant="outline" asChild>
              <Link href="/browse">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCafes.map((cafe) => (
              <Link key={cafe.id} href={`/cafe/${cafe.id}`}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
                  <div className="relative">
                    <Image
                      src={cafe.image || "/placeholder.svg"}
                      alt={cafe.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant={cafe.isOpen ? "default" : "secondary"} className="bg-white/90 text-gray-900">
                        {cafe.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {cafe.name}
                      </h3>
                      <span className="text-sm text-gray-500">{cafe.priceRange}</span>
                    </div>
                    <p className="text-sm text-orange-600 mb-2">{cafe.specialty}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {cafe.location}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        {cafe.rating} ({cafe.reviews})
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {cafe.cuisine}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action for Business Owners */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Share Your Culinary Passion?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join Singapore's growing community of home-based food entrepreneurs. Create your profile in minutes and
            start connecting with food lovers in your neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="bg-white text-orange-600 hover:bg-gray-100">
              <Link href="/register-business">
                <Plus className="w-5 h-5 mr-2" />
                List Your Cafe
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SG</span>
                </div>
                <span className="font-bold text-lg">SG Home Eats</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting food lovers with passionate home chefs across Singapore.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/browse" className="hover:text-white transition-colors">
                    Browse Cafes
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="hover:text-white transition-colors">
                    Reviews
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/register-business" className="hover:text-white transition-colors">
                    List Your Cafe
                  </Link>
                </li>
                <li>
                  <Link href="/business-dashboard" className="hover:text-white transition-colors">
                    Business Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 SG Home Eats. All rights reserved. Made with ❤️ in Singapore</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
