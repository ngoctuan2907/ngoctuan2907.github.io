"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Star, MessageSquare, Send, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Review {
  id: string
  customer_name: string
  customer_avatar?: string
  rating: number
  comment: string
  created_at: string
  reply?: string
  replied_at?: string
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      // This would typically fetch from your reviews API
      // For now, we'll use sample data
      setReviews([
        {
          id: "1",
          customer_name: "Sarah Chen",
          customer_avatar: "",
          rating: 5,
          comment: "Amazing authentic Peranakan food! The kueh lapis was exactly like my grandmother used to make. Will definitely be back for more!",
          created_at: "2024-01-15T10:30:00Z",
          reply: "Thank you so much for your kind words! We're thrilled that our kueh lapis brought back such wonderful memories. We look forward to serving you again soon!",
          replied_at: "2024-01-15T12:15:00Z"
        },
        {
          id: "2",
          customer_name: "David Lim",
          customer_avatar: "",
          rating: 5,
          comment: "Best laksa lemak I've had in Singapore! The flavors are so rich and authentic. The spice level was perfect too.",
          created_at: "2024-01-14T14:20:00Z"
        },
        {
          id: "3",
          customer_name: "Michelle Tan",
          customer_avatar: "",
          rating: 4,
          comment: "Love supporting local home businesses. The ondeh ondeh was perfect! Only minor feedback is that delivery took a bit longer than expected, but worth the wait!",
          created_at: "2024-01-13T16:45:00Z"
        },
        {
          id: "4",
          customer_name: "Ahmad Rahman",
          customer_avatar: "",
          rating: 3,
          comment: "The food was good but I felt the portions were a bit small for the price. The taste was authentic though.",
          created_at: "2024-01-12T11:10:00Z"
        }
      ])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    const reply = replyText[reviewId]
    if (!reply?.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply before sending.",
        variant: "destructive"
      })
      return
    }

    try {
      // Here you would typically send the reply to your API
      // await fetch('/api/reviews/reply', { method: 'POST', body: JSON.stringify({ reviewId, reply }) })
      
      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, reply, replied_at: new Date().toISOString() }
          : review
      ))
      
      setReplyText(prev => ({ ...prev, [reviewId]: "" }))
      
      toast({
        title: "Reply Sent",
        description: "Your reply has been posted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive"
      })
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    )
  }

  const getFilteredReviews = () => {
    switch (filter) {
      case "replied":
        return reviews.filter(review => review.reply)
      case "pending":
        return reviews.filter(review => !review.reply)
      case "high-rating":
        return reviews.filter(review => review.rating >= 4)
      case "low-rating":
        return reviews.filter(review => review.rating <= 3)
      default:
        return reviews
    }
  }

  const filteredReviews = getFilteredReviews()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
              <p className="text-gray-600">Respond to customer feedback and manage reviews</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reviews.filter(r => r.reply).length}
                </div>
                <div className="text-sm text-gray-600">Replied</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {reviews.filter(r => !r.reply).length}
                </div>
                <div className="text-sm text-gray-600">Pending Reply</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter reviews" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending Reply</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="high-rating">High Rating (4-5 stars)</SelectItem>
                  <SelectItem value="low-rating">Low Rating (1-3 stars)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                Showing {filteredReviews.length} of {reviews.length} reviews
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.customer_avatar} />
                      <AvatarFallback>
                        {review.customer_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{review.customer_name}</div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={review.reply ? "default" : "secondary"}>
                    {review.reply ? "Replied" : "Pending"}
                  </Badge>
                </div>

                {/* Review Comment */}
                <div className="mb-4">
                  <p className="text-gray-700">{review.comment}</p>
                </div>

                {/* Existing Reply */}
                {review.reply && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Your Reply</span>
                      <span className="text-xs text-blue-600">
                        {new Date(review.replied_at!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-blue-800">{review.reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                {!review.reply && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">Reply to this review</Label>
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Write a professional and friendly reply..."
                        value={replyText[review.id] || ""}
                        onChange={(e) => setReplyText(prev => ({ 
                          ...prev, 
                          [review.id]: e.target.value 
                        }))}
                        rows={3}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleReply(review.id)}
                        className="self-end"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Reviews Found
              </h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "You don't have any reviews yet. Keep providing great service and they'll start coming in!"
                  : `No reviews match the current filter. Try selecting a different filter option.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Add this import at the top with other imports
import { Label } from "@/components/ui/label"