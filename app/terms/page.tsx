"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Mail,
  Scale
} from "lucide-react"

export default function TermsPage() {
  const lastUpdated = "March 15, 2024"
  const effectiveDate = "March 1, 2024"

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing and using SG Home Eats ("Platform", "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: "definitions",
      title: "2. Definitions",
      content: `
• "Platform" refers to the SG Home Eats website, mobile application, and related services
• "User" means any person who accesses or uses our Platform
• "Home Chef" refers to individuals who prepare and sell food through our Platform
• "Customer" refers to users who purchase food through our Platform
• "Content" includes text, images, videos, and other materials posted on the Platform
      `
    },
    {
      id: "eligibility",
      title: "3. User Eligibility",
      content: `
You must be at least 18 years old to use this Platform. By using SG Home Eats, you represent and warrant that:
• You are at least 18 years of age
• You have the legal capacity to enter into this agreement
• Your use of the Platform will not violate any applicable law or regulation
• All information you provide is accurate and complete
      `
    },
    {
      id: "registration",
      title: "4. Account Registration",
      content: `
To access certain features of our Platform, you must register for an account. You agree to:
• Provide accurate, current, and complete information during registration
• Maintain and update your account information
• Keep your account credentials secure and confidential
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use of your account
      `
    },
    {
      id: "home-chef-terms",
      title: "5. Home Chef Terms",
      content: `
If you register as a Home Chef, you additionally agree to:
• Comply with all applicable food safety regulations and local licensing requirements
• Provide accurate descriptions and pricing for your food items
• Maintain high standards of food preparation and hygiene
• Respond promptly to customer orders and inquiries
• Allow us to process payments on your behalf and deduct applicable fees
• Provide valid business registration documents if required by local law
      `
    },
    {
      id: "customer-terms",
      title: "6. Customer Terms",
      content: `
If you use our Platform to order food, you agree to:
• Provide accurate delivery information and payment details
• Pay for all orders placed through your account
• Treat Home Chefs and delivery personnel with respect
• Provide honest and fair reviews of your experiences
• Not misuse our review or rating system
      `
    },
    {
      id: "prohibited-conduct",
      title: "7. Prohibited Conduct",
      content: `
You may not use our Platform to:
• Violate any laws, regulations, or third-party rights
• Post false, misleading, or fraudulent content
• Engage in harassment, abuse, or discrimination
• Interfere with the Platform's operation or security
• Create fake accounts or manipulate reviews
• Sell alcohol, tobacco, or other restricted items
• Use the Platform for any illegal food business activities
      `
    },
    {
      id: "payments",
      title: "8. Payments and Fees",
      content: `
• All payments are processed securely through our payment partners
• Home Chefs are charged a service fee on each successful transaction
• Customers pay the food price plus any applicable delivery fees and taxes
• Refunds are processed according to our refund policy
• We reserve the right to change our fee structure with reasonable notice
      `
    },
    {
      id: "intellectual-property",
      title: "9. Intellectual Property",
      content: `
• SG Home Eats retains all rights to our Platform, trademarks, and proprietary content
• Users retain rights to their own content but grant us a license to use it on our Platform
• You may not copy, reproduce, or redistribute our Platform or content without permission
• Respect the intellectual property rights of other users and third parties
      `
    },
    {
      id: "privacy",
      title: "10. Privacy and Data Protection",
      content: `
Your privacy is important to us. Our Privacy Policy explains:
• What personal information we collect and how we use it
• How we protect your data and maintain security
• Your rights regarding your personal information
• How we handle cookies and tracking technologies
• Our compliance with Singapore's Personal Data Protection Act (PDPA)
      `
    },
    {
      id: "liability",
      title: "11. Limitation of Liability",
      content: `
SG Home Eats is a platform that connects Home Chefs with Customers. We:
• Do not prepare, handle, or deliver food ourselves
• Are not responsible for food quality, safety, or preparation methods
• Cannot guarantee the accuracy of Home Chef information or reviews
• Limit our liability to the maximum extent permitted by law
• Encourage users to exercise their own judgment when using our Platform
      `
    },
    {
      id: "termination",
      title: "12. Account Termination",
      content: `
We may suspend or terminate your account if you:
• Violate these Terms of Service
• Engage in fraudulent or illegal activities
• Receive multiple complaints about your conduct
• Fail to pay applicable fees or charges
• Request account deletion

You may terminate your account at any time by contacting our support team.
      `
    },
    {
      id: "dispute-resolution",
      title: "13. Dispute Resolution",
      content: `
For disputes between users, we encourage direct communication and provide mediation support when requested. For disputes with SG Home Eats:
• Contact our support team first to seek resolution
• Unresolved disputes will be governed by Singapore law
• Any legal proceedings must be conducted in Singapore courts
• We encourage alternative dispute resolution methods when appropriate
      `
    },
    {
      id: "changes",
      title: "14. Changes to Terms",
      content: `
We reserve the right to modify these terms at any time. When we make changes:
• We will notify users via email or Platform notification
• Continued use of the Platform constitutes acceptance of new terms
• Significant changes will include a reasonable notice period
• You may terminate your account if you disagree with changes
      `
    },
    {
      id: "contact",
      title: "15. Contact Information",
      content: `
If you have questions about these Terms of Service, please contact us:
• Email: legal@sghomeeats.com
• Phone: +65 6123 4567
• Address: SG Home Eats Pte Ltd, 123 Food Street, #12-34, Singapore 123456
• Business Registration: 202400123A
      `
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
            Terms of
            <br />
            <span className="text-orange-600">Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            These terms govern your use of SG Home Eats and outline the rights and responsibilities 
            of all users on our platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-gray-600">Last Updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Effective: {effectiveDate}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block text-sm text-gray-600 hover:text-orange-600 transition-colors py-1"
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Key Points */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Key Points</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Must be 18+ to use platform</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Food safety compliance required</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Scale className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Singapore law governs disputes</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Terms may change with notice</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Important Notice */}
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Important Notice</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      By using SG Home Eats, you agree to these terms in their entirety. 
                      Please read them carefully. If you don't agree with any part of these terms, 
                      you should not use our platform. These terms are legally binding and enforceable.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms Sections */}
            <div className="space-y-8">
              {sections.map((section) => (
                <Card key={section.id} id={section.id}>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Document Info */}
            <Card className="mt-12 bg-gray-100">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Document Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span>2.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{lastUpdated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effective Date:</span>
                        <span>{effectiveDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Language:</span>
                        <span>English</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Legal Entity</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>SG Home Eats Pte Ltd</p>
                      <p>UEN: 202400123A</p>
                      <p>123 Food Street, #12-34</p>
                      <p>Singapore 123456</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Documents */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Documents</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These additional documents provide important information about using SG Home Eats.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Learn how we collect, use, and protect your personal information.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/privacy">Read Policy</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Community Guidelines</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Standards for respectful interaction within our community.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/guidelines">View Guidelines</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Scale className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Policy</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Information about how we use cookies and tracking technologies.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cookies">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-12 text-center">
              <Mail className="w-12 h-12 mx-auto mb-6 text-white" />
              <h2 className="text-3xl font-bold mb-4">Questions About Our Terms?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Our legal team is available to clarify any aspects of these terms. 
                We're committed to transparency and helping you understand your rights and obligations.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contact">Contact Legal Team</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
                  <Link href="/help">Visit Help Center</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
