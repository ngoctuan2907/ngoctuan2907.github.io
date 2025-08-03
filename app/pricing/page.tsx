"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  X, 
  Star,
  Users,
  TrendingUp,
  Shield,
  Headphones,
  Zap,
  Crown,
  Calculator
} from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for trying out SG Home Eats",
      badge: null,
      color: "border-gray-200",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
      features: [
        { text: "List up to 5 menu items", included: true },
        { text: "Basic profile setup", included: true },
        { text: "Standard order processing", included: true },
        { text: "Community support", included: true },
        { text: "5% + $0.50 transaction fee", included: true },
        { text: "Analytics dashboard", included: false },
        { text: "Priority customer support", included: false },
        { text: "Marketing tools", included: false },
        { text: "Custom branding", included: false }
      ]
    },
    {
      name: "Growth",
      price: "$19",
      period: "/month",
      description: "For established home cafes ready to grow",
      badge: "Most Popular",
      color: "border-orange-500 ring-2 ring-orange-500",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
      features: [
        { text: "Unlimited menu items", included: true },
        { text: "Enhanced profile with photos", included: true },
        { text: "Priority order processing", included: true },
        { text: "Email & chat support", included: true },
        { text: "3% + $0.30 transaction fee", included: true },
        { text: "Advanced analytics dashboard", included: true },
        { text: "Customer insights", included: true },
        { text: "Basic marketing tools", included: true },
        { text: "Custom branding", included: false }
      ]
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For serious food entrepreneurs",
      badge: "Best Value",
      color: "border-purple-500",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      features: [
        { text: "Everything in Growth", included: true },
        { text: "Premium profile placement", included: true },
        { text: "Instant order notifications", included: true },
        { text: "Priority customer support", included: true },
        { text: "2% + $0.25 transaction fee", included: true },
        { text: "Advanced marketing tools", included: true },
        { text: "Customer loyalty program", included: true },
        { text: "Custom branding & domain", included: true },
        { text: "API access", included: true }
      ]
    }
  ]

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Secure Payments",
      description: "Bank-level security for all transactions"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      title: "Analytics & Insights",
      description: "Track your performance and customer behavior"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Customer Management",
      description: "Build relationships with your customers"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Easy Setup",
      description: "Get started in minutes, not hours"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Lim",
      cafe: "Ah Ma's Kitchen",
      quote: "The Growth plan helped me double my orders in just 3 months. The analytics are incredibly helpful!",
      rating: 5
    },
    {
      name: "Marcus Wong",
      cafe: "Brew & Bite",
      quote: "Started with the free plan and upgraded to Pro. The custom branding really makes a difference.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      cafe: "Spice Route Home",
      quote: "Customer support is amazing. They helped me optimize my menu and increase sales.",
      rating: 5
    }
  ]

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayNow, and bank transfers. All payments are processed securely through Stripe."
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees! You only pay the monthly subscription and transaction fees. We want to make it as easy as possible to get started."
    },
    {
      question: "How are transaction fees calculated?",
      answer: "Transaction fees are charged only on successful orders. The percentage and fixed fee depend on your plan tier. This covers payment processing and platform maintenance."
    },
    {
      question: "Can I try before I commit?",
      answer: "Absolutely! Start with our free Starter plan to test the waters. You can always upgrade when you're ready to grow your business."
    },
    {
      question: "Do you offer discounts for annual payments?",
      answer: "Yes! Pay annually and save 20% on your subscription. Contact our sales team for more details on annual plans."
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
            Simple, Transparent
            <br />
            <span className="text-orange-600">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your home cafe's needs. Start free and scale as you grow. 
            No hidden fees, no long-term contracts.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Calculator className="w-5 h-5 text-orange-600" />
            <span className="text-lg text-gray-700">Only pay transaction fees on successful orders</span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} ${plan.badge ? 'transform scale-105' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-600 text-white px-4 py-2">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-gray-900" : "text-gray-500"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    asChild 
                    className={`w-full ${plan.buttonColor}`}
                    size="lg"
                  >
                    <Link href="/auth/get-started">
                      {plan.name === "Starter" ? "Get Started Free" : `Choose ${plan.name}`}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SG Home Eats?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All plans include these essential features to help your home cafe succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
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

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Home Chefs Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how SG Home Eats is helping food entrepreneurs grow their businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-orange-600">{testimonial.cafe}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardContent className="p-12 text-center">
              <Crown className="w-12 h-12 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-4">Need Something Custom?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Running multiple home cafes or need special features? Let's talk about a custom solution 
                tailored to your unique needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600">
                  <Link href="/help">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Home Cafe Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of successful home chefs already earning with SG Home Eats.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/get-started">Start Free Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
