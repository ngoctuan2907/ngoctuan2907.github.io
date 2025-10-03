"use client"

import { Search, MapPin, Star, Filter, X, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [cafes, setCafes] = useState<any[]>([])
  const [filteredCafes, setFilteredCafes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Filter states
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState("rating")
  const [openNow, setOpenNow] = useState(false)

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('q') || ""
    setSearchQuery(query)
  }, [searchParams])

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/businesses')
        const data = await response.json()
        
        if (data.success && data.businesses) {
          // Transform API data to component format
          const transformedCafes = data.businesses.map((business: any) => ({
            id: business.id,
            name: business.business_name,
            cuisine: business.business_cuisines?.map((bc: any) => bc.cuisine_types?.name).filter(Boolean).join(", ") || "Various",
            location: business.district,
            rating: business.reviews?.length > 0 
              ? +(business.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / business.reviews.length).toFixed(1)
              : 4.5,
            reviews: business.reviews?.length || 0,
            image: business.cover_image_url || "/placeholder.svg?height=200&width=300",
            specialty: business.specialty || "Delicious home-cooked meals",
            priceRange: business.price_range || "$$",
            isOpen: business.status === 'active',
            slug: business.slug,
            description: business.description,
          }))
          setCafes(transformedCafes)
          setFilteredCafes(transformedCafes)
        } else {
          setCafes([])
          setFilteredCafes([])
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error)
        setCafes([])
        setFilteredCafes([])
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = [...cafes]

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cafe => 
        cafe.name.toLowerCase().includes(query) ||
        cafe.cuisine.toLowerCase().includes(query) ||
        cafe.location.toLowerCase().includes(query) ||
        cafe.specialty.toLowerCase().includes(query)
      )
    }

    // Cuisine filter
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(cafe => 
        selectedCuisines.some(cuisine => cafe.cuisine.toLowerCase().includes(cuisine.toLowerCase()))
      )
    }

    // Price range filter
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(cafe => 
        selectedPriceRanges.includes(cafe.priceRange)
      )
    }

    // Rating filter
    if (minRating) {
      filtered = filtered.filter(cafe => cafe.rating >= minRating)
    }

    // Open now filter
    if (openNow) {
      filtered = filtered.filter(cafe => cafe.isOpen)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price-asc':
          return a.priceRange.length - b.priceRange.length
        case 'price-desc':
          return b.priceRange.length - a.priceRange.length
        case 'distance':
          // Mock distance sorting - in real app would use user location
          return Math.random() - 0.5
        default:
          return 0
      }
    })

    setFilteredCafes(filtered)
  }, [searchQuery, selectedCuisines, selectedPriceRanges, minRating, openNow, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }
    router.push(`/browse?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCuisines([])
    setSelectedPriceRanges([])
    setMinRating(null)
    setOpenNow(false)
    setSortBy("rating")
  }

  const cuisineOptions = ["Peranakan", "Western Fusion", "Indian", "Chinese", "Desserts", "Healthy"]
  const priceOptions = ["$", "$$", "$$$"]
  const ratingOptions = [
    { value: 4.5, label: "4.5+ stars" },
    { value: 4.0, label: "4.0+ stars" },
    { value: 3.5, label: "3.5+ stars" }
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
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cafes, cuisines, or locations..."
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-orange-600 hover:bg-orange-700">
              Search
            </Button>
            <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 px-6">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(selectedCuisines.length > 0 || selectedPriceRanges.length > 0 || minRating || openNow) && (
                    <Badge className="ml-2 bg-orange-600">{
                      selectedCuisines.length + selectedPriceRanges.length + (minRating ? 1 : 0) + (openNow ? 1 : 0)
                    }</Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Cafes</DialogTitle>
                  <DialogDescription id="filter-cafes-desc">
                    Refine your search
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating (High to Low)</SelectItem>
                        <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                        <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cuisine */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cuisine</label>
                    <div className="space-y-2">
                      {cuisineOptions.map((cuisine) => (
                        <div key={cuisine} className="flex items-center space-x-2">
                          <Checkbox
                            id={cuisine}
                            checked={selectedCuisines.includes(cuisine)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCuisines([...selectedCuisines, cuisine])
                              } else {
                                setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine))
                              }
                            }}
                          />
                          <label htmlFor={cuisine} className="text-sm">{cuisine}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="space-y-2">
                      {priceOptions.map((price) => (
                        <div key={price} className="flex items-center space-x-2">
                          <Checkbox
                            id={price}
                            checked={selectedPriceRanges.includes(price)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPriceRanges([...selectedPriceRanges, price])
                              } else {
                                setSelectedPriceRanges(selectedPriceRanges.filter(p => p !== price))
                              }
                            }}
                          />
                          <label htmlFor={price} className="text-sm">{price}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                    <Select value={minRating != null ? minRating.toString() : "any"} onValueChange={(value) => setMinRating(value === "any" ? null : parseFloat(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any rating</SelectItem>
                        {ratingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Open Now */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="openNow"
                      checked={openNow}
                      onCheckedChange={(checked) => setOpenNow(checked === true)}
                    />
                    <label htmlFor="openNow" className="text-sm">Open now</label>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={clearFilters} variant="outline" className="flex-1">
                      Clear All
                    </Button>
                    <Button onClick={() => setIsFiltersOpen(false)} className="flex-1 bg-orange-600 hover:bg-orange-700">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </form>
          
          {/* Active Filters Display */}
          {(selectedCuisines.length > 0 || selectedPriceRanges.length > 0 || minRating || openNow) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCuisines.map((cuisine) => (
                <Badge key={cuisine} variant="outline" className="text-xs">
                  {cuisine}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine))}
                  />
                </Badge>
              ))}
              {selectedPriceRanges.map((price) => (
                <Badge key={price} variant="outline" className="text-xs">
                  {price}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedPriceRanges(selectedPriceRanges.filter(p => p !== price))}
                  />
                </Badge>
              ))}
              {minRating && (
                <Badge variant="outline" className="text-xs">
                  {minRating}+ stars
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => setMinRating(null)}
                  />
                </Badge>
              )}
              {openNow && (
                <Badge variant="outline" className="text-xs">
                  Open now
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => setOpenNow(false)}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6 px-2">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {searchQuery ? `Search results for "${searchQuery}": ` : ""}{filteredCafes.length} {filteredCafes.length === 1 ? 'cafe' : 'cafes'} found
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden h-full flex flex-col animate-pulse">
                <div className="bg-gray-200 w-full h-48"></div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCafes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafes.map((cafe) => (
              <Link key={cafe.id} href={`/cafe/${cafe.slug}`}>
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
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cafes found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? `No results for "${searchQuery}". Try adjusting your search or filters.` : "Try adjusting your filters to see more results."}
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}

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
