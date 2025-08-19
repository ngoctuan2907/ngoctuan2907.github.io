"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { useAuth } from '@/lib/auth-context'
import { useToast } from "@/components/ui/use-toast"

interface MenuItem {
  id?: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItem, setNewItem] = useState<MenuItem>({
    name: "",
    description: "",
    price: 0,
    category: "",
    available: true
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      // This would typically fetch from your menu API
      // For now, we'll use sample data
      setMenuItems([
        {
          id: "1",
          name: "Kueh Lapis",
          description: "Traditional layered cake with coconut and pandan flavors",
          price: 8.50,
          category: "Desserts",
          available: true
        },
        {
          id: "2", 
          name: "Laksa Lemak",
          description: "Rich and creamy coconut curry noodle soup",
          price: 12.80,
          category: "Main Dishes",
          available: true
        },
        {
          id: "3",
          name: "Ondeh Ondeh",
          description: "Sweet glutinous rice balls filled with gula melaka",
          price: 6.00,
          category: "Desserts",
          available: false
        }
      ])
    } catch (error) {
      console.error('Failed to fetch menu items:', error)
      toast({
        title: "Error",
        description: "Failed to load menu items. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || newItem.price <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive"
      })
      return
    }

    const item = { ...newItem, id: Date.now().toString() }
    setMenuItems([...menuItems, item])
    setNewItem({
      name: "",
      description: "",
      price: 0,
      category: "",
      available: true
    })
    
    toast({
      title: "Item Added",
      description: `${item.name} has been added to your menu.`,
    })
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem({ ...item })
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    setMenuItems(menuItems.map(item => 
      item.id === editingItem.id ? editingItem : item
    ))
    setEditingItem(null)
    
    toast({
      title: "Item Updated",
      description: `${editingItem.name} has been updated.`,
    })
  }

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
    toast({
      title: "Item Deleted",
      description: "Menu item has been removed.",
    })
  }

  const toggleAvailability = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600">Add, edit, and manage your menu items</p>
            </div>
          </div>
        </div>

        {/* Add New Item */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Menu Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Kueh Lapis"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (SGD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price || ""}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  placeholder="8.50"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="e.g., Desserts, Main Dishes"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe your menu item..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleAddItem} className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Menu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                {editingItem && editingItem.id === item.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                    />
                    <Input
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    />
                    <Textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => setEditingItem(null)} 
                        variant="outline" 
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                        <span className="font-semibold text-green-600">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="mb-3">
                      {item.category}
                    </Badge>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEditItem(item)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        onClick={() => toggleAvailability(item.id!)} 
                        variant="outline" 
                        size="sm"
                      >
                        {item.available ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                      <Button 
                        onClick={() => handleDeleteItem(item.id!)} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {menuItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items</h3>
              <p className="text-gray-600">Add your first menu item to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}