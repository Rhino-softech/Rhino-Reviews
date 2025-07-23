"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Edit, Trash2, Copy, ExternalLink, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { auth, db } from "@/firebase/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import Sidebar from "@/components/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Branch {
  id: string
  name: string
  location: string
  isActive: boolean
  googleReviewLink?: string
}

export default function LocationPage() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [newBranch, setNewBranch] = useState<Branch>({
    id: "",
    name: "",
    location: "",
    isActive: true,
    googleReviewLink: "",
  })
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [userPlan, setUserPlan] = useState<any>(null)
  const [hasLocationAccess, setHasLocationAccess] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [locationLimit, setLocationLimit] = useState(1)
  const [canAddMoreLocations, setCanAddMoreLocations] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const checkPlanAccess = (userData: any, currentBranchCount: number) => {
    let hasAccess = false
    let showPrompt = false
    let maxLocations = 1 // Default limit

    const hasActiveSubscription = userData.subscriptionActive === true

    if (hasActiveSubscription) {
      const planName = (userData.subscriptionPlan || "").toLowerCase()

      if (planName.includes("starter") || planName.includes("plan_basic")) {
        maxLocations = 3
        hasAccess = true
        showPrompt = false
      } else if (planName.includes("professional") || planName.includes("plan_pro")) {
        maxLocations = 5
        hasAccess = true
        showPrompt = false
      } else if (planName.includes("enterprise") || planName.includes("plan_premium") || planName.includes("custom")) {
        maxLocations = Number.POSITIVE_INFINITY // Unlimited locations for Enterprise
        hasAccess = true
        showPrompt = false
      } else {
        maxLocations = 1
        hasAccess = false
        showPrompt = true
      }
    } else if (userData.trialActive === true) {
      maxLocations = 1
      hasAccess = true
      showPrompt = false
    } else {
      maxLocations = 1
      hasAccess = false
      showPrompt = true
    }

    const canAddMore = maxLocations === Number.POSITIVE_INFINITY ? true : currentBranchCount < maxLocations

    return { hasAccess, showPrompt, maxLocations, canAddMore }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)
        await fetchUserData(user.uid)
      } else {
        setUserId(null)
        navigate("/login")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true)
      const userDoc = await getDoc(doc(db, "users", uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUserPlan(userData)

        const businessInfo = userData.businessInfo || {}
        setBusinessName(businessInfo.businessName || "Your Business")

        const branchesData = businessInfo.branches || []

        const formattedBranches = branchesData
          .filter((branch: any) => branch && typeof branch === "object")
          .map((branch: any, index: number) => ({
            id: branch.id || `branch-${Date.now()}-${index}`,
            name: branch.name || "Unnamed Branch",
            location: branch.location || "",
            isActive: branch.isActive !== undefined ? Boolean(branch.isActive) : true,
            googleReviewLink: branch.googleReviewLink || "",
          }))

        setBranches(formattedBranches)

        const { hasAccess, showPrompt, maxLocations, canAddMore } = checkPlanAccess(userData, formattedBranches.length)
        setHasLocationAccess(hasAccess)
        setShowUpgradePrompt(showPrompt)
        setLocationLimit(maxLocations)
        setCanAddMoreLocations(canAddMore)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Failed to load location data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddBranch = async () => {
    if (!userId) return

    if (!newBranch.name.trim() || !newBranch.location.trim()) {
      toast.error("Branch name and location are required")
      return
    }

    if (!newBranch.googleReviewLink?.trim()) {
      toast.error("Google review link is required for each location")
      return
    }

    if (!canAddMoreLocations) {
      toast.error(`You can only have ${locationLimit} location(s) on your current plan`)
      return
    }

    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const businessInfo = userData.businessInfo || {}
        const existingBranches = businessInfo.branches || []

        const branchId = `branch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

        const updatedBranch = {
          ...newBranch,
          id: branchId,
          isActive: newBranch.isActive !== undefined ? newBranch.isActive : true,
          googleReviewLink: newBranch.googleReviewLink.trim(),
        }

        const updatedBranches = [...existingBranches, updatedBranch]

        await updateDoc(userRef, {
          "businessInfo.branches": updatedBranches,
        })

        setBranches([...branches, updatedBranch])
        setIsAddDialogOpen(false)
        setNewBranch({
          id: "",
          name: "",
          location: "",
          isActive: true,
          googleReviewLink: "",
        })

        const { canAddMore } = checkPlanAccess(userPlan, branches.length + 1)
        setCanAddMoreLocations(canAddMore)

        toast.success("Branch added successfully")
      }
    } catch (error) {
      console.error("Error adding branch:", error)
      toast.error("Failed to add branch")
    }
  }

  const handleEditBranch = async () => {
    if (!userId || !currentBranch) return

    if (!currentBranch.name.trim() || !currentBranch.location.trim()) {
      toast.error("Branch name and location are required")
      return
    }

    if (!currentBranch.googleReviewLink?.trim()) {
      toast.error("Google review link is required for each location")
      return
    }

    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const businessInfo = userData.businessInfo || {}
        const existingBranches = businessInfo.branches || []

        const updatedBranches = existingBranches.map((branch: any) =>
          branch.id === currentBranch.id
            ? { ...currentBranch, googleReviewLink: currentBranch.googleReviewLink?.trim() }
            : branch,
        )

        await updateDoc(userRef, {
          "businessInfo.branches": updatedBranches,
        })

        setBranches(
          branches.map((branch) =>
            branch.id === currentBranch.id
              ? { ...currentBranch, googleReviewLink: currentBranch.googleReviewLink?.trim() }
              : branch,
          ),
        )

        setIsEditDialogOpen(false)
        setCurrentBranch(null)
        toast.success("Branch updated successfully")
      }
    } catch (error) {
      console.error("Error updating branch:", error)
      toast.error("Failed to update branch")
    }
  }

  const handleDeleteBranch = async () => {
    if (!userId || !currentBranch) return

    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const businessInfo = userData.businessInfo || {}
        const existingBranches = businessInfo.branches || []

        const updatedBranches = existingBranches.filter((branch: any) => branch.id !== currentBranch.id)

        await updateDoc(userRef, {
          "businessInfo.branches": updatedBranches,
        })

        setBranches(branches.filter((branch) => branch.id !== currentBranch.id))
        setIsDeleteDialogOpen(false)
        setCurrentBranch(null)

        const { canAddMore } = checkPlanAccess(userPlan, branches.length - 1)
        setCanAddMoreLocations(canAddMore)

        toast.success("Branch deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting branch:", error)
      toast.error("Failed to delete branch")
    }
  }

  const handleToggleActive = async (branch: Branch) => {
    if (!userId) return

    try {
      const updatedBranch = { ...branch, isActive: !branch.isActive }

      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const businessInfo = userData.businessInfo || {}
        const existingBranches = businessInfo.branches || []

        const updatedBranches = existingBranches.map((b: any) => (b.id === branch.id ? updatedBranch : b))

        await updateDoc(userRef, {
          "businessInfo.branches": updatedBranches,
        })

        setBranches(branches.map((b) => (b.id === branch.id ? updatedBranch : b)))

        toast.success(`Branch ${updatedBranch.isActive ? "activated" : "deactivated"} successfully`)
      }
    } catch (error) {
      console.error("Error toggling branch status:", error)
      toast.error("Failed to update branch status")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 md:ml-64">
            <div className="p-6">
              {/* Premium Plan Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Premium Plan</h3>
                      <p className="text-sm text-green-600">
                        Branch usage: {branches.length} /{" "}
                        {locationLimit === Number.POSITIVE_INFINITY ? "∞" : locationLimit}
                      </p>
                      <p className="text-xs text-green-600">
                        {locationLimit === Number.POSITIVE_INFINITY
                          ? "Unlimited branches"
                          : `${locationLimit} branches allowed`}{" "}
                        - 14 days left in trial - Renews on 23/08/2025
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                    onClick={() => window.location.assign("/#pricing")}
                  >
                    Manage Plan
                  </Button>
                </div>
              </div>

              {/* Branch Locations Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">Branch Locations</h1>
                      <p className="text-sm text-gray-600">Manage your business locations and settings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {branches.length} of {locationLimit === Number.POSITIVE_INFINITY ? "∞" : locationLimit}
                      </span>
                    </div>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!hasLocationAccess || !canAddMoreLocations}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Location
                    </Button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search branches by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Branches List */}
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : filteredBranches.length > 0 ? (
                  <div className="space-y-3">
                    {filteredBranches.map((branch) => (
                      <div
                        key={branch.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={branch.isActive}
                              onCheckedChange={() => handleToggleActive(branch)}
                              disabled={!hasLocationAccess}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{branch.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span>{branch.location}</span>
                            </div>
                          </div>
                          <Badge
                            variant={branch.isActive ? "default" : "secondary"}
                            className={branch.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                          >
                            {branch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {branch.googleReviewLink && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(branch.googleReviewLink || "")}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy Review Link</TooltipContent>
                            </Tooltip>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(branch.googleReviewLink, "_blank")}
                            disabled={!branch.googleReviewLink}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCurrentBranch(branch)
                              setIsEditDialogOpen(true)
                            }}
                            disabled={!hasLocationAccess}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCurrentBranch(branch)
                              setIsDeleteDialogOpen(true)
                            }}
                            disabled={!hasLocationAccess}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery
                        ? "No locations match your search."
                        : "Add your first business location to get started."}
                    </p>
                    {!searchQuery && hasLocationAccess && canAddMoreLocations && (
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Location
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Branch Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>Add a new branch or location for your business</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name *</Label>
                <Input
                  id="name"
                  placeholder="Main Office"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Address *</Label>
                <Textarea
                  id="location"
                  placeholder="123 Business St, City, State"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleReviewLink">Google Review Link *</Label>
                <Input
                  id="googleReviewLink"
                  placeholder="https://g.page/r/..."
                  value={newBranch.googleReviewLink}
                  onChange={(e) => setNewBranch({ ...newBranch, googleReviewLink: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Add your Google My Business review link for this specific location
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active Location
                </Label>
                <Switch
                  id="isActive"
                  checked={newBranch.isActive}
                  onCheckedChange={(checked) => setNewBranch({ ...newBranch, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBranch} className="bg-purple-600 hover:bg-purple-700">
                Add Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Branch Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
              <DialogDescription>Update your branch or location details</DialogDescription>
            </DialogHeader>
            {currentBranch && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Branch Name *</Label>
                  <Input
                    id="edit-name"
                    value={currentBranch.name}
                    onChange={(e) => setCurrentBranch({ ...currentBranch, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Address *</Label>
                  <Textarea
                    id="edit-location"
                    value={currentBranch.location}
                    onChange={(e) => setCurrentBranch({ ...currentBranch, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-googleReviewLink">Google Review Link *</Label>
                  <Input
                    id="edit-googleReviewLink"
                    value={currentBranch.googleReviewLink || ""}
                    onChange={(e) => setCurrentBranch({ ...currentBranch, googleReviewLink: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-isActive" className="cursor-pointer">
                    Active Location
                  </Label>
                  <Switch
                    id="edit-isActive"
                    checked={currentBranch.isActive}
                    onCheckedChange={(checked) => setCurrentBranch({ ...currentBranch, isActive: checked })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditBranch} className="bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Branch Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Location</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this location? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {currentBranch && (
              <div className="py-4">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-red-100">
                        <MapPin className="h-4 w-4 text-red-500" />
                      </div>
                      <h3 className="font-bold text-gray-800">{currentBranch.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{currentBranch.location}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteBranch}>
                Delete Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
