"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Edit, Trash2, Copy, ExternalLink, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  const [renewalDate, setRenewalDate] = useState("")
  const [planName, setPlanName] = useState("Trial")

  const checkPlanAccess = (userData: any, currentBranchCount: number) => {
    let hasAccess = false
    let showPrompt = false
    let maxLocations = 1 // Default limit
    let planDisplayName = "Trial"

    const hasActiveSubscription = userData.subscriptionActive === true
    const isTrialActive = userData.trialActive === true

    if (hasActiveSubscription) {
      const planName = (userData.subscriptionPlan || "").toLowerCase()

      if (planName.includes("starter") || planName.includes("plan_basic")) {
        maxLocations = 3
        hasAccess = true
        showPrompt = false
        planDisplayName = "Starter"
      } else if (planName.includes("professional") || planName.includes("plan_pro")) {
        maxLocations = 5
        hasAccess = true
        showPrompt = false
        planDisplayName = "Professional"
      } else if (planName.includes("enterprise") || planName.includes("plan_premium") || planName.includes("custom")) {
        maxLocations = Number.POSITIVE_INFINITY // Unlimited locations for Enterprise
        hasAccess = true
        showPrompt = false
        planDisplayName = "Enterprise"
      } else {
        maxLocations = 1
        hasAccess = false
        showPrompt = true
        planDisplayName = "Free"
      }
    } else if (isTrialActive) {
      maxLocations = 1
      hasAccess = true
      showPrompt = false
      planDisplayName = "Trial"
    } else {
      maxLocations = 1
      hasAccess = false
      showPrompt = true
      planDisplayName = "Free"
    }

    const canAddMore = maxLocations === Number.POSITIVE_INFINITY ? true : currentBranchCount < maxLocations

    return { hasAccess, showPrompt, maxLocations, canAddMore, planDisplayName }
  }

  const calculateTrialDaysLeft = (trialEndDate: any) => {
    if (!trialEndDate) return 0

    const endDate = trialEndDate.toDate ? trialEndDate.toDate() : new Date(trialEndDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const formatRenewalDate = (date: any) => {
    if (!date) return ""

    const renewal = date.toDate ? date.toDate() : new Date(date)
    return renewal.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
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

        // Calculate trial days left if trial is active
        if (userData.trialActive && userData.trialEndDate) {
          const daysLeft = calculateTrialDaysLeft(userData.trialEndDate)
          setTrialDaysLeft(daysLeft)
        }

        // Set renewal date if subscription exists
        if (userData.subscriptionEndDate) {
          setRenewalDate(formatRenewalDate(userData.subscriptionEndDate))
        }

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

        const { hasAccess, showPrompt, maxLocations, canAddMore, planDisplayName } = checkPlanAccess(
          userData,
          formattedBranches.length,
        )
        setHasLocationAccess(hasAccess)
        setShowUpgradePrompt(showPrompt)
        setLocationLimit(maxLocations)
        setCanAddMoreLocations(canAddMore)
        setPlanName(planDisplayName)
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

  const activeBranchesCount = branches.filter((branch) => branch.isActive).length
  const inactiveBranchesCount = branches.length - activeBranchesCount

  const getPlanCardColors = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return {
          bg: "bg-gradient-to-br from-purple-600 to-indigo-700",
          border: "border-purple-700",
          text: "text-white",
          iconBg: "bg-white/20",
          buttonBorder: "border-white/30",
          buttonText: "text-white",
          buttonHoverBg: "hover:bg-white/10",
        }
      case "Professional":
        return {
          bg: "bg-gradient-to-br from-blue-600 to-cyan-700",
          border: "border-blue-700",
          text: "text-white",
          iconBg: "bg-white/20",
          buttonBorder: "border-white/30",
          buttonText: "text-white",
          buttonHoverBg: "hover:bg-white/10",
        }
      case "Starter":
        return {
          bg: "bg-gradient-to-br from-green-600 to-emerald-700",
          border: "border-green-700",
          text: "text-white",
          iconBg: "bg-white/20",
          buttonBorder: "border-white/30",
          buttonText: "text-white",
          buttonHoverBg: "hover:bg-white/10",
        }
      default: // Trial/Free
        return {
          bg: "bg-gradient-to-br from-gray-600 to-gray-700",
          border: "border-gray-700",
          text: "text-white",
          iconBg: "bg-white/20",
          buttonBorder: "border-white/30",
          buttonText: "text-white",
          buttonHoverBg: "hover:bg-white/10",
        }
    }
  }

  const planColors = getPlanCardColors(planName)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-4 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-fade-in-down">
                Location Management
              </h1>
              <div className="flex items-center text-gray-600 text-sm sm:text-lg">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
                <p>Manage your business locations for reviews and more.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Plan Card */}
              <Card
                className={`${planColors.bg} ${planColors.border} border shadow-lg rounded-xl transition-all duration-300 hover:scale-[1.005] hover:shadow-xl`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${planColors.text}`}>Your Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${planColors.iconBg} rounded-full flex items-center justify-center`}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-xl sm:text-2xl font-bold ${planColors.text}`}>{planName}</h3>
                        <p className={`text-xs sm:text-sm ${planColors.text} opacity-80`}>
                          {locationLimit === Number.POSITIVE_INFINITY
                            ? "Unlimited locations"
                            : `${branches.length} of ${locationLimit} locations used`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${planColors.buttonBorder} ${planColors.buttonText} ${planColors.buttonHoverBg} bg-transparent transition-all duration-200 w-full sm:w-auto`}
                      onClick={() => window.location.assign("/#pricing")}
                    >
                      Manage Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Branch Locations Section */}
            <Card className="border border-gray-200 shadow-lg rounded-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Branch Locations</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600">Manage your business locations and settings.</p>
                  </div>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                    disabled={!hasLocationAccess || !canAddMoreLocations}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="relative mb-4 sm:mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search branches by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                {/* Branches List */}
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : filteredBranches.length > 0 ? (
                  <div className="grid gap-3 sm:gap-4">
                    {filteredBranches.map((branch) => (
                      <Card
                        key={branch.id}
                        className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={branch.isActive}
                              onCheckedChange={() => handleToggleActive(branch)}
                              disabled={!hasLocationAccess}
                              className="data-[state=checked]:bg-green-500 h-5 w-9"
                            />
                            <div
                              className={`w-2 h-2 rounded-full ${branch.isActive ? "bg-green-500" : "bg-gray-400"}`}
                            ></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{branch.name}</h3>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{branch.location}</span>
                            </div>
                          </div>
                          <Badge
                            variant={branch.isActive ? "default" : "secondary"}
                            className={
                              branch.isActive
                                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs sm:text-sm"
                                : "bg-gray-200 text-gray-600 text-xs sm:text-sm"
                            }
                          >
                            {branch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 ml-auto sm:ml-0 w-full sm:w-auto justify-end sm:justify-start">
                          {branch.googleReviewLink && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(branch.googleReviewLink || "")}
                                  className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200"
                                >
                                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="sr-only">Copy Review Link</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy Review Link</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => window.open(branch.googleReviewLink, "_blank")}
                                disabled={!branch.googleReviewLink}
                                className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="sr-only">Open Review Link</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Open Review Link</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setCurrentBranch(branch)
                                  setIsEditDialogOpen(true)
                                }}
                                disabled={!hasLocationAccess}
                                className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="sr-only">Edit Location</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Location</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setCurrentBranch(branch)
                                  setIsDeleteDialogOpen(true)
                                }}
                                disabled={!hasLocationAccess}
                                className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="sr-only">Delete Location</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Location</TooltipContent>
                          </Tooltip>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4 animate-bounce-slow" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No locations found</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      {searchQuery
                        ? "No locations match your search."
                        : "Add your first business location to get started."}
                    </p>
                    {!searchQuery && hasLocationAccess && canAddMoreLocations && (
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Add Your First Location
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Add Branch Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-xl shadow-lg">
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
                  className="focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Address *</Label>
                <Textarea
                  id="location"
                  placeholder="123 Business St, City, State"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                  className="focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleReviewLink">Google Review Link *</Label>
                <Input
                  id="googleReviewLink"
                  placeholder="https://g.page/r/..."
                  value={newBranch.googleReviewLink}
                  onChange={(e) => setNewBranch({ ...newBranch, googleReviewLink: e.target.value })}
                  className="focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500">
                  Add your Google My Business review link for this specific location
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="cursor-pointer text-sm sm:text-base">
                  Active Location
                </Label>
                <Switch
                  id="isActive"
                  checked={newBranch.isActive}
                  onCheckedChange={(checked) => setNewBranch({ ...newBranch, isActive: checked })}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBranch}
                className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
              >
                Add Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Branch Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-xl shadow-lg">
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
                    className="focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Address *</Label>
                  <Textarea
                    id="edit-location"
                    value={currentBranch.location}
                    onChange={(e) => setCurrentBranch({ ...currentBranch, location: e.target.value })}
                    className="focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-googleReviewLink">Google Review Link *</Label>
                  <Input
                    id="edit-googleReviewLink"
                    value={currentBranch.googleReviewLink || ""}
                    onChange={(e) => setCurrentBranch({ ...currentBranch, googleReviewLink: e.target.value })}
                    className="focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-isActive" className="cursor-pointer text-sm sm:text-base">
                    Active Location
                  </Label>
                  <Switch
                    id="edit-isActive"
                    checked={currentBranch.isActive}
                    onCheckedChange={(checked) => setCurrentBranch({ ...currentBranch, isActive: checked })}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditBranch}
                className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Branch Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle>Delete Location</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this location? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {currentBranch && (
              <div className="py-4">
                <Card className="border-red-200 bg-red-50 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-red-100">
                        <MapPin className="h-4 w-4 text-red-500" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base">{currentBranch.name}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">{currentBranch.location}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteBranch}
                className="shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
              >
                Delete Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}