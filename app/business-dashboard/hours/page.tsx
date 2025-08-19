"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Clock, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DayHours {
  open: string
  close: string
  isOpen: boolean
}

interface BusinessHours {
  [key: string]: DayHours
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

export default function BusinessHours() {
  const [hours, setHours] = useState<BusinessHours>({
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '18:00', isOpen: true },
    friday: { open: '09:00', close: '18:00', isOpen: true },
    saturday: { open: '10:00', close: '16:00', isOpen: true },
    sunday: { open: '10:00', close: '16:00', isOpen: false },
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const updateDayHours = (day: string, field: keyof DayHours, value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const copyToAllDays = (sourceDay: string) => {
    const sourceHours = hours[sourceDay]
    const newHours = { ...hours }
    
    DAYS.forEach(day => {
      if (day.key !== sourceDay) {
        newHours[day.key] = { ...sourceHours }
      }
    })
    
    setHours(newHours)
    toast({
      title: "Hours Copied",
      description: `${DAYS.find(d => d.key === sourceDay)?.label}'s hours have been applied to all days.`,
    })
  }

  const handleSave = async () => {
    setLoading(true)
    
    try {
      // Here you would typically save to your API
      // await fetch('/api/business-hours', { method: 'PUT', body: JSON.stringify(hours) })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Hours Updated",
        description: "Your business hours have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business hours. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">Business Hours</h1>
              <p className="text-gray-600">Set your operating hours for each day of the week</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Hours"}
          </Button>
        </div>

        {/* Hours Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {DAYS.map((day) => (
              <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-20">
                    <Label className="font-medium">{day.label}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={hours[day.key].isOpen}
                      onCheckedChange={(checked) => updateDayHours(day.key, 'isOpen', checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {hours[day.key].isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                
                {hours[day.key].isOpen && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Open:</Label>
                      <input
                        type="time"
                        value={hours[day.key].open}
                        onChange={(e) => updateDayHours(day.key, 'open', e.target.value)}
                        className="px-3 py-1 border rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Close:</Label>
                      <input
                        type="time"
                        value={hours[day.key].close}
                        onChange={(e) => updateDayHours(day.key, 'close', e.target.value)}
                        className="px-3 py-1 border rounded"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToAllDays(day.key)}
                    >
                      Copy to All
                    </Button>
                  </div>
                )}
                
                {!hours[day.key].isOpen && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 italic">Closed all day</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToAllDays(day.key)}
                    >
                      Copy to All
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const standardHours = { open: '09:00', close: '17:00', isOpen: true }
                  const newHours = { ...hours }
                  DAYS.forEach(day => {
                    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.key)) {
                      newHours[day.key] = { ...standardHours }
                    }
                  })
                  setHours(newHours)
                  toast({
                    title: "Standard Hours Applied",
                    description: "Monday to Friday set to 9:00 AM - 5:00 PM",
                  })
                }}
              >
                Standard Business Hours (9-5, Mon-Fri)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const allOpen = { open: '10:00', close: '18:00', isOpen: true }
                  const newHours = { ...hours }
                  DAYS.forEach(day => {
                    newHours[day.key] = { ...allOpen }
                  })
                  setHours(newHours)
                  toast({
                    title: "Daily Hours Applied",
                    description: "All days set to 10:00 AM - 6:00 PM",
                  })
                }}
              >
                Open Daily (10-6)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const allClosed = { open: '09:00', close: '17:00', isOpen: false }
                  const newHours = { ...hours }
                  DAYS.forEach(day => {
                    newHours[day.key] = { ...allClosed }
                  })
                  setHours(newHours)
                  toast({
                    title: "All Days Closed",
                    description: "All days have been set to closed",
                  })
                }}
              >
                Close All Days
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hours Preview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hours Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DAYS.map((day) => (
                <div key={day.key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{day.label}</span>
                  <span className={hours[day.key].isOpen ? "text-green-600" : "text-red-600"}>
                    {hours[day.key].isOpen 
                      ? `${hours[day.key].open} - ${hours[day.key].close}`
                      : "Closed"
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}