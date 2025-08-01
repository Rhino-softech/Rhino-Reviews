"use client"
import { useState, useEffect, useCallback } from "react"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Users,
  Star,
  MessageSquare,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Smartphone,
  Monitor,
  Shield,
  MapPin,
  Clock,
} from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns"

interface BusinessUser {
  uid: string
  businessInfo?: {
    businessName: string
    businessType: string
  }
  createdAt: Date
  lastLogin?: {
    timestamp: Date
    device: {
      type: string
      os: string
      browser: string
      model: string
      userAgent: string
    }
    location: {
      ip: string
      city: string
      region: string
      country: string
      timezone: string
      accuracy?: "high" | "medium" | "low"
      source?: string
    }
    loginMethod: "email" | "google"
  }
  loginHistory?: Array<{
    timestamp: Date
    device: {
      type: string
      os: string
      browser: string
      model: string
      userAgent: string
    }
    location: {
      ip: string
      city: string
      region: string
      country: string
      timezone: string
      accuracy?: "high" | "medium" | "low"
      source?: string
    }
    loginMethod: "email" | "google"
    sessionId?: string
    isActive?: boolean
  }>
}

interface Review {
  rating: number
  createdAt: Date
}

interface MonthlyStat {
  month: string
  businesses: number
  reviews: number
  avgRating: number
}

interface CategoryStat {
  category: string
  businesses: number
  reviews: number
  avgRating: number
}

interface DeviceStats {
  deviceType: string
  deviceModel: string
  count: number
  percentage: number
}

interface LoginActivity {
  hour: number
  logins: number
}

interface LocationStats {
  country: string
  city: string
  count: number
  percentage: number
}

// Helper function to format device name properly
const formatDeviceName = (device: any) => {
  if (device?.model && device.model !== "Unknown") {
    return device.model
  }
  return `${device?.type || "Unknown"} Device`
}

// Helper function to format location properly
const formatLocation = (location: any) => {
  if (location?.city && location?.country && location.city !== "Unknown" && location.country !== "Unknown") {
    return `${location.city}, ${location.country}`
  }
  if (location?.country && location.country !== "Unknown") {
    return location.country
  }
  return "Location unavailable"
}

