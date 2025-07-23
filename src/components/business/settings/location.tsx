"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Edit, Trash2, Copy, ExternalLink, AlertCircle } from 'lucide-react'
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
import { motion } from "framer-motion"
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
      } else if (
        planName.includes("enterprise") ||
        planName.includes("plan_premium") ||
        planName.includes("custom")
      ) {
        maxLocations = Infinity // Unlimited locations for Enterprise
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

    const canAddMore = maxLocations === Infinity ? true : currentBranchCount < maxLocations

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

        const { hasAccess, showPrompt, maxLocations, canAddMore } = checkPlanAccess(
          userData,
          formattedBranches.length,
        )
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="flex flex-col md:flex-row">
          <Sidebar />
          <div className="flex-1 md:ml-64 p-3 sm:p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="space-y-6 lg:space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="text-center mb-8 lg:mb-12"
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Location Management
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Manage your business locations and customize review collection for each branch
                  </p>
                </motion.div>

                {/* Plan Info and Upgrade Prompt */}
                <motion.div
                  className="mb-6 lg:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="flex-shrink-0"
                    >
                      <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-blue-800 font-semibold text-base sm:text-lg mb-2">
                        📍 Location Limits by Plan:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white/60 p-3 rounded-lg">
                          <span className="font-bold text-blue-700">Trial:</span> 1 location
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <span className="font-bold text-blue-700">Basic:</span> 3 locations
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <span className="font-bold text-blue-700">Professional:</span> 5 locations
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <span className="font-bold text-blue-700">Enterprise:</span> Unlimited locations
                        </div>
                      </div>
                      <p className="text-blue-700 mt-3">
                        Current: <strong>{branches.length}{locationLimit === Infinity ? "" : `/${locationLimit}`}</strong> locations used
                        {showUpgradePrompt && (
                          <button
                            onClick={() => window.location.assign("/#pricing")}
                            className="ml-2 font-bold text-blue-900 hover:underline hover:text-blue-700 transition-colors"
                          >
                            Upgrade your plan
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                  className="bg-white/90 border border-slate-200/60 rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Your Locations</h2>
                      <p className="text-slate-600 text-sm sm:text-base">
                        Manage your business branches and customize review collection settings for each location
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-semibold text-sm ${
                        !hasLocationAccess || !canAddMoreLocations ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!hasLocationAccess || !canAddMoreLocations}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Location
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : branches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {branches.map((branch, index) => (
                        <motion.div
                          key={branch.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={`relative group overflow-hidden rounded-xl lg:rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                            branch.isActive
                              ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                              : "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-100"
                          }`}
                        >
                          <div className="p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    branch.isActive
                                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                      : "bg-gradient-to-r from-gray-300 to-slate-400"
                                  }`}
                                >
                                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-800 text-base sm:text-lg">{branch.name}</h3>
                                  <Badge
                                    variant={branch.isActive ? "success" : "secondary"}
                                    className={`mt-1 ${
                                      branch.isActive
                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                                  >
                                    {branch.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 rounded-lg"
                                      onClick={() => {
                                        setCurrentBranch(branch)
                                        setIsEditDialogOpen(true)
                                      }}
                                      disabled={!hasLocationAccess}
                                    >
                                      <Edit className="h-4 w-4 text-slate-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Location</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => {
                                        setCurrentBranch(branch)
                                        setIsDeleteDialogOpen(true)
                                      }}
                                      disabled={!hasLocationAccess}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Location</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                <p className="text-slate-700 text-sm">{branch.location}</p>
                              </div>
                              {branch.googleReviewLink && (
                                <div className="flex items-start gap-2">
                                  <ExternalLink className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex flex-col">
                                    <p className="text-slate-700 text-sm mb-1">Google Review Link:</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                                        {branch.googleReviewLink}
                                      </p>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 rounded-md"
                                        onClick={() => copyToClipboard(branch.googleReviewLink || "")}
                                      >
                                        <Copy className="h-3 w-3 text-slate-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                              <span className="text-xs text-slate-500">
                                {branch.isActive ? "Visible to customers" : "Hidden from customers"}
                              </span>
                              <Switch
                                checked={branch.isActive}
                                onCheckedChange={() => handleToggleActive(branch)}
                                disabled={!hasLocationAccess}
                                className={!hasLocationAccess ? "opacity-50 cursor-not-allowed" : ""}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      className="text-center py-12 lg:py-16"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2">No Locations Found</h3>
                      <p className="text-slate-500 text-base sm:text-lg mb-6 lg:mb-8 max-w-md mx-auto">
                        {hasLocationAccess
                          ? "Add your first business location to start collecting location-specific reviews."
                          : "Upgrade your plan to add multiple business locations."}
                      </p>
                      {hasLocationAccess && canAddMoreLocations && (
                        <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Add Your First Location
                        </Button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Add Branch Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Location</DialogTitle>
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
                <p className="text-xs text-slate-500">
                  <strong>Required:</strong> Add your Google My Business review link for this specific location
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
              <Button onClick={handleAddBranch}>Add Location</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Branch Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Location</DialogTitle>
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
                  <p className="text-xs text-slate-500">
                    <strong>Required:</strong> Add your Google My Business review link for this specific location
                  </p>
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
              <Button onClick={handleEditBranch}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Branch Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Delete Location</DialogTitle>
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
                      <h3 className="font-bold text-slate-800">{currentBranch.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{currentBranch.location}</p>
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