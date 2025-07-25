"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Star,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  Link,
  Crown,
  Zap,
  Sparkles,
  Building2,
  Calendar,
  Users,
  Shield,
  Smartphone,
  Monitor,
  Clock,
} from "lucide-react"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { format, isValid } from "date-fns"
import { useNavigate, useParams } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface Branch {
  name: string
  location: string
  googleReviewLink?: string
}

interface LoginDetails {
  sessionId?: string
  timestamp: any // Can be Date, string, or Firebase Timestamp
  device?: {
    type?: string
    os?: string
    browser?: string
    model?: string
    userAgent?: string
  }
  location?: {
    ip?: string
    city?: string
    region?: string
    country?: string
    timezone?: string
  }
  loginMethod?: "email" | "google" | string
  isActive?: boolean
}

interface BusinessInfo {
  businessName: string
  contactEmail: string
  contactPhone: string
  whatsapp?: string
  secondaryEmail?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  website?: string
  description: string
  businessType: string
  branchCount: string
  customBusinessType?: string
  googleReviewLink?: string
  branches?: Branch[]
  lastUpdated?: any
  subscriptionPlan?: string
  subscriptionStatus?: string
  subscriptionEndDate?: any
}

interface BusinessDetails {
  businessInfo: BusinessInfo | null
  displayName: string
  email: string
  uid: string
  createdAt: any
  rating: number
  reviewCount: number
  status: string
  lastLogin?: LoginDetails
  loginHistory?: LoginDetails[]
}

const safeFormatDate = (date: any, formatStr: string, fallback = "N/A") => {
  try {
    if (!date) return fallback

    // Handle Firebase Timestamp
    const jsDate = date?.toDate?.() || new Date(date)

    if (!isValid(jsDate)) return fallback
    return format(jsDate, formatStr)
  } catch {
    return fallback
  }
}

const safeFormatDateTime = (timestamp: any, fallback = "N/A") => {
  try {
    if (!timestamp) return fallback

    let jsDate
    if (typeof timestamp?.toDate === "function") {
      jsDate = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      jsDate = timestamp
    } else if (typeof timestamp === "string") {
      jsDate = new Date(timestamp)
    } else if (typeof timestamp?.seconds === "number") {
      jsDate = new Date(timestamp.seconds * 1000)
    } else {
      jsDate = new Date(timestamp)
    }

    if (!isValid(jsDate)) return fallback
    return format(jsDate, "MMM d, yyyy 'at' h:mm a")
  } catch {
    return fallback
  }
}