export default function AnalyticsPage() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([])
  const [topCategories, setTopCategories] = useState<CategoryStat[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [activeBusinesses, setActiveBusinesses] = useState(0)
  const [reviewsThisMonth, setReviewsThisMonth] = useState(0)
  const [platformRating, setPlatformRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reviewDistribution, setReviewDistribution] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  })
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([])
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([])
  const [recentLogins, setRecentLogins] = useState<any[]>([])
  const [locationStats, setLocationStats] = useState<LocationStats[]>([])

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setRefreshing(true)
      setLoading(true)

      // Get date ranges for last 6 months
      const now = new Date()
      const sixMonthsAgo = subMonths(now, 5)
      const monthRanges = eachMonthOfInterval({
        start: startOfMonth(sixMonthsAgo),
        end: endOfMonth(now),
      }).map((date) => ({
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, "MMM"),
      }))

      // Fetch all business users
      const usersCollection = collection(db, "users")
      const usersQuery = query(usersCollection, where("role", "==", "BUSER"))
      const usersSnapshot = await getDocs(usersQuery)
      const allBusinesses = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin ? {
          ...doc.data().lastLogin,
          timestamp: doc.data().lastLogin.timestamp?.toDate() || new Date(doc.data().lastLogin.timestamp)
        } : undefined,
        loginHistory: doc.data().loginHistory?.map((login: any) => ({
          ...login,
          timestamp: login.timestamp?.toDate() || new Date(login.timestamp)
        })) || []
      })) as BusinessUser[]

      setActiveBusinesses(allBusinesses.length)

      // Calculate estimated revenue upfront
      setTotalRevenue(allBusinesses.length * 49.99)

      // Fetch all reviews in parallel for all businesses
      const reviewPromises = allBusinesses.map(async (business) => {
        const reviewsQuery = collection(db, "users", business.uid, "reviews")
        const reviewsSnapshot = await getDocs(reviewsQuery)
        return reviewsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Review[]
      })

      const allReviews = await Promise.all(reviewPromises)
      const flattenedReviews = allReviews.flat()

      // Calculate platform-wide metrics
      const totalReviews = flattenedReviews.length
      const totalRating = flattenedReviews.reduce((sum, review) => sum + (review.rating || 0), 0)
      const platformAvgRating = totalReviews > 0 ? Number.parseFloat((totalRating / totalReviews).toFixed(1)) : 0
      setPlatformRating(platformAvgRating)

      // Calculate review distribution
      let positive = 0,
        neutral = 0,
        negative = 0
      flattenedReviews.forEach((review) => {
        if (review.rating >= 4) positive++
        else if (review.rating === 3) neutral++
        else negative++
      })

      const totalDistReviews = positive + neutral + negative
      setReviewDistribution({
        positive: Math.round((positive / totalDistReviews) * 100),
        neutral: Math.round((neutral / totalDistReviews) * 100),
        negative: Math.round((negative / totalDistReviews) * 100),
      })

      // Calculate monthly stats
      const monthlyStatsData = monthRanges.map((month) => {
        // Count businesses created in this month
        const businessesThisMonth = allBusinesses.filter(
          (business) => business.createdAt >= month.start && business.createdAt <= month.end,
        ).length

        // Filter reviews for this month
        const reviewsThisMonth = flattenedReviews.filter(
          (review) => review.createdAt >= month.start && review.createdAt <= month.end,
        )

        const ratingSumThisMonth = reviewsThisMonth.reduce((sum, review) => sum + (review.rating || 0), 0)
        const avgRatingThisMonth =
          reviewsThisMonth.length > 0 ? Number.parseFloat((ratingSumThisMonth / reviewsThisMonth.length).toFixed(1)) : 0

        return {
          month: month.label,
          businesses: businessesThisMonth,
          reviews: reviewsThisMonth.length,
          avgRating: avgRatingThisMonth,
        }
      })

      setMonthlyStats(monthlyStatsData)

      // Calculate reviews for current month
      const currentMonth = monthRanges[monthRanges.length - 1]
      const currentMonthReviews = flattenedReviews.filter(
        (review) => review.createdAt >= currentMonth.start && review.createdAt <= currentMonth.end,
      ).length
      setReviewsThisMonth(currentMonthReviews)

      // Calculate top categories
      const categoryMap = new Map<string, { businesses: number; reviews: number; ratingSum: number }>()

      // First pass: count businesses per category
      allBusinesses.forEach((business) => {
        const category = business.businessInfo?.businessType || "Uncategorized"
        const current = categoryMap.get(category) || { businesses: 0, reviews: 0, ratingSum: 0 }
        current.businesses++
        categoryMap.set(category, current)
      })

      // Second pass: count reviews and ratings per category
      allBusinesses.forEach((business) => {
        const category = business.businessInfo?.businessType || "Uncategorized"
        const businessReviews = allReviews[allBusinesses.indexOf(business)]
        const current = categoryMap.get(category)!

        current.reviews += businessReviews.length
        current.ratingSum += businessReviews.reduce((sum, review) => sum + (review.rating || 0), 0)
      })

      // Convert to array and calculate averages
      const topCategoriesData = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          businesses: data.businesses,
          reviews: data.reviews,
          avgRating: data.reviews > 0 ? Number.parseFloat((data.ratingSum / data.reviews).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, 5)

      setTopCategories(topCategoriesData)

      // Calculate device statistics with enhanced device detection and ensure unique devices per business
      const deviceMap = new Map<string, { count: number; businesses: Set<string> }>()
      allBusinesses.forEach((business) => {
        if (business.lastLogin?.device) {
          const deviceKey = formatDeviceName(business.lastLogin.device)

          if (!deviceMap.has(deviceKey)) {
            deviceMap.set(deviceKey, { count: 0, businesses: new Set() })
          }

          const entry = deviceMap.get(deviceKey)!
          if (!entry.businesses.has(business.uid)) {
            entry.count++
            entry.businesses.add(business.uid)
          }
        }
      })

      const totalDevices = Array.from(deviceMap.values()).reduce((sum, item) => sum + item.count, 0)
      const deviceStatsData = Array.from(deviceMap.entries()).map(([deviceModel, data]) => ({
        deviceType:
          deviceModel.includes("Samsung") ||
          deviceModel.includes("OPPO") ||
          deviceModel.includes("iPhone") ||
          deviceModel.includes("Xiaomi") ||
          deviceModel.includes("Mobile")
            ? "Mobile"
            : "Desktop",
        deviceModel,
        count: data.count,
        percentage: Math.round((data.count / totalDevices) * 100),
      }))

      setDeviceStats(deviceStatsData)

      // Calculate location statistics with enhanced location display
      const locationMap = new Map<string, number>()
      allBusinesses.forEach((business) => {
        if (business.lastLogin?.location) {
          const locationKey = formatLocation(business.lastLogin.location)
          if (locationKey !== "Location unavailable") {
            const current = locationMap.get(locationKey) || 0
            locationMap.set(locationKey, current + 1)
          }
        }
      })

      const totalLocations = Array.from(locationMap.values()).reduce((sum, count) => sum + count, 0)
      const locationStatsData = Array.from(locationMap.entries())
        .map(([location, count]) => {
          const [city, country] = location.includes(", ") ? location.split(", ") : [location, location]
          return {
            country,
            city,
            count,
            percentage: Math.round((count / totalLocations) * 100),
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      setLocationStats(locationStatsData)

      // Calculate login activity by hour
      const loginHours = Array(24)
        .fill(0)
        .map((_, i) => ({ hour: i, logins: 0 }))
      allBusinesses.forEach((business) => {
        if (business.loginHistory) {
          business.loginHistory.forEach((login) => {
            const hour = login.timestamp.getHours()
            loginHours[hour].logins++
          })
        }
      })
      setLoginActivity(loginHours)

      // Get recent logins with enhanced information and proper device/location formatting
      const allLogins = allBusinesses
        .flatMap((business) =>
          (business.loginHistory || []).map((login) => ({
            ...login,
            businessName: business.businessInfo?.businessName || "Unknown Business",
            businessType: business.businessInfo?.businessType || "Unknown",
            uid: business.uid,
            deviceName: formatDeviceName(login.device),
            locationName: formatLocation(login.location),
            logoutTime: null, // Will be calculated in the next step
          })),
        )
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      // Process login history to determine logout times
      const businessLoginMap = new Map()
      allLogins.forEach((login) => {
        const key = login.uid
        if (!businessLoginMap.has(key)) {
          businessLoginMap.set(key, [])
        }
        businessLoginMap.get(key).push(login)
      })

      // For each business, set logout times based on next login
      businessLoginMap.forEach((logins) => {
        for (let i = 0; i < logins.length - 1; i++) {
          logins[i].logoutTime = logins[i + 1].timestamp
        }
      })

      setRecentLogins(allLogins.slice(0, 10))
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalyticsData()
  }

  return (
    <SimpleAdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 md:p-6">
          {/* Header Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics & Reports
                </h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">
                  Platform performance and insights with enhanced device & location tracking
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm text-xs sm:text-sm bg-transparent"
                  disabled={loading}
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Date Range
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
                  disabled={loading}
                  onClick={handleRefresh}
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                {loading ? (
                  <div className="animate-pulse space-y-2 sm:space-y-3">
                    <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                      ${totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">+18% from last month</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Active Businesses</CardTitle>
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                {loading ? (
                  <div className="animate-pulse space-y-2 sm:space-y-3">
                    <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{activeBusinesses}</div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">+12% from last month</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Reviews This Month</CardTitle>
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                {loading ? (
                  <div className="animate-pulse space-y-2 sm:space-y-3">
                    <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{reviewsThisMonth}</div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">+23% from last month</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Platform Rating</CardTitle>
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                {loading ? (
                  <div className="animate-pulse space-y-2 sm:space-y-3">
                    <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{platformRating}</div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">+0.2 from last month</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Login Activity Section */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b border-gray-100 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                    Enhanced Login Activity & Device Tracking
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600">
                    Latest login sessions with accurate device detection and location tracking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              {loading ? (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="w-8 sm:w-12 h-8 sm:h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                        <div className="flex flex-col space-y-1 sm:space-y-2">
                          <div className="w-32 sm:w-48 h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                          <div className="w-24 sm:w-36 h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-16 sm:w-20 h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {recentLogins.map((login, index) => {
                    // Format timestamps for login and logout
                    const loginTime = login.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    const loginDate = login.timestamp.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })

                    return (
                      <div
                        key={index}
                        className="flex flex-col p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 space-y-3"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                            {login.device.type === "Mobile" || login.deviceName.includes("iPhone") || login.deviceName.includes("Samsung") ? (
                              <Smartphone className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <Monitor className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-base truncate flex items-center">
                              {login.businessName}
                              <span className="ml-2 text-xs text-gray-500 font-normal">UID: {login.uid}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {login.locationName}
                                </span>
                                {login.location?.accuracy && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    {login.location.accuracy} accuracy
                                  </span>
                                )}
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Login: {loginTime} on {loginDate}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                                <span>{login.deviceName}</span>
                                <span className="text-gray-400">•</span>
                                <span>{login.device.os}</span>
                                <span className="text-gray-400">•</span>
                                <span>{login.device.browser}</span>
                                <span className="text-gray-400">•</span>
                                <span className="capitalize">{login.loginMethod}</span>
                                {login.sessionId && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span>Session: {login.sessionId.slice(-8)}</span>
                                  </>
                                )}
                                {login.location?.source && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span>Location via: {login.location.source}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${login.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
                          <span className={`text-xs font-medium ${login.isActive ? "text-green-600" : "text-gray-600"}`}>
                            {login.isActive ? "Active" : "Logged Out"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Enhanced Device Statistics */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg border-b border-gray-100 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                      Enhanced Device Statistics
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600">
                      Accurate device detection and identification
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {loading ? (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="w-24 sm:w-36 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                        <div className="w-8 sm:w-12 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {deviceStats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 sm:w-12 text-xs sm:text-sm font-bold text-indigo-600 bg-indigo-100 rounded-lg p-1.5 sm:p-2 text-center">
                            {stat.deviceType === "Mobile" ? "📱" : "💻"}
                          </div>
                          <div>
                            <span className="text-sm sm:text-base font-medium text-gray-700">{stat.deviceModel}</span>
                            <div className="text-xs text-gray-500">{stat.deviceType}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-bold text-gray-800">{stat.count}</span>
                          <div className="text-xs text-gray-500">({stat.percentage}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Location Statistics */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b border-gray-100 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                      Enhanced Login Locations
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600">
                      Accurate geographic distribution with location services
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {loading ? (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="w-32 sm:w-48 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                        <div className="w-8 sm:w-12 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {locationStats.slice(0, 8).map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 sm:w-12 text-xs sm:text-sm font-bold text-green-600 bg-green-100 rounded-lg p-1.5 sm:p-2 text-center">
                            🌍
                          </div>
                          <div>
                            <span className="text-sm sm:text-base font-medium text-gray-700">{stat.city}</span>
                            <div className="text-xs text-gray-500">{stat.country}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-bold text-gray-800">{stat.count}</span>
                          <div className="text-xs text-gray-500">({stat.percentage}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Growth */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b border-gray-100 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                      Monthly Growth
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600">
                      Business registrations and review activity
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {loading ? (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="w-8 sm:w-12 h-4 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                            <div className="w-20 sm:w-28 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                            <div className="w-20 sm:w-28 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="w-8 sm:w-12 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {monthlyStats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 space-y-2 sm:space-y-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                          <div className="w-8 sm:w-12 text-xs sm:text-sm font-bold text-blue-600 bg-blue-100 rounded-lg p-1.5 sm:p-2 text-center">
                            {stat.month}
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 lg:space-x-8">
                            <div className="text-xs sm:text-sm">
                              <span className="text-gray-500 font-medium">Businesses:</span>
                              <span className="ml-2 font-bold text-gray-800">{stat.businesses}</span>
                            </div>
                            <div className="text-xs sm:text-sm">
                              <span className="text-gray-500 font-medium">Reviews:</span>
                              <span className="ml-2 font-bold text-gray-800">{stat.reviews}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-yellow-100 px-2 sm:px-3 py-1 rounded-lg self-start sm:self-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                          <span className="text-xs sm:text-sm font-bold text-gray-800">{stat.avgRating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b border-gray-100 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                    <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                      Top Categories
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600">
                      Most popular business categories
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {loading ? (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <div className="w-24 sm:w-36 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2 sm:mb-3"></div>
                          <div className="w-32 sm:w-52 h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                        </div>
                        <div className="w-8 sm:w-12 h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {topCategories.map((category, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 space-y-2 sm:space-y-0"
                      >
                        <div>
                          <p className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg">{category.category}</p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            <span className="font-medium">{category.businesses}</span> businesses •
                            <span className="font-medium ml-1">{category.reviews}</span> reviews
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 bg-yellow-100 px-2 sm:px-3 py-1 rounded-lg self-start sm:self-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-gray-800 text-xs sm:text-sm">{category.avgRating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Trends */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg border-b border-gray-100 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                    Review Trends
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600">
                    Review distribution and sentiment analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 sm:h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mx-auto animate-pulse mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <div className="text-center p-4 sm:p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {reviewDistribution.positive}%
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium mt-2">Positive Reviews (4-5 stars)</p>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {reviewDistribution.neutral}%
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium mt-2">Neutral Reviews (3 stars)</p>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {reviewDistribution.negative}%
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium mt-2">Negative Reviews (1-2 stars)</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleAdminLayout>
  )
}
