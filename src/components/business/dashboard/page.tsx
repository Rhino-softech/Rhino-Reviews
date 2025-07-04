"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { BarChart3, Star, LinkIcon, MessageSquare, TrendingUp, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Sidebar from "@/components/sidebar"
import { auth, db } from "@/firebase/firebase"
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useNavigate } from "react-router-dom"

interface Review {
  id: string
  name: string
  rating: number
  review: string
  createdAt: { seconds: number }
  status: string
  branchname: string
  replied: boolean
  source?: "firebase" | "google"
}

interface BusinessInfo {
  businessName: string
  linkClicks: number
  responseRate: number
  createdAt: { seconds: number }
}

// Helper function to check if user has access to location dropdown
const hasLocationAccess = (plan: string | undefined, trialActive: boolean) => {
  if (trialActive) return false // Hide for free trial users
  if (!plan) return false

  const normalizedPlan = plan.toLowerCase()
  // Hide for starter/basic plans, show for professional/premium plans
  return !(
    normalizedPlan.includes("starter") ||
    normalizedPlan.includes("basic") ||
    normalizedPlan.includes("plan_basic")
  )
}

// Updated subscription status check - more lenient
const checkUserAccess = async (user: any) => {
  if (!user) return false

  const userRef = doc(db, "users", user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) return false

  const userData = userSnap.data()
  const now = new Date()

  // Admin users always have access
  if (userData.role === "ADMIN") return true

  // Check account status first
  if (userData.status !== "Active") return false

  // Check for active subscription
  if (userData.subscriptionActive || userData.subscriptionPlan) return true

  // Check trial status - be more lenient
  if (userData.trialActive) {
    // If trial is active but no end date, give them access
    if (!userData.trialEndDate) return true

    // Check if trial end date is in the future
    if (userData.trialEndDate.toDate() > now) return true
  }

  // If no trial data exists, they might be a newly created user - give them access
  if (!userData.trialEndDate && !userData.subscriptionPlan) return true

  return false
}

