"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { SimpleAdminLayout } from "@/components/simple-admin-layout"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  RefreshCw,
  MoreVertical,
  Trash2,
  User,
  Edit,
  UserPlus,
  Eye,
  EyeOff,
  Crown,
  DollarSign,
  Calendar,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { collection, getDocs, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getAuth, createUserWithEmailAndPassword, updatePassword, deleteUser } from "firebase/auth"

interface UserInterface {
  uid: string
  displayName: string
  email: string
  role: "ADMIN" | "BUSER"
  status: "Active" | "Inactive" | "Deleted"
  createdAt: Date
  businessName?: string
  password?: string
  confirmPassword?: string
  subscriptionPlan?: string
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  trialActive?: boolean
  trialEndDate?: Date
}

interface UserFormData {
  displayName: string
  email: string
  role: "ADMIN" | "BUSER" | ""
  status: "Active" | "Inactive" | "Deleted" | ""
  password?: string
  confirmPassword?: string
  subscriptionPlan?: string
  planDuration?: string
  trialActive?: boolean
  trialDays?: number
}

interface PlanOption {
  id: string
  name: string
  price: number
  features: string[]
}

export default function UsersPage() {
  const { toast } = useToast()
  const auth = getAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [businessUsers, setBusinessUsers] = useState<UserInterface[]>([])
  const [adminUsers, setAdminUsers] = useState<UserInterface[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserInterface | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([])
  const [formData, setFormData] = useState<UserFormData>({
    displayName: "",
    email: "",
    role: "",
    status: "Active",
    password: "",
    confirmPassword: "",
    subscriptionPlan: "",
    planDuration: "1",
    trialActive: false,
    trialDays: 7,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserInterface | null>(null)

  // Fetch available subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const pricingRef = doc(db, "admin", "pricing")
        const pricingDoc = await getDoc(pricingRef)
        if (pricingDoc.exists()) {
          const data = pricingDoc.data()
          const plans: PlanOption[] = [
            {
              id: "starter",
              name: "Starter Plan",
              price: data.starter || 49,
              features: ["100 reviews/month", "Basic templates", "Email support"],
            },
            {
              id: "professional",
              name: "Professional Plan",
              price: data.professional || 99,
              features: ["500 reviews/month", "Advanced templates", "Priority support", "Analytics"],
            },
            {
              id: "custom",
              name: "Enterprise Plan",
              price: data.custom || 299,
              features: ["Unlimited reviews", "Custom templates", "Dedicated support", "White-label"],
            },
          ]
          setAvailablePlans(plans)
        }
      } catch (error) {
        console.error("Error fetching plans:", error)
      }
    }

    fetchPlans()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setRefreshing(true)
        const usersCollection = collection(db, "users")
        const usersSnapshot = await getDocs(usersCollection)

        const businessData: UserInterface[] = []
        const adminData: UserInterface[] = []

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data()
          const createdAt = userData.createdAt?.toDate() || new Date()

          const userObj = {
            uid: userDoc.id,
            displayName: userData.displayName || "No Name",
            email: userData.email || "No Email",
            role: userData.role || "BUSER",
            status: userData.status || "Active",
            createdAt,
            businessName: userData.businessInfo?.businessName,
            subscriptionPlan: userData.subscriptionPlan,
            subscriptionStartDate: userData.subscriptionStartDate?.toDate(),
            subscriptionEndDate: userData.subscriptionEndDate?.toDate(),
            trialActive: userData.trialActive,
            trialEndDate: userData.trialEndDate?.toDate(),
          }

          if (userObj.role === "BUSER") {
            businessData.push(userObj)
          } else if (userObj.role === "ADMIN") {
            adminData.push(userObj)
          }
        })

        setBusinessUsers(businessData)
        setAdminUsers(adminData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setRefreshing(false)
      }
    }

    fetchUsers()

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const updatedBusinessUsers: UserInterface[] = []
        const updatedAdminUsers: UserInterface[] = []

        snapshot.forEach((userDoc) => {
          const userData = userDoc.data()
          const createdAt = userData.createdAt?.toDate() || new Date()

          const userObj = {
            uid: userDoc.id,
            displayName: userData.displayName || "No Name",
            email: userData.email || "No Email",
            role: userData.role || "BUSER",
            status: userData.status || "Active",
            createdAt,
            businessName: userData.businessInfo?.businessName,
            subscriptionPlan: userData.subscriptionPlan,
            subscriptionStartDate: userData.subscriptionStartDate?.toDate(),
            subscriptionEndDate: userData.subscriptionEndDate?.toDate(),
            trialActive: userData.trialActive,
            trialEndDate: userData.trialEndDate?.toDate(),
          }

          if (userObj.role === "BUSER") {
            updatedBusinessUsers.push(userObj)
          } else if (userObj.role === "ADMIN") {
            updatedAdminUsers.push(userObj)
          }
        })

        setBusinessUsers(updatedBusinessUsers)
        setAdminUsers(updatedAdminUsers)
      },
      (error) => {
        console.error("Error listening to users updates:", error)
      },
    )

    return () => unsubscribe()
  }, [toast])

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      toast({
        title: "Status Updated",
        description: "User status has been changed successfully.",
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteUser = (user: UserInterface) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      // First delete the user from Firebase Authentication
      const user = auth.currentUser
      if (user && user.uid === userToDelete.uid) {
        await deleteUser(user)
      }

      // Then delete the user document from Firestore
      const userRef = doc(db, "users", userToDelete.uid)
      await deleteDoc(userRef)

      toast({
        title: "User Deleted",
        description: "User has been permanently deleted.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const filteredBusinessUsers = businessUsers.filter(
    (user) =>
      (user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.businessName && user.businessName.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (statusFilter === "all" || user.status === statusFilter),
  )

  const filteredAdminUsers = adminUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:shadow-green-200 transition-shadow"
      case "Inactive":
        return "bg-gray-100 text-gray-800 hover:shadow-gray-200 transition-shadow"
      case "Deleted":
        return "bg-gray-300 text-gray-800 line-through"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPlanColor = (plan?: string) => {
    switch (plan?.toLowerCase()) {
      case "starter":
        return "bg-green-100 text-green-800 border-green-200"
      case "professional":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "custom":
      case "enterprise":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const formatPlanName = (plan?: string) => {
    if (!plan) return "No Plan"
    const planMap: Record<string, string> = {
      starter: "Starter",
      professional: "Professional",
      custom: "Enterprise",
    }
    return planMap[plan.toLowerCase()] || plan
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const openEditDialog = (user: UserInterface) => {
    setEditingUser(user)
    setFormData({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
      confirmPassword: "",
      subscriptionPlan: user.subscriptionPlan || "",
      planDuration: "1",
      trialActive: user.trialActive || false,
      trialDays: 7,
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingUser(null)
    setFormData({
      displayName: "",
      email: "",
      role: "",
      status: "Active",
      password: "",
      confirmPassword: "",
      subscriptionPlan: "",
      planDuration: "1",
      trialActive: false,
      trialDays: 7,
    })
    setIsDialogOpen(true)
  }

  const closeEditDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      displayName: "",
      email: "",
      role: "",
      status: "",
      password: "",
      confirmPassword: "",
      subscriptionPlan: "",
      planDuration: "1",
      trialActive: false,
      trialDays: 7,
    })
  }

  const handleFormChange = (field: keyof UserFormData, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveUser = async () => {
    if (!formData.displayName || !formData.email || !formData.role || !formData.status) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!editingUser && (!formData.password || !formData.confirmPassword)) {
      toast({
        title: "Validation Error",
        description: "Password is required for new users.",
        variant: "destructive",
      })
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const now = new Date()
      const subscriptionData: any = {}

      // Handle subscription plan assignment for business users
      if (formData.role === "BUSER" && formData.subscriptionPlan) {
        const planDurationMonths = Number.parseInt(formData.planDuration || "1")
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + planDurationMonths)

        subscriptionData.subscriptionPlan = formData.subscriptionPlan
        subscriptionData.subscriptionStartDate = now
        subscriptionData.subscriptionEndDate = endDate
        subscriptionData.trialActive = formData.trialActive

        if (formData.trialActive && formData.trialDays) {
          const trialEnd = new Date(now)
          trialEnd.setDate(trialEnd.getDate() + formData.trialDays)
          subscriptionData.trialEndDate = trialEnd
        }
      } else if (formData.role === "BUSER" && !formData.subscriptionPlan) {
        // For business users without a plan, set up a default trial
        const trialEnd = new Date(now)
        trialEnd.setDate(trialEnd.getDate() + 14) // 14-day default trial

        subscriptionData.trialActive = true
        subscriptionData.trialEndDate = trialEnd
      }

      if (editingUser) {
        const userRef = doc(db, "users", editingUser.uid)
        await updateDoc(userRef, {
          displayName: formData.displayName,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          ...subscriptionData,
          updatedAt: new Date(),
        })

        if (formData.password) {
          const user = auth.currentUser
          if (user && user.email === formData.email) {
            await updatePassword(user, formData.password)
          }
        }

        toast({
          title: "User Updated",
          description: "User details have been updated successfully.",
        })
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password!)

        const newUserRef = doc(db, "users", userCredential.user.uid)
        await setDoc(newUserRef, {
          displayName: formData.displayName,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          ...subscriptionData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        toast({
          title: "User Created",
          description: "New user has been added successfully.",
        })
      }

      closeEditDialog()
    } catch (error: any) {
      console.error("Error saving user:", error)
      let errorMessage = "Failed to save user data."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use by another account."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedPlan = availablePlans.find((plan) => plan.id === formData.subscriptionPlan)

  return (
    <SimpleAdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete user <span className="font-semibold">{userToDelete?.displayName}</span>?
                This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} className="rounded-xl">
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              User Management
            </h1>
            <p className="text-xl text-slate-600">Manage all users and their subscription plans</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-2xl font-semibold"
                onClick={openAddDialog}
              >
                <UserPlus className="h-5 w-5 mr-2" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {editingUser ? "Edit User" : "Add New User"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Full Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={formData.displayName}
                      onChange={(e) => handleFormChange("displayName", e.target.value)}
                      className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Email *</Label>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      disabled={!!editingUser}
                      className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Password *</Label>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleFormChange("password", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleFormChange("confirmPassword", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleFormChange("role", value as "ADMIN" | "BUSER")}
                    >
                      <SelectTrigger className="border-2 border-slate-200 rounded-xl focus:border-blue-400">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="BUSER">Business User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                      <SelectTrigger className="border-2 border-slate-200 rounded-xl focus:border-blue-400">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subscription Plan Section - Only for Business Users */}
                {formData.role === "BUSER" && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-slate-800">Subscription Plan</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Select Plan</Label>
                        <Select
                          value={formData.subscriptionPlan}
                          onValueChange={(value) => handleFormChange("subscriptionPlan", value)}
                        >
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl focus:border-purple-400">
                            <SelectValue placeholder="Choose a plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Plan</SelectItem>
                            {availablePlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                <div className="flex items-center gap-2">
                                  <span>{plan.name}</span>
                                  <span className="text-sm text-gray-500">${plan.price}/month</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Plan Duration (Months)</Label>
                        <Select
                          value={formData.planDuration}
                          onValueChange={(value) => handleFormChange("planDuration", value)}
                        >
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl focus:border-purple-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Trial Options */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          id="trial-active"
                          type="checkbox"
                          checked={formData.trialActive}
                          onChange={(e) => handleFormChange("trialActive", e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <Label htmlFor="trial-active" className="text-sm font-medium">
                          Enable Trial Period
                        </Label>
                      </div>

                      {formData.trialActive && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Days:</Label>
                          <Input
                            type="number"
                            value={formData.trialDays}
                            onChange={(e) => handleFormChange("trialDays", Number.parseInt(e.target.value) || 7)}
                            className="w-20 border-2 border-slate-200 rounded-lg"
                            min="1"
                            max="30"
                          />
                        </div>
                      )}
                    </div>

                    {/* Plan Preview */}
                    {selectedPlan && (
                      <div className="bg-white border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{selectedPlan.name}</h4>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">${selectedPlan.price}/month</span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          {selectedPlan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="gap-3">
                <Button
                  variant="outline"
                  onClick={closeEditDialog}
                  disabled={isSaving}
                  className="rounded-xl bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                  onClick={handleSaveUser}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Business Users Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-2 border-blue-200 shadow-xl transition-all hover:shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-blue-200">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  Business Users
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {filteredBusinessUsers.length}
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Select onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] border-2 border-blue-200 rounded-xl">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl bg-transparent"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-blue-200 h-12 w-12"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-blue-200 rounded w-64"></div>
                      <div className="h-4 bg-blue-200 rounded w-56"></div>
                    </div>
                  </div>
                </div>
              ) : filteredBusinessUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4 text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No business users found</h3>
                  <p className="max-w-md">
                    {searchQuery
                      ? "No users match your search. Try different keywords."
                      : "No business users registered yet."}
                  </p>
                </div>
              ) : (
                <Table className="rounded-lg overflow-hidden">
                  <TableHeader className="bg-blue-50">
                    <TableRow className="hover:bg-blue-100">
                      <TableHead className="font-bold text-blue-800">Name</TableHead>
                      <TableHead className="font-bold text-blue-800">Email</TableHead>
                      <TableHead className="font-bold text-blue-800">Business</TableHead>
                      <TableHead className="font-bold text-blue-800">Plan</TableHead>
                      <TableHead className="font-bold text-blue-800">Status</TableHead>
                      <TableHead className="font-bold text-blue-800">Joined</TableHead>
                      <TableHead className="font-bold text-blue-800 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredBusinessUsers.map((user) => (
                        <motion.tr
                          key={user.uid}
                          className="border-b border-blue-100 hover:bg-blue-50 transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell className="font-medium group">
                            <span className="group-hover:text-blue-600 transition-colors">{user.displayName}</span>
                          </TableCell>
                          <TableCell className="group">
                            <span className="group-hover:text-blue-500 transition-colors">{user.email}</span>
                          </TableCell>
                          <TableCell>
                            {user.businessName ? (
                              <Badge
                                variant="outline"
                                className="border-blue-200 text-blue-700 bg-blue-50 rounded-full"
                              >
                                {user.businessName}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`${getPlanColor(user.subscriptionPlan)} rounded-full font-medium`}>
                                {formatPlanName(user.subscriptionPlan)}
                              </Badge>
                              {user.trialActive && (
                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                  <Calendar className="h-3 w-3" />
                                  <span>Trial Active</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Badge
                                  className={`${getStatusColor(user.status)} transition-all hover:scale-105 cursor-pointer rounded-full`}
                                >
                                  {user.status}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleStatusChange(user.uid, "Active")}>
                                  Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(user.uid, "Inactive")}>
                                  Inactive
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmDeleteUser(user)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="text-gray-600">{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => confirmDeleteUser(user)}>
                                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                  <span className="text-red-600">Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Users Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-2 border-purple-200 shadow-xl transition-all hover:shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-b border-purple-200">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-purple-800 flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-xl">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  Admin Users
                  <Badge className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    {filteredAdminUsers.length}
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                      placeholder="Search admins..."
                      className="pl-10 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl bg-transparent"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-purple-200 h-12 w-12"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-purple-200 rounded w-64"></div>
                      <div className="h-4 bg-purple-200 rounded w-56"></div>
                    </div>
                  </div>
                </div>
              ) : filteredAdminUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4 text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No admin users found</h3>
                  <p className="max-w-md">
                    {searchQuery ? "No admins match your search." : "Add new admins using the 'Add User' button."}
                  </p>
                </div>
              ) : (
                <Table className="rounded-lg overflow-hidden">
                  <TableHeader className="bg-purple-50">
                    <TableRow className="hover:bg-purple-100">
                      <TableHead className="font-bold text-purple-800">Name</TableHead>
                      <TableHead className="font-bold text-purple-800">Email</TableHead>
                      <TableHead className="font-bold text-purple-800">Status</TableHead>
                      <TableHead className="font-bold text-purple-800">Joined</TableHead>
                      <TableHead className="font-bold text-purple-800 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredAdminUsers.map((user) => (
                        <motion.tr
                          key={user.uid}
                          className="border-b border-purple-100 hover:bg-purple-50 transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell className="font-medium group">
                            <span className="group-hover:text-purple-600 transition-colors">{user.displayName}</span>
                          </TableCell>
                          <TableCell className="group">
                            <span className="group-hover:text-purple-500 transition-colors">{user.email}</span>
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Badge
                                  className={`${getStatusColor(user.status)} transition-all hover:scale-105 cursor-pointer rounded-full`}
                                >
                                  {user.status}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleStatusChange(user.uid, "Active")}>
                                  Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(user.uid, "Inactive")}>
                                  Inactive
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmDeleteUser(user)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="text-gray-600">{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => confirmDeleteUser(user)}>
                                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                  <span className="text-red-600">Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </SimpleAdminLayout>
  )
}