export default function BusinessDetailsPage() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<BusinessDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        if (!uid) return

        const userDocRef = doc(db, "users", uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const businessInfo = userData.businessInfo || null

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

          setBusiness({
            businessInfo,
            displayName: userData.displayName || "Unknown Owner",
            email: userData.email || "No email",
            uid: userDoc.id,
            createdAt: userData.createdAt || new Date(),
            rating: averageRating,
            reviewCount,
            status: userData.status || "Pending",
            lastLogin: userData.lastLogin,
            loginHistory: userData.loginHistory || [],
          })
        } else {
          setBusiness(null)
        }
      } catch (error) {
        console.error("Error fetching business details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessDetails()
  }, [uid])

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case "Premium":
        return "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
      case "Pro":
        return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
      case "Basic":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
    }
  }

  const getPlanIcon = (plan?: string) => {
    switch (plan) {
      case "Premium":
        return Crown
      case "Pro":
        return Zap
      case "Basic":
        return Sparkles
      default:
        return FileText
    }
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/admin/businesses")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={`skeleton-row-${i}`} className="flex justify-between">
                      <Skeleton className="h-4 w-24 bg-gray-200" />
                      <Skeleton className="h-4 w-40 bg-gray-200" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!business || !business.businessInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Button
          variant="outline"
          onClick={goBack}
          className="mb-6 border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Businesses
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
          <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-6">
            <FileText className="w-8 h-8 text-gray-500 mx-auto mt-2" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Business Details Available</h2>
          <p className="text-gray-600">This business hasn't submitted their information yet.</p>
        </motion.div>
      </div>
    )
  }

  const info = business.businessInfo
  const PlanIcon = getPlanIcon(info.subscriptionPlan)

  return (
    <div className="min-h-screen m-12 bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Button
          variant="outline"
          onClick={goBack}
          className="mb-6 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-blue-400 transition-all duration-300 bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Businesses
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-start mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl blur-2xl opacity-60"></div>
          <div className="relative">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {info.businessName}
            </h1>
            <div className="flex items-center mt-4 space-x-3">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 text-sm font-bold">
                <Building2 className="h-4 w-4 mr-2" />
                {info.businessType}
              </Badge>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-bold">
                <FileText className="h-4 w-4 mr-2" />
                Form Submitted
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Login Activity Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center text-gray-800 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mr-4 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  Login Activity & Device Management
                  <span className="ml-3 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    UID: {business.uid}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {business.loginHistory && business.loginHistory.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">Recent login sessions for this business</div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Total Sessions: {business.loginHistory.length}
                      </div>
                    </div>

                    {business.loginHistory.slice(0, 8).map((login, index) => {
                      const loginDateTime = safeFormatDateTime(login.timestamp, "Unknown time")

                      // Determine device info with better fallbacks
                      const deviceModel =
                        login.device?.model && login.device.model !== "Unknown"
                          ? login.device.model
                          : `${login.device?.type || "Unknown"} Device`

                      // Enhanced location display
                      const locationStr =
                        login.location?.city &&
                        login.location?.country &&
                        login.location.city !== "Unknown" &&
                        login.location.country !== "Unknown"
                          ? `${login.location.city}, ${login.location.country}`
                          : login.location?.country && login.location.country !== "Unknown"
                            ? login.location.country
                            : "Location unavailable"

                      return (
                        <div
                          key={`login-${login.sessionId || index}`}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 space-y-3 sm:space-y-0"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                              {login.device?.type?.toLowerCase() === "mobile" ? (
                                <Smartphone className="h-5 w-5 text-indigo-600" />
                              ) : (
                                <Monitor className="h-5 w-5 text-indigo-600" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-semibold text-gray-800 truncate">{deviceModel}</div>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {login.device?.type || "Unknown"}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {locationStr}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {loginDateTime}
                                  </span>
                                </div>

                                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                                  <span>OS: {login.device?.os || "Unknown"}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>Browser: {login.device?.browser || "Unknown"}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>Method: {login.loginMethod || "Unknown"}</span>
                                  {login.sessionId && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span>Session: {login.sessionId.slice(-8)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                login.isActive ? "bg-green-500" : index === 0 ? "bg-green-500" : "bg-blue-500"
                              }`}
                            ></div>
                            <span
                              className={`text-xs font-medium ${
                                login.isActive ? "text-green-600" : index === 0 ? "text-green-600" : "text-blue-600"
                              }`}
                            >
                              {login.isActive ? "Active Session" : index === 0 ? "Recent Session" : "Previous Session"}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {business.loginHistory.length > 8 && (
                      <div className="text-center pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 bg-transparent"
                        >
                          View All Login History ({business.loginHistory.length} total sessions)
                        </Button>
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-800 mb-1">Security Information</h4>
                          <p className="text-sm text-blue-700">
                            Each login session is tracked with device and location information for security purposes.
                            Business UID: <span className="font-mono font-medium">{business.uid}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Login Activity</h3>
                    <p className="text-gray-500">No login sessions have been recorded for this business yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Business Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center text-gray-800 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600 font-medium">Business Name</span>
                    <span className="font-bold text-gray-800">{info.businessName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600 font-medium">Description</span>
                    <span className="font-medium max-w-[70%] text-right text-gray-800">
                      {info.description || "No description"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600 font-medium">Google Review</span>
                    <span className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      {info.googleReviewLink ? (
                        <a href={info.googleReviewLink} target="_blank" rel="noopener noreferrer">
                          View Reviews
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Last Updated</span>
                    <span className="font-bold text-gray-800">{safeFormatDate(info.lastUpdated, "MMM d, yyyy")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center text-gray-800 text-2xl">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-4 shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold mb-4 text-gray-800 text-lg">Primary Contact</h3>
                    <div className="space-y-3">
                      <p className="text-gray-700 flex items-center">
                        <Mail className="inline h-5 w-5 mr-3 text-blue-500" />
                        {info.contactEmail}
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <Phone className="inline h-5 w-5 mr-3 text-blue-500" />
                        {info.contactPhone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4 text-gray-800 text-lg">Secondary Contact</h3>
                    <div className="space-y-3">
                      <p className="text-gray-700 flex items-center">
                        <Mail className="inline h-5 w-5 mr-3 text-blue-500" />
                        {info.secondaryEmail || "N/A"}
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <Globe className="inline h-5 w-5 mr-3 text-blue-500" />
                        {info.website || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Branches */}
          {info.branches && info.branches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-gray-800 text-2xl">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4 shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    Branch Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {info.branches.map((branch, idx) => (
                      <div key={`branch-${idx}`} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-xl text-gray-800 font-bold">{branch.name}</strong>
                            <p className="text-gray-600 mt-1 text-lg">{branch.location}</p>
                          </div>
                          {branch.googleReviewLink && (
                            <a
                              href={branch.googleReviewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center transition-colors"
                            >
                              <Link className="h-5 w-5 mr-2" />
                              Google Reviews
                            </a>
                          )}
                        </div>
                        {branch.googleReviewLink ? (
                          <div className="mt-3 text-sm">
                            <a
                              href={branch.googleReviewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 truncate block transition-colors"
                            >
                              {branch.googleReviewLink}
                            </a>
                          </div>
                        ) : (
                          <div className="mt-3 text-gray-500 italic">No Google Review Link added for this branch</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-6"
        >
          <Card className="bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-yellow-50 rounded-t-lg">
              <CardTitle className="flex items-center text-gray-800 text-xl">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mr-3 shadow-lg">
                  <PlanIcon className="h-5 w-5 text-white" />
                </div>
                Subscription Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Badge className={`${getPlanColor(info.subscriptionPlan)} flex items-center space-x-2 px-3 py-2`}>
                    <PlanIcon className="w-4 h-4" />
                    <span className="font-bold">{info.subscriptionPlan || "None"}</span>
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Status: </span>
                  <Badge
                    className={
                      info.subscriptionStatus === "Active"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 font-bold"
                        : "bg-gradient-to-r from-gray-400 to-gray-600 text-white px-3 py-1 font-bold"
                    }
                  >
                    {info.subscriptionStatus || "Inactive"}
                  </Badge>
                </div>
                {info.subscriptionEndDate && (
                  <p className="text-gray-700">
                    <span className="text-gray-600 font-medium">Renewal:</span>{" "}
                    <span className="font-bold text-gray-800">
                      {safeFormatDate(info.subscriptionEndDate, "MMM d, yyyy")}
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-gray-800 text-xl">Business Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-800 font-bold text-lg">
                    {business.rating} ⭐ ({business.reviewCount} reviews)
                  </span>
                </div>
                <p className="text-gray-700">
                  <span className="text-gray-600 font-medium">Status:</span>{" "}
                  <span className="font-bold text-gray-800">{business.status}</span>
                </p>
                <p className="text-gray-700">
                  <span className="text-gray-600 font-medium">Owner:</span>{" "}
                  <span className="font-bold text-gray-800">{business.displayName}</span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-gray-600 font-medium">Joined:</span>{" "}
                  <span className="font-bold text-gray-800 ml-2">
                    {safeFormatDate(business.createdAt, "MMM d, yyyy")}
                  </span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-gray-600 font-medium">Branches:</span>{" "}
                  <span className="font-bold text-gray-800 ml-2">{info.branches?.length || 0}</span>
                </p>
                {business.lastLogin && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-700 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-gray-600 font-medium">Last Login:</span>{" "}
                      <span className="font-bold text-gray-800 ml-2">
                        {safeFormatDateTime(business.lastLogin.timestamp)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      {business.lastLogin.device?.model !== "Unknown"
                        ? business.lastLogin.device?.model
                        : business.lastLogin.device?.type || "Unknown device"}{" "}
                      • {business.lastLogin.device?.os || "Unknown OS"} •{" "}
                      {business.lastLogin.location?.city || "Unknown city"},{" "}
                      {business.lastLogin.location?.country || "Unknown country"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
