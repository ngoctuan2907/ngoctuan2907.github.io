"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  Users,
  Building,
  HelpCircle
} from "lucide-react"

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-orange-600" />,
      title: "Office Address",
      details: [
        "SG Home Eats Pte Ltd",
        "123 Food Street, #12-34",
        "Singapore 123456"
      ]
    },
    {
      icon: <Phone className="w-6 h-6 text-green-600" />,
      title: "Phone Support",
      details: [
        "+65 6123 4567 (General)",
        "+65 6123 4568 (Business)",
        "Mon-Fri: 9am-6pm SGT"
      ]
    },
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: "Email Support",
      details: [
        "hello@sghomeeats.com",
        "business@sghomeeats.com",
        "support@sghomeeats.com"
      ]
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Business Hours",
      details: [
        "Monday - Friday: 9:00 AM - 6:00 PM",
        "Saturday: 10:00 AM - 4:00 PM",
        "Sunday: Closed"
      ]
    }
  ]

  const inquiryTypes = [
    {
      value: "general",
      label: "General Inquiry",
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      value: "business",
      label: "Business Partnership",
      icon: <Building className="w-5 h-5" />
    },
    {
      value: "support",
      label: "Technical Support",
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      value: "feedback",
      label: "Feedback & Suggestions",
      icon: <Users className="w-5 h-5" />
    }
  ]

  const features = [
    {
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      title: "Quick Response",
      description: "We typically respond within 2-4 hours during business hours"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Dedicated Team",
      description: "Our support team knows the platform inside and out"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-600" />,
      title: "Multiple Channels",
      description: "Reach us via email, phone, chat, or this contact form"
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
            Get in
            <br />
            <span className="text-orange-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Have questions, suggestions, or need support? We'd love to hear from you. 
            Our team is here to help you make the most of SG Home Eats.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" className="mt-2" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="your.email@example.com" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input id="phone" placeholder="+65 1234 5678" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                      {inquiryTypes.map((type) => (
                        <label key={type.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                          <input 
                            type="radio" 
                            name="inquiryType" 
                            value={type.value}
                            className="text-orange-600 focus:ring-orange-500"
                          />
                          {type.icon}
                          <span className="font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of your inquiry" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Please provide details about your inquiry. The more information you provide, the better we can assist you."
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="newsletter"
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="newsletter" className="text-sm text-gray-600">
                      I'd like to receive updates about SG Home Eats features and community news
                    </Label>
                  </div>

                  <Button size="lg" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Contact Details */}
              {contactInfo.map((info, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {info.icon}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                        <div className="space-y-1">
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-gray-600 text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/help">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Visit Help Center
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="#">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Live Chat
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="tel:+6561234567">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Support
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Contact Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing excellent support and building lasting relationships with our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
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

      {/* Map Section (Placeholder) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-lg text-gray-600">
              Located in the heart of Singapore's food district
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600">Interactive map would be displayed here</p>
                  <p className="text-sm text-gray-500 mt-2">123 Food Street, #12-34, Singapore 123456</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Office Hours & Emergency Contact */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <Clock className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  All times are in Singapore Standard Time (SGT)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <Phone className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Emergency Support</h3>
                <p className="text-gray-600 mb-4">
                  For urgent platform issues or payment problems that affect your business operations:
                </p>
                <div className="space-y-2">
                  <div>
                    <strong className="text-gray-900">Emergency Hotline:</strong>
                    <br />
                    <a href="tel:+6561234567" className="text-orange-600 hover:underline">
                      +65 6123 4567
                    </a>
                  </div>
                  <div>
                    <strong className="text-gray-900">Emergency Email:</strong>
                    <br />
                    <a href="mailto:emergency@sghomeeats.com" className="text-orange-600 hover:underline">
                      emergency@sghomeeats.com
                    </a>
                  </div>
                </div>
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
            Don't wait to join Singapore's favorite home dining community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/get-started">Join SG Home Eats</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
              <Link href="/browse">Browse Home Cafes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
