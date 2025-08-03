"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, ShieldCheck, Clock, MapPin, Star } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Home-Cooked with Love",
      description: "Every dish is prepared with care in the comfort of home kitchens by passionate home chefs who love what they do."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Supporting Local Communities",
      description: "We empower home-based food entrepreneurs and bring neighborhoods together through authentic, local flavors."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      title: "Safe & Trusted",
      description: "All our home cafes are verified and follow strict hygiene standards to ensure safe and quality dining experiences."
    }
  ]

  const stats = [
    { number: "500+", label: "Home Cafes" },
    { number: "10,000+", label: "Happy Customers" },
    { number: "50,000+", label: "Orders Delivered" },
    { number: "4.8/5", label: "Average Rating" }
  ]

  const team = [
    {
      name: "Sarah Lim",
      role: "Founder & CEO",
      bio: "Former food blogger turned entrepreneur, passionate about Singapore's home dining culture.",
      image: "/placeholder-user.jpg"
    },
    {
      name: "Marcus Tan",
      role: "Head of Operations",
      bio: "Ensures quality and safety standards across all our partner home cafes.",
      image: "/placeholder-user.jpg"
    },
    {
      name: "Priya Rajesh",
      role: "Community Manager",
      bio: "Connects home chefs with food lovers and builds our vibrant community.",
      image: "/placeholder-user.jpg"
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
            Bringing Singapore's Home Kitchens 
            <br />
            <span className="text-orange-600">to Your Table</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            SG Home Eats is Singapore's premier platform connecting food lovers with passionate home chefs. 
            We believe the best meals come from the heart of home kitchens, where every dish tells a story 
            and every bite brings communities together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/browse">Browse Home Cafes</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register-business">Become a Home Chef</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SG Home Eats?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're more than just a food delivery platform. We're building a community 
              that celebrates Singapore's rich culinary heritage.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center h-full">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              To preserve and celebrate Singapore's diverse food culture by empowering home chefs 
              and making authentic, home-cooked meals accessible to everyone. We believe that food 
              is the bridge that connects communities, and every home kitchen has a unique story to tell.
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-8">
              <blockquote className="text-xl text-gray-700 italic mb-4">
                "Food prepared with love in the comfort of home carries something special that 
                no restaurant can replicate - the warmth of family traditions and the care of 
                someone who truly loves what they do."
              </blockquote>
              <cite className="text-orange-600 font-semibold">- Sarah Lim, Founder</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals working to bring Singapore's home kitchens to your table.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-user.jpg';
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <Badge variant="secondary" className="mb-4">
                    {member.role}
                  </Badge>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Home-Cooked Goodness?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of food lovers discovering amazing home cafes across Singapore.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/browse">Start Browsing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
              <Link href="/register-business">Become a Partner</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
