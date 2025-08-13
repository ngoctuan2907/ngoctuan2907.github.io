"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface TickerAd {
  id: string
  shop_id: string
  shop_name: string
  shop_slug: string
  tier: 'standard' | 'top'
  end_at: string
}

export function AdTicker() {
  const [ads, setAds] = useState<TickerAd[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads/ticker')
        const data = await response.json()
        
        if (data.success && data.ads && data.ads.length > 0) {
          setAds(data.ads)
          setIsVisible(true)
        }
      } catch (error) {
        console.error('Failed to fetch ticker ads:', error)
      }
    }

    fetchAds()
  }, [])

  useEffect(() => {
    if (ads.length <= 1) return

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
    }, 4000) // Rotate every 4 seconds

    return () => clearInterval(interval)
  }, [ads.length])

  if (!isVisible || ads.length === 0) {
    return null
  }

  const currentAd = ads[currentAdIndex]

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              currentAd.tier === 'top' ? 'bg-yellow-400 text-yellow-900' : 'bg-white text-gray-900'
            }`}
          >
            {currentAd.tier === 'top' ? '⭐ FEATURED' : 'SPONSORED'}
          </Badge>
          <span className="text-sm font-medium">
            🍽️ Check out <strong>{currentAd.shop_name}</strong> - Amazing food awaits!
          </span>
        </div>
        
        <Link 
          href={`/cafe/${currentAd.shop_slug || currentAd.shop_id}`}
          className="flex items-center text-sm hover:text-orange-200 transition-colors"
        >
          Visit Now
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      {ads.length > 1 && (
        <div className="flex justify-center mt-1 space-x-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentAdIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
