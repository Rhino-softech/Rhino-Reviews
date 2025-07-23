// components/sharable-links.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Copy, ExternalLink, Clock, Trash2, Plus } from "lucide-react"
import { doc, setDoc, getDocs, collection, query, where, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from "uuid"

interface SharableLink {
  id: string
  slug: string
  expiresAt: Date
  createdAt: Date
  isActive: boolean
  url: string
}

export default function SharableLinks({ currentUser, baseUrl }: { currentUser: any; baseUrl: string }) {
  const [links, setLinks] = useState<SharableLink[]>([])
  const [loading, setLoading] = useState(true)
  const [newLinkDays, setNewLinkDays] = useState(7)
  const [newLinkHours, setNewLinkHours] = useState(0)
  const [newLinkMinutes, setNewLinkMinutes] = useState(0)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    const fetchLinks = async () => {
      try {
        const q = query(collection(db, "users", currentUser.uid, "sharable_links"))
        const querySnapshot = await getDocs(q)
        
        const linksData: SharableLink[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          linksData.push({
            id: doc.id,
            slug: data.slug,
            expiresAt: data.expiresAt.toDate(),
            createdAt: data.createdAt.toDate(),
            isActive: data.isActive,
            url: `${baseUrl}/s/${data.slug}`
          })
        })

        setLinks(linksData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      } catch (error) {
        console.error("Error fetching sharable links:", error)
        toast.error("Failed to load sharable links")
      } finally {
        setLoading(false)
      }
    }

    fetchLinks()
  }, [currentUser, baseUrl])

  const createNewLink = async () => {
    if (!currentUser) return
    setIsCreating(true)

    try {
      const totalHours = (newLinkDays * 24) + newLinkHours + (newLinkMinutes / 60)
      if (totalHours <= 0) {
        toast.error("Duration must be greater than 0")
        return
      }

      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + totalHours)

      const slug = uuidv4().split('-')[0] // Use first part of UUID as slug
      const linkData = {
        slug,
        expiresAt,
        createdAt: serverTimestamp(),
        isActive: true
      }

      await setDoc(doc(db, "users", currentUser.uid, "sharable_links", slug), linkData)

      const newLink = {
        id: slug,
        slug,
        expiresAt,
        createdAt: new Date(),
        isActive: true,
        url: `${baseUrl}/s/${slug}`
      }

      setLinks([newLink, ...links])
      toast.success("Sharable link created!")
      
      // Reset form
      setNewLinkDays(7)
      setNewLinkHours(0)
      setNewLinkMinutes(0)
    } catch (error) {
      console.error("Error creating sharable link:", error)
      toast.error("Failed to create sharable link")
    } finally {
      setIsCreating(false)
    }
  }

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      await setDoc(doc(db, "users", currentUser.uid, "sharable_links", linkId), {
        isActive: !currentStatus
      }, { merge: true })

      setLinks(links.map(link => 
        link.id === linkId ? { ...link, isActive: !currentStatus } : link
      ))
      toast.success(`Link ${currentStatus ? "deactivated" : "activated"}`)
    } catch (error) {
      console.error("Error toggling link status:", error)
      toast.error("Failed to update link status")
    }
  }

  const deleteLink = async (linkId: string) => {
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "sharable_links", linkId))
      setLinks(links.filter(link => link.id !== linkId))
      toast.success("Link deleted successfully")
    } catch (error) {
      console.error("Error deleting link:", error)
      toast.error("Failed to delete link")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Link copied to clipboard!")
  }

  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ExternalLink className="h-5 w-5 mr-2" />
          Sharable Links
        </CardTitle>
        <CardDescription>
          Create time-limited links to collect reviews from specific customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <h3 className="font-medium text-gray-800">Create New Link</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="days">Days</Label>
                <Input
                  id="days"
                  type="number"
                  min="0"
                  value={newLinkDays}
                  onChange={(e) => setNewLinkDays(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={newLinkHours}
                  onChange={(e) => setNewLinkHours(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={newLinkMinutes}
                  onChange={(e) => setNewLinkMinutes(Number(e.target.value))}
                />
              </div>
            </div>

            <Button
              onClick={createNewLink}
              disabled={isCreating}
              className="mt-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            >
              {isCreating ? "Creating..." : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sharable Link
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Your Active Links</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sharable links created yet
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-rose-600 hover:underline"
                          >
                            {link.url}
                          </a>
                          <Badge variant={link.isActive ? "default" : "secondary"}>
                            {link.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {new Date() > link.expiresAt && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            Expires {formatDistanceToNow(link.expiresAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(link.url)}
                                className="text-gray-500 hover:text-rose-500"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy link</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Switch
                          checked={link.isActive}
                          onCheckedChange={() => toggleLinkStatus(link.id, link.isActive)}
                          disabled={new Date() > link.expiresAt}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLink(link.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}