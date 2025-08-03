"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MapPin, 
  Star, 
  ShoppingCart, 
  Clock, 
  CheckCircle,
  Users,
  Coffee,
  Heart,
  Shield
} from "lucide-react"

export default function HowItWorksPage() {
  const customerSteps = [
    {
      step: 1,
      icon: <Search className="w-8 h-8 text-orange-600" />,
      title: "Discover",
      description: "Browse through hundreds of home cafes in your neighborhood. Filter by cuisine, location, ratings, and dietary preferences."
    },
    {
      step: 2,
      icon: <ShoppingCart className="w-8 h-8 text-orange-600" />,
      title: "Order",
      description: "Choose your favorite dishes and place your order directly through our platform. Pay securely online or upon delivery."
    },
    {
      step: 3,
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: "Enjoy",
      description: "Relax while your food is freshly prepared. Track your order and get notified when it's ready for pickup or delivery."
    }
  ]

  const businessSteps = [
    {
      step: 1,
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Sign Up",
      description: "Create your business profile and tell us about your specialties, story, and what makes your home cafe unique."
    },
    {
      step: 2,
      icon: <Coffee className="w-8 h-8 text-green-600" />,
      title: "Set Up Menu",
      description: "Upload photos and descriptions of your dishes. Set prices, availability, and delivery options that work for you."
    },
    {
      step: 3,
      icon: <Heart className="w-8 h-8 text-green-600" />,
      title: "Start Cooking",
      description: "Receive orders, prepare delicious food, and build a community of loyal customers who love your cooking."
    }
  ]

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Safety First",
      description: "All home cafes are verified and follow strict hygiene standards."
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      title: "Quality Assured",
      description: "Customer reviews and ratings help maintain high quality standards."
    },
    {
      icon: <MapPin className="w-6 h-6 text-red-600" />,
      title: "Local Focus",
      description: "Supporting neighborhood businesses and reducing delivery distances."
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "Easy Process",
      description: "Simple ordering and streamlined business management tools."
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
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How SG Home Eats 
            <br />
            <span className="text-orange-600">Works</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connecting food lovers with passionate home chefs across Singapore is simple. 
            Whether you're looking to enjoy amazing home-cooked meals or share your culinary 
            talents with the community, we make it easy.
          </p>
        </div>
      </section>

      {/* For Customers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Food Lovers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and enjoy authentic home-cooked meals from passionate chefs in your neighborhood.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {customerSteps.map((step, index) => (
              <Card key={index} className="text-center relative">
                <CardContent className="p-8">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-600 text-white px-4 py-2 text-lg font-bold">
                      {step.step}
                    </Badge>
                  </div>
                  <div className="flex justify-center mb-6 mt-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/browse">Start Browsing Cafes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Business Owners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Home Chefs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Turn your passion for cooking into a thriving home-based business and connect with food lovers in your community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {businessSteps.map((step, index) => (
              <Card key={index} className="text-center relative">
                <CardContent className="p-8">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-2 text-lg font-bold">
                      {step.step}
                    </Badge>
                  </div>
                  <div className="flex justify-center mb-6 mt-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/get-started">Start Your Home Cafe</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SG Home Eats?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built a platform that prioritizes safety, quality, and community connection.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center h-full">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  How do you ensure food safety?
                </h3>
                <p className="text-gray-600">
                  All our home cafes undergo verification and must comply with Singapore's food safety standards. 
                  We provide guidance on hygiene practices and conduct regular check-ins with our partners.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What are the delivery options?
                </h3>
                <p className="text-gray-600">
                  Most home cafes offer both pickup and delivery options. Delivery areas vary by location, 
                  and some chefs may offer scheduled pickup times to ensure freshness.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  How much does it cost to list my home cafe?
                </h3>
                <p className="text-gray-600">
                  It's free to create your profile and start listing your dishes. We only charge a small 
                  commission on successful orders, which helps us maintain the platform and support our community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Can I customize my orders?
                </h3>
                <p className="text-gray-600">
                  Many home chefs offer customization options for dietary restrictions or preferences. 
                  You can communicate directly with chefs through our messaging system to discuss special requests.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our growing community of food lovers and home chefs today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/browse">Browse Home Cafes</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
              <Link href="/auth/get-started">Start Your Home Cafe</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
