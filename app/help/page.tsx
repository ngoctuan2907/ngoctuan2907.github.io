"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Book,
  MessageCircle,
  Phone,
  Mail,
  Users,
  ShoppingCart,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronRight,
  Star,
  Shield,
  Clock
} from "lucide-react"

export default function HelpPage() {
  const categories = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Getting Started",
      description: "Learn the basics of using SG Home Eats",
      articles: 12,
      popular: true
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-green-600" />,
      title: "Ordering & Delivery",
      description: "How to place orders and track deliveries",
      articles: 8,
      popular: true
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-600" />,
      title: "Payments & Billing",
      description: "Payment methods, refunds, and billing",
      articles: 6,
      popular: false
    },
    {
      icon: <Settings className="w-6 h-6 text-orange-600" />,
      title: "Business Management",
      description: "For home cafe owners and operators",
      articles: 15,
      popular: true
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "Safety & Quality",
      description: "Food safety standards and quality assurance",
      articles: 7,
      popular: false
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-gray-600" />,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      articles: 9,
      popular: false
    }
  ]

  const popularArticles = [
    {
      title: "How to place your first order",
      category: "Getting Started",
      views: 2456,
      rating: 4.8
    },
    {
      title: "Setting up your home cafe profile",
      category: "Business Management",
      views: 1834,
      rating: 4.9
    },
    {
      title: "Payment methods and security",
      category: "Payments & Billing",
      views: 1623,
      rating: 4.7
    },
    {
      title: "Food safety requirements for home cafes",
      category: "Safety & Quality",
      views: 1345,
      rating: 4.6
    },
    {
      title: "Managing orders and customer communication",
      category: "Business Management",
      views: 1289,
      rating: 4.8
    }
  ]

  const quickHelp = [
    {
      question: "How do I track my order?",
      answer: "Once your order is placed, you'll receive a confirmation email with a tracking link. You can also check your order status in your dashboard."
    },
    {
      question: "What if my order is late?",
      answer: "If your order is delayed beyond the estimated time, you'll be notified automatically. You can also contact the home cafe directly through our messaging system."
    },
    {
      question: "How do I cancel an order?",
      answer: "Orders can be cancelled within 30 minutes of placing them, provided the home cafe hasn't started preparation. Go to your orders page and click cancel."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, PayNow, and bank transfers. All payments are processed securely through our payment partners."
    }
  ]

  const contactOptions = [
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "Mon-Fri, 9am-6pm",
      action: "Start Chat",
      primary: true
    },
    {
      icon: <Mail className="w-8 h-8 text-green-600" />,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 24 hours",
      action: "Send Email",
      primary: false
    },
    {
      icon: <Phone className="w-8 h-8 text-orange-600" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      availability: "+65 6123 4567",
      action: "Call Now",
      primary: false
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
            How Can We
            <br />
            <span className="text-orange-600">Help You?</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to your questions, learn how to use SG Home Eats effectively, 
            or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for help articles, guides, or FAQs..."
                className="pl-12 h-14 text-lg border-2 border-orange-200 focus:border-orange-500"
              />
              <Button className="absolute right-2 top-2 bg-orange-600 hover:bg-orange-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {category.icon}
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                              {category.title}
                            </h3>
                            {category.popular && (
                              <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                      <div className="text-sm text-gray-500">
                        {category.articles} articles
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Articles</h2>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition-colors mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span>{article.views} views</span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{article.rating}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Help */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Help</h2>
              <div className="space-y-4">
                {quickHelp.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {item.question}
                      </h3>
                      <p className="text-gray-600">
                        {item.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Support */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-6">Contact Support</h3>
                <div className="space-y-4">
                  {contactOptions.map((option, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${option.primary ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                      <div className="flex items-start space-x-3">
                        {option.icon}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{option.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                          <p className="text-xs text-gray-500 mb-3">{option.availability}</p>
                          <Button 
                            size="sm" 
                            className={option.primary ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            variant={option.primary ? 'default' : 'outline'}
                            asChild
                          >
                            <Link href="/contact">{option.action}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Help Center Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Articles</span>
                    <span className="font-semibold">150+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Response</span>
                    <span className="font-semibold">2 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Satisfaction Rate</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Support Hours</span>
                    <span className="font-semibold">Mon-Fri 9am-6pm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Join Our Community</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Connect with other home chefs and food lovers in our community forums.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="#">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Community Forum
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="#">
                      <Book className="w-4 h-4 mr-2" />
                      Recipe Exchange
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="#">
                      <Users className="w-4 h-4 mr-2" />
                      Chef Network
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Resources</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore more ways to get help and make the most of SG Home Eats.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Book className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Video Tutorials</h3>
                <p className="text-gray-600 mb-6">
                  Step-by-step video guides for common tasks and features.
                </p>
                <Button variant="outline" asChild>
                  <Link href="#">Watch Videos</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Webinars</h3>
                <p className="text-gray-600 mb-6">
                  Join live sessions with our experts and successful home chefs.
                </p>
                <Button variant="outline" asChild>
                  <Link href="#">View Schedule</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">One-on-One Help</h3>
                <p className="text-gray-600 mb-6">
                  Schedule personalized support sessions with our team.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">Book Session</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our friendly support team is here to help you succeed with SG Home Eats.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
              <Link href="#">Join Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
