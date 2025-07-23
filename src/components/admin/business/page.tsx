"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Star, FileText, Crown, Zap, Sparkles, Building2, Users, Calendar } from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BusinessUser {
  uid: string
  displayName: string
  email: string
  createdAt: Date
  businessName: string
  businessType: string
  status: string
  rating: number
  reviewCount: number
  subscriptionPlan: string
  subscriptionStatus: "Active" | "Expired" | "None"
  subscriptionEndDate: Date | null
  businessFormFilled: boolean
  businessInfo?: BusinessInfo
}

interface BusinessInfo {
  businessName: string
  contactEmail: string
  contactPhone: string
  whatsapp: string
  secondaryEmail: string
  facebook: string
  instagram: string
  linkedin: string
  website: string
  description: string
  businessType: string
  branchCount: string
  customBusinessType: string
  googleReviewLink: string
  branches: Array<{ name: string; location: string }>
  lastUpdated: any
  subscriptionPlan?: string
  subscriptionStatus?: string
}

export default function BusinessesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [businesses, setBusinesses] = useState<BusinessUser[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessUser | null>(null)
  const [modalType, setModalType] = useState<"subscription" | "businessForm" | null>(null)

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500 text-white shadow-emerald-200"
      case "Pending":
        return "bg-amber-500 text-white shadow-amber-200"
      case "Suspended":
        return "bg-red-500 text-white shadow-red-200"
      default:
        return "bg-slate-500 text-white shadow-slate-200"
    }
  }, [])

  const getPlanColor = useCallback((plan: string) => {
    switch (plan) {
      case "Premium":
        return "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
      case "Pro":
        return "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
      case "Basic":
        return "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
      case "professional":
        return "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
      case "starter":
        return "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
      default:
        return "bg-gradient-to-r from-slate-600 to-gray-600 text-white"
    }
  }, [])

  const getPlanIcon = useCallback((plan: string) => {
    switch (plan) {
      case "Premium":
        return Crown
      case "Pro":
        return Zap
      case "Basic":
        return Sparkles
      case "Professional":
        return Zap
      case "starter":
        return Sparkles
      default:
        return FileText
    }
  }, [])

  const getSubscriptionStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500 text-white shadow-emerald-200"
      case "Expired":
        return "bg-red-500 text-white shadow-red-200"
      default:
        return "bg-slate-500 text-white shadow-slate-200"
    }
  }, [])

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const usersQuery = query(collection(db, "users"), where("role", "==", "BUSER"))

        const usersSnapshot = await getDocs(usersQuery)
        const businessesData: BusinessUser[] = []

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data()
          const createdAt = userData.createdAt?.toDate() || new Date()
          const businessInfo = userData.businessInfo || {}
          const businessFormFilled = !!userData.businessInfo

          const reviewsCollection = collection(db, "users", userDoc.id, "reviews")
          const reviewsSnapshot = await getDocs(reviewsCollection)

          let totalRating = 0
          let reviewCount = 0

          reviewsSnapshot.forEach((reviewDoc) => {
            const reviewData = reviewDoc.data()
            totalRating += reviewData.rating || 0
            reviewCount++
          })

          const averageRating = reviewCount > 0 ? Number.parseFloat((totalRating / reviewCount).toFixed(1)) : 0

          let subscriptionStatus: "Active" | "Expired" | "None" = "None"
          if (userData.subscriptionActive) {
            const endDate = userData.subscriptionEndDate?.toDate()
            subscriptionStatus = endDate && endDate > new Date() ? "Active" : "Expired"
          }

          const planMap: Record<string, string> = {
            plan_premium: "Premium",
            plan_pro: "Pro",
            plan_basic: "Basic",
          }
          const subscriptionPlan = planMap[userData.subscriptionPlan] || userData.subscriptionPlan || "None"

          businessesData.push({
            uid: userDoc.id,
            displayName: userData.displayName || "Unknown Owner",
            email: userData.email || "No email",
            createdAt,
            businessName: businessInfo.businessName || "Unnamed Business",
            businessType: businessInfo.businessType || "Uncategorized",
            status: userData.status || "Pending",
            rating: averageRating,
            reviewCount,
            subscriptionPlan,
            subscriptionStatus,
            subscriptionEndDate: userData.subscriptionEndDate?.toDate() || null,
            businessFormFilled,
            businessInfo,
          })
        }

        setBusinesses(businessesData)
      } catch (error) {
        console.error("Error fetching businesses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  const filteredBusinesses = useCallback(() => {
    if (!searchQuery) return businesses
    const queryLower = searchQuery.toLowerCase()
    return businesses.filter(
      (business) =>
        business.businessName.toLowerCase().includes(queryLower) ||
        business.displayName.toLowerCase().includes(queryLower) ||
        business.businessType.toLowerCase().includes(queryLower) ||
        business.subscriptionPlan.toLowerCase().includes(queryLower),
    )
  }, [businesses, searchQuery])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const formatSubscriptionDate = (date: Date | null) => {
    if (!date) return "N/A"
    return format(date, "MMM d, yyyy")
  }

  const handleViewDetails = (uid: string) => {
    navigate(`/admin/businesses/${uid}`)
  }

  const handleManageSubscription = (uid: string) => {
    navigate(`/admin/subscriptions/${uid}`)
  }

  const openSubscriptionModal = (business: BusinessUser) => {
    setSelectedBusiness(business)
    setModalType("subscription")
  }

  const openBusinessFormModal = (business: BusinessUser) => {
    setSelectedBusiness(business)
    setModalType("businessForm")
  }

  const closeModal = () => {
    setSelectedBusiness(null)
    setModalType(null)
  }

  return (
    <SimpleAdminLayout>
      <style jsx>{`
  @keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }

`}</style>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-100">
        <div className="space-y-8 p-6">
          {/* Stats Cards */}
          {/* Main Content Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-t-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-2xl font-bold">Business Directory</CardTitle>
                    <p className="text-slate-300 text-sm mt-1">Manage and monitor all registered businesses</p>
                  </div>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search by name, type, or plan..."
                    className="pl-10 h-12 bg-white/95 backdrop-blur-sm border-purple-200 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-2xl shadow-lg"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-200 border-t-4 border-t-blue-600 rounded-full animate-spin animate-bounce"></div>
                    <div
                      className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-4 border-r-indigo-600 rounded-full animate-spin"
                      style={{ animationDelay: "0.15s" }}
                    ></div>
                  </div>
                </div>
              ) : filteredBusinesses().length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 p-4 text-center">
                  <div className="bg-slate-100 p-6 rounded-2xl mb-6">
                    <Search className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">No businesses found</h3>
                  <p className="max-w-md text-slate-600">
                    {searchQuery
                      ? "No businesses match your search criteria. Try adjusting your filters."
                      : "No businesses have registered yet. New registrations will appear here."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredBusinesses().map((business) => {
                    const PlanIcon = getPlanIcon(business.subscriptionPlan)
                    return (
                      <Card
                        key={business.uid}
                        className="group hover:shadow-2xl transition-all duration-500 ease-in-out border-0 bg-white/90 backdrop-blur-sm hover:scale-[1.02]"
                      >
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {business.businessName}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">{business.businessType}</p>
                            </div>
                            <Badge
                              className={`${getStatusColor(business.status)} shadow-lg text-xs font-medium px-3 py-1`}
                            >
                              {business.status}
                            </Badge>
                          </div>

                          {/* Rating & Date */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 bg-amber-50 px-3 py-1 rounded-full">
                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                                <span className="font-semibold text-amber-700">{business.rating}</span>
                                <span className="text-xs text-amber-600">({business.reviewCount})</span>
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(business.createdAt, "MMM d, yyyy")}
                            </div>
                          </div>

                          {/* Info Cards */}
                          <div className="space-y-3 mb-6">
                            <div
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl cursor-pointer hover:from-slate-100 hover:to-blue-100 transition-all"
                              onClick={() => openSubscriptionModal(business)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <PlanIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Subscription</span>
                              </div>
                              <Badge
                                className={`${getSubscriptionStatusColor(business.subscriptionStatus)} text-xs shadow-md`}
                              >
                                {business.subscriptionStatus}
                              </Badge>
                            </div>

                            <div
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl cursor-pointer hover:from-slate-100 hover:to-emerald-100 transition-all"
                              onClick={() => openBusinessFormModal(business)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Business Form</span>
                              </div>
                              <Badge
                                className={`text-xs shadow-md ${
                                  business.businessFormFilled
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {business.businessFormFilled ? "Complete" : "Pending"}
                              </Badge>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <p className="text-sm font-medium text-slate-800">{business.displayName}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[200px]">{business.email}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 rounded-lg"
                                onClick={() => handleViewDetails(business.uid)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg rounded-lg"
                                onClick={() => handleManageSubscription(business.uid)}
                              >
                                Manage
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Details Modal */}
        <Dialog open={modalType === "subscription" && selectedBusiness !== null} onOpenChange={closeModal}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-purple-50 to-pink-50 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center text-slate-800">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
                Subscription Overview
              </DialogTitle>
            </DialogHeader>
            {selectedBusiness && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Plan:</span>
                  <Badge
                    className={`${getPlanColor(selectedBusiness.subscriptionPlan)} flex items-center space-x-1 shadow-md`}
                  >
                    {React.createElement(getPlanIcon(selectedBusiness.subscriptionPlan), { className: "w-3 h-3" })}
                    <span>{selectedBusiness.subscriptionPlan}</span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Status:</span>
                  <Badge className={`${getSubscriptionStatusColor(selectedBusiness.subscriptionStatus)} shadow-md`}>
                    {selectedBusiness.subscriptionStatus}
                  </Badge>
                </div>
                {selectedBusiness.subscriptionEndDate && (
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600 font-medium">Renewal Date:</span>
                    <span className="font-semibold text-slate-800">
                      {formatSubscriptionDate(selectedBusiness.subscriptionEndDate)}
                    </span>
                  </div>
                )}
                <div className="pt-4 mt-6 border-t border-slate-200 flex justify-end">
                  <Button
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg rounded-lg"
                    onClick={() => handleManageSubscription(selectedBusiness.uid)}
                  >
                    Manage Subscription
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Business Form Modal */}
        <Dialog open={modalType === "businessForm" && selectedBusiness !== null} onOpenChange={closeModal}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-purple-50 to-pink-50 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center text-slate-800">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                Business Form Status
              </DialogTitle>
            </DialogHeader>
            {selectedBusiness && (
              <div className="space-y-4">
                {selectedBusiness.businessFormFilled && selectedBusiness.businessInfo ? (
                  <>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium">Contact Email:</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {selectedBusiness.businessInfo.contactEmail || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium">Contact Phone:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedBusiness.businessInfo.contactPhone || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium">Business Type:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedBusiness.businessInfo.businessType || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium">Branches:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedBusiness.businessInfo.branches?.length || 0} locations
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium">Last Updated:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedBusiness.businessInfo.lastUpdated
                          ? format(selectedBusiness.businessInfo.lastUpdated.toDate(), "MMM d, yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 italic">This business hasn't submitted their details form yet.</p>
                  </div>
                )}
                <div className="pt-4 mt-6 border-t border-slate-200 flex justify-end">
                  <Button
                    variant="outline"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
                    onClick={() => handleViewDetails(selectedBusiness.uid)}
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SimpleAdminLayout>
  )
}