export default function BusinessDashboard() {
  const [period, setPeriod] = useState("week")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [branches, setBranches] = useState<any[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: "",
    linkClicks: 0,
    responseRate: 0,
    createdAt: { seconds: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login")
        return
      }

      // Check user access
      const hasAccess = await checkUserAccess(user)
      if (!hasAccess) {
        navigate("/pricing")
        return
      }

      try {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (!userDoc.exists()) {
          navigate("/login")
          return
        }

        const userData = userDoc.data()
        const businessData = userData.businessInfo || {}

        // Set branches for location dropdown
        const branchesData = businessData.branches || []
        setBranches(branchesData)

        // Check if user has access to location dropdown
        const locationAccess = hasLocationAccess(userData.subscriptionPlan, userData.trialActive)
        setShowLocationDropdown(locationAccess)

        setBusinessInfo({
          businessName: businessData.businessName || "",
          linkClicks: userData.linkClicks || 0,
          responseRate: businessData.responseRate || 0,
          createdAt: businessData.createdAt || { seconds: 0 },
        })

        const reviewsQuery = query(collection(db, "users", user.uid, "reviews"))
        const querySnapshot = await getDocs(reviewsQuery)
        const firebaseReviews: Review[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          firebaseReviews.push({
            id: doc.id,
            name: data.name || "Anonymous",
            rating: data.rating || 0,
            review: data.review || data.message || "",
            createdAt: { seconds: data.createdAt?.seconds || 0 },
            status: data.status || "pending",
            branchname: data.branchname || "",
            replied: data.replied || false,
            source: "firebase",
          })
        })

        // Fetch Google reviews (if API key is available)
        const businessName = businessData.businessName
        const branchName = businessData.branches?.[0]?.branchname || ""
        const searchQuery = `${businessName} ${branchName}`.trim()

        let googleReviews: Review[] = []

        try {
          // Only attempt Google API call if we have a valid API key
          const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY"

          if (GOOGLE_API_KEY && GOOGLE_API_KEY !== "YOUR_GOOGLE_API_KEY") {
            const searchRes = await fetch(
              `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
                searchQuery,
              )}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`,
            )
            const searchData = await searchRes.json()
            const placeId = searchData?.candidates?.[0]?.place_id

            if (placeId) {
              const detailsRes = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_API_KEY}`,
              )
              const detailsData = await detailsRes.json()
              googleReviews = (detailsData.result?.reviews || []).map((r: any, i: number) => ({
                id: `google-${i}`,
                name: r.author_name || "Google User",
                rating: r.rating || 0,
                review: r.text || "",
                createdAt: { seconds: Math.floor(Date.now() / 1000) - i * 86400 },
                status: "published",
                branchname: branchName,
                replied: false,
                source: "google",
              }))
            }
          }
        } catch (err) {
          console.error("Failed to fetch Google reviews:", err)
        }

        setAllReviews([...firebaseReviews, ...googleReviews])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [navigate])

  // Updated to include location filtering
  const { filteredReviews, stats } = useMemo(() => {
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setDate(now.getDate() - 30)
        break
      case "year":
        startDate.setDate(now.getDate() - 365)
        break
    }

    const startTimestamp = Math.floor(startDate.getTime() / 1000)

    // Filter by time period and location
    const filtered = allReviews.filter((r) => {
      const matchesTime = r.createdAt.seconds >= startTimestamp
      const matchesLocation =
        selectedLocation === "All" || r.branchname?.toLowerCase().includes(selectedLocation.toLowerCase())
      return matchesTime && matchesLocation
    })

    const totalRating = filtered.reduce((sum, r) => sum + r.rating, 0)
    const ratingCounts = [0, 0, 0, 0, 0]
    let repliedCount = 0

    filtered.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) ratingCounts[5 - r.rating]++
      if (r.replied) repliedCount++
    })

    const totalReviews = filtered.length
    const averageRating = totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(1)) : 0
    const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0

    return {
      filteredReviews: filtered.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds),
      stats: {
        totalReviews,
        averageRating,
        linkClicks: businessInfo.linkClicks,
        responseRate,
        ratingDistribution: ratingCounts,
      },
    }
  }, [allReviews, period, businessInfo, selectedLocation])

  const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculatePercentage = (count: number) => {
    return stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0
  }

  const getStatusBadge = (status: string, replied: boolean) => {
    if (replied) {
      return (
        <span className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
          Replied
        </span>
      )
    }

    switch (status) {
      case "published":
        return (
          <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
            Published
          </span>
        )
      case "pending":
        return (
          <span className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
            Pending
          </span>
        )
      case "rejected":
        return (
          <span className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
            Rejected
          </span>
        )
      default:
        return (
          <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-400"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-orange-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Period labels for UI
  const periodLabels: Record<string, string> = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                {businessInfo.businessName ? `Welcome back, ${businessInfo.businessName}` : "Welcome back"}
                {selectedLocation !== "All" && (
                  <span className="text-orange-600 font-medium"> - {selectedLocation}</span>
                )}
              </p>
            </div>

            {/* Controls - Added Location Dropdown with conditional rendering */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Location Dropdown - Only show for Professional/Premium plans */}
              {showLocationDropdown && (
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[200px] border-gray-200 focus:ring-2 focus:ring-orange-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Select Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    <SelectItem value="All">All Locations</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Time Period Tabs */}
              <div className="w-full lg:w-auto">
                <Tabs defaultValue="week" className="w-full" onValueChange={setPeriod}>
                  <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white shadow-md border border-orange-200">
                    <TabsTrigger
                      value="day"
                      className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-white"
                    >
                      Day
                    </TabsTrigger>
                    <TabsTrigger
                      value="week"
                      className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-white"
                    >
                      Week
                    </TabsTrigger>
                    <TabsTrigger
                      value="month"
                      className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-white"
                    >
                      Month
                    </TabsTrigger>
                    <TabsTrigger
                      value="year"
                      className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-white"
                    >
                      Year
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Total Reviews"
              icon={<Star className="h-5 w-5 text-orange-500" />}
              value={stats.totalReviews}
              description={`${periodLabels[period]}${selectedLocation !== "All" ? ` - ${selectedLocation}` : ""}`}
              gradient="from-blue-100 to-blue-200"
              textColor="text-blue-800"
              iconBg="bg-blue-100"
              delay="0ms"
            />
            <StatCard
              title="Average Rating"
              icon={<BarChart3 className="h-5 w-5 text-orange-500" />}
              value={stats.averageRating}
              description={
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(stats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              }
              gradient="from-emerald-100 to-emerald-200"
              textColor="text-emerald-800"
              iconBg="bg-emerald-100"
              delay="100ms"
            />
            <StatCard
              title="Link Clicks"
              icon={<LinkIcon className="h-5 w-5 text-orange-500" />}
              value={stats.linkClicks}
              description="All time clicks"
              gradient="from-purple-100 to-purple-200"
              textColor="text-purple-800"
              iconBg="bg-purple-100"
              delay="200ms"
            />
            <StatCard
              title="Response Rate"
              icon={<MessageSquare className="h-5 w-5 text-orange-500" />}
              value={`${stats.responseRate}%`}
              description={`${periodLabels[period]}${selectedLocation !== "All" ? ` - ${selectedLocation}` : ""}`}
              gradient="from-orange-100 to-orange-200"
              textColor="text-orange-800"
              iconBg="bg-orange-100"
              delay="300ms"
            />
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-2 mb-8">
            {/* Recent Reviews with Scrolling */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <MessageSquare className="h-6 w-6 text-orange-500" />
                      Recent Reviews
                      {selectedLocation !== "All" && (
                        <span className="text-sm text-orange-600 font-normal">- {selectedLocation}</span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-600">Latest customer feedback</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      {filteredReviews.length} {periodLabels[period].toLowerCase()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Scrollable Reviews Container */}
                <div className="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.slice(0, 10).map((review, index) => (
                      <div
                        key={review.id}
                        className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-gray-50 to-white animate-slide-up hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-semibold text-gray-800">{review.name}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500">{formatDate(review.createdAt.seconds)}</div>
                            {getStatusBadge(review.status, review.replied)}
                          </div>
                        </div>
                        <div className="flex mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-3 line-clamp-3">{review.review}</p>
                        {review.branchname && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <p className="text-sm text-gray-600 font-medium">{review.branchname}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        {selectedLocation !== "All" ? `No reviews for ${selectedLocation}` : "No reviews yet"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {selectedLocation !== "All"
                          ? "Try selecting a different location or time period"
                          : "Start collecting reviews to see them here"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                  Rating Distribution
                  {selectedLocation !== "All" && (
                    <span className="text-sm text-orange-600 font-normal">- {selectedLocation}</span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-600">Breakdown of your ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.ratingDistribution.map((count, index) => {
                    const stars = 5 - index
                    const percentage = calculatePercentage(count)

                    return (
                      <div
                        key={stars}
                        className="flex items-center animate-slide-right hover:scale-105 transition-transform duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-16 flex items-center">
                          <span className="font-semibold text-gray-700">{stars}</span>
                          <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                              style={{
                                width: `${percentage}%`,
                                animationDelay: `${index * 200}ms`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-sm font-semibold text-gray-700">{count}</span>
                          <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  icon,
  value,
  description,
  gradient,
  textColor,
  iconBg,
  delay,
}: {
  title: string
  icon: React.ReactNode
  value: string | number
  description: React.ReactNode
  gradient: string
  textColor: string
  iconBg: string
  delay: string
}) {
  return (
    <Card
      className={`bg-gradient-to-br ${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-up`}
      style={{ animationDelay: delay }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm font-semibold ${textColor}`}>{title}</CardTitle>
        <div className={`p-2 ${iconBg} rounded-lg shadow-md`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl md:text-3xl font-bold ${textColor} mb-2`}>{value}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </CardContent>
    </Card>
  )
}
