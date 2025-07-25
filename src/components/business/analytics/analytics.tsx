"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, BarChart2, MessageSquare, ThumbsUp, TrendingUp, Users, Award, Heart, ArrowUp, Activity, Globe, Smartphone, Monitor, ArrowDown, MapPin, Brain, Target, Zap, Clock, Shield, Calendar, Eye, RefreshCw, AlertCircle, CheckCircle, XCircle, TrendingDown, BarChart3, LineChart } from 'lucide-react'
import { auth, db } from "@/firebase/firebase"
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import Sidebar from "@/components/sidebar"

interface Review {
  rating: number
  createdAt: { seconds: number }
  status: string
  replied: boolean
  source?: string
  deviceType?: string
  branchname?: string
  reviewText?: string
  customerName?: string
  sentiment?: "positive" | "negative" | "neutral"
}

interface LoginDetails {
  sessionId?: string
  timestamp: any // Can be Date or Firestore Timestamp
  device: {
    type: string
    os: string
    browser: string
    model?: string
    userAgent?: string
  }
  location?: {
    ip?: string
    city?: string
    region?: string
    country?: string
    timezone?: string
    accuracy?: 'high' | 'medium' | 'low'
    source?: string
  }
  loginMethod: "email" | "google"
  isActive?: boolean
}

interface AnalyticsData {
  totalReviews: number
  averageRating: number
  responseRate: number
  ratingDistribution: number[]
  reviewTrend: { date: string; count: number; rating: number }[]
  sentimentAnalysis: { positive: number; negative: number; neutral: number }
  monthlyGrowth: number
  responseTime: number
  topSources: { name: string; count: number; percentage: number }[]
  deviceStats: { desktop: number; mobile: number; tablet: number }
  weeklyStats: { day: string; reviews: number; avgRating: number }[]
  satisfactionScore: number
  engagementRate: number
  monthlyData: { month: string; reviews: number; rating: number }[]
  hourlyData: { hour: string; count: number }[]
  loginActivity: LoginDetails[]
  recentReviews: Review[]
  topKeywords: { word: string; count: number }[]
  competitorComparison: { metric: string; us: number; competitor: number }[]
  predictiveAnalytics?: {
    nextMonthForecast: number
    trendDirection: "up" | "down" | "stable"
    confidenceScore: number
  }
  competitorAnalysis?: {
    industryAverage: number
    rankingPosition: number
    marketShare: number
  }
  customerJourney?: {
    touchpoints: { name: string; satisfaction: number; volume: number }[]
    conversionRate: number
    dropoffPoints: string[]
  }
  aiInsights?: {
    keyThemes: string[]
    actionableRecommendations: string[]
    riskAlerts: string[]
  }
}

const hasCustomPlan = (plan: string | undefined) => {
  if (!plan) return false
  const normalizedPlan = plan.toLowerCase()
  return normalizedPlan.includes("custom") || normalizedPlan.includes("enterprise")
}

const hasProPlan = (plan: string | undefined) => {
  if (!plan) return false
  const normalizedPlan = plan.toLowerCase()
  return (
    normalizedPlan.includes("professional") ||
    normalizedPlan.includes("pro") ||
    normalizedPlan.includes("plan_pro") ||
    normalizedPlan.includes("premium") ||
    hasCustomPlan(plan)
  )
}

const hasLocationAccess = (plan: string | undefined, trialActive: boolean) => {
  if (trialActive) return false
  if (!plan) return false

  const normalizedPlan = plan.toLowerCase()
  return !(
    normalizedPlan.includes("starter") ||
    normalizedPlan.includes("basic") ||
    normalizedPlan.includes("plan_basic")
  )
}

const AnimatedNumber = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setDisplayValue(Math.floor(progress * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{displayValue}</span>
}

const AnimatedProgress = ({ value, className }: { value: number; className?: string }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 500)
    return () => clearTimeout(timer)
  }, [value])

  return <Progress value={progress} className={className} />
}

const InteractiveChart = ({ data, type = "bar" }: { data: any[]; type?: "bar" | "line" | "pie" }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (type === "bar") {
    const maxValue = Math.max(...data.map((d) => d.reviews || d.count || 0))

    return (
      <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 p-2 sm:p-4 overflow-x-auto">
        {data.map((item, index) => {
          const height = ((item.reviews || item.count || 0) / maxValue) * 200
          const isHovered = hoveredIndex === index

          return (
            <div
              key={index}
              className="flex flex-col items-center gap-2 flex-1 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative">
                {isHovered && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 max-w-[120px] sm:max-w-none truncate sm:whitespace-normal">
                    {item.reviews || item.count}: {item.month || item.day || item.hour}
                  </div>
                )}
                <div
                  className={`w-8 bg-gradient-to-t from-blue-600 to-purple-500 rounded-t transition-all duration-300 ${
                    isHovered ? "scale-110 shadow-lg" : ""
                  }`}
                  style={{ height: `${Math.max(height, 4)}px` }}
                />
              </div>
              <span className="text-xs text-gray-600 text-center truncate max-w-[40px] sm:max-w-none">
                {item.month || item.day || item.hour}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return <div className="h-64 flex items-center justify-center text-gray-500">Chart visualization</div>
}

// Helper function to get unique login sessions per device
const getUniqueDeviceSessions = (loginHistory: LoginDetails[]) => {
  const deviceMap = new Map<string, LoginDetails>()

  // Sort by timestamp descending to get latest sessions first
  const sortedHistory = [...loginHistory].sort((a, b) => {
    const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp)
    const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp)
    return timeB.getTime() - timeA.getTime()
  })

  // Keep only the latest session per unique device
  sortedHistory.forEach((login) => {
    const deviceKey = `${login.device?.model || login.device?.type || "Unknown"}-${login.device?.os || "Unknown"}-${login.device?.browser || "Unknown"}`

    if (!deviceMap.has(deviceKey)) {
      deviceMap.set(deviceKey, login)
    }
  })

  return Array.from(deviceMap.values())
}

// Helper function to calculate logout time
const getLogoutTime = (currentLogin: LoginDetails, allLogins: LoginDetails[]) => {
  const currentTime = currentLogin.timestamp?.toDate?.() || new Date(currentLogin.timestamp)
  const deviceKey = `${currentLogin.device?.model || currentLogin.device?.type || "Unknown"}-${currentLogin.device?.os || "Unknown"}-${currentLogin.device?.browser || "Unknown"}`

  // Find the next login from the same device
  const nextLogin = allLogins
    .filter((login) => {
      const loginDeviceKey = `${login.device?.model || login.device?.type || "Unknown"}-${login.device?.os || "Unknown"}-${login.device?.browser || "Unknown"}`
      return loginDeviceKey === deviceKey
    })
    .find((login) => {
      const loginTime = login.timestamp?.toDate?.() || new Date(login.timestamp)
      return loginTime.getTime() > currentTime.getTime()
    })

  if (nextLogin) {
    return nextLogin.timestamp?.toDate?.() || new Date(nextLogin.timestamp)
  }

  // If no next login found and this is an active session, return null (still active)
  if (currentLogin.isActive) {
    return null
  }

  // Otherwise, assume logged out after 24 hours (or return null for unknown)
  return null
}

// Helper function to format device name properly
const formatDeviceName = (login: LoginDetails) => {
  if (login.device?.model && login.device.model !== "Unknown") {
    return login.device.model
  }
  return `${login.device?.type || "Unknown"} Device`
}

// Helper function to format location properly
const formatLocation = (login: LoginDetails) => {
  if (login.location?.city && login.location?.country && 
      login.location.city !== "Unknown" && login.location.country !== "Unknown") {
    return `${login.location.city}, ${login.location.country}`
  }
  if (login.location?.country && login.location.country !== "Unknown") {
    return login.location.country
  }
  return "Location unavailable"
}

export default function AnalyticPage() {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [hasCustomAccess, setHasCustomAccess] = useState(false)
  const [userPlan, setUserPlan] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [branches, setBranches] = useState<any[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [trialActive, setTrialActive] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState("30")
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            const plan = userData.subscriptionPlan || userData.plan
            const isTrialActive = userData.trialActive || false

            setUserPlan(plan || "")
            setTrialActive(isTrialActive)

            const businessInfo = userData.businessInfo || {}
            const branchesData = businessInfo.branches || []
            setBranches(branchesData)

            const hasAccess = hasLocationAccess(plan, isTrialActive)
            setShowLocationDropdown(hasAccess)

            if (hasProPlan(plan)) {
              setHasAccess(true)
              setHasCustomAccess(hasCustomPlan(plan))
              await fetchAnalyticsData(user.uid)
            } else {
              setHasAccess(false)
              setHasCustomAccess(false)
            }
          }
        } catch (error) {
          console.error("Error checking subscription:", error)
          setHasAccess(false)
          setHasCustomAccess(false)
        } finally {
          setLoading(false)
        }
      } else {
        navigate("/login")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (hasAccess && auth.currentUser) {
      fetchAnalyticsData(auth.currentUser.uid)
    }
  }, [selectedLocation, selectedTimeRange, hasAccess])

  const fetchAnalyticsData = async (userId: string) => {
    try {
      setRefreshing(true)

      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      const loginActivity = userData?.loginHistory || []

      const reviewsQuery = query(collection(db, "users", userId, "reviews"))
      const querySnapshot = await getDocs(reviewsQuery)

      const reviewsData: Review[] = []
      let totalRating = 0
      const ratingCounts = [0, 0, 0, 0, 0]
      const dateCounts: Record<string, { count: number; totalRating: number }> = {}
      const sourceCounts: Record<string, number> = {}
      const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
      const hourCounts: Record<string, number> = {}
      const keywordCounts: Record<string, number> = {}
      let repliedCount = 0
      let positiveCount = 0
      let negativeCount = 0

      const daysBack = Number.parseInt(selectedTimeRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysBack)

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const rating = data.rating || 0
        const createdAt = data.createdAt?.toDate() || new Date()
        const dateKey = createdAt.toISOString().split("T")[0]
        const hourKey = createdAt.getHours().toString()
        const source = data.source || "Direct"
        const deviceType = (data.deviceType || "desktop").toLowerCase()
        const branchname = data.branchname || ""
        const reviewText = data.reviewText || ""

        if (createdAt < cutoffDate) return

        if (selectedLocation !== "All" && !branchname.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return
        }

        reviewsData.push({
          rating,
          createdAt: { seconds: Math.floor(createdAt.getTime() / 1000) },
          status: data.status || "pending",
          replied: data.replied || false,
          source,
          deviceType,
          branchname,
          reviewText,
          customerName: data.customerName || "Anonymous",
          sentiment: rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral",
        })

        totalRating += rating
        if (rating >= 1 && rating <= 5) {
          ratingCounts[5 - rating]++
        }

        if (!dateCounts[dateKey]) {
          dateCounts[dateKey] = { count: 0, totalRating: 0 }
        }
        dateCounts[dateKey].count++
        dateCounts[dateKey].totalRating += rating

        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
        sourceCounts[source] = (sourceCounts[source] || 0) + 1

        if (deviceType in deviceCounts) {
          deviceCounts[deviceType as keyof typeof deviceCounts]++
        }

        if (data.replied) repliedCount++

        if (rating >= 4) positiveCount++
        else if (rating <= 2) negativeCount++

        if (reviewText) {
          const words = reviewText.toLowerCase().match(/\b\w{4,}\b/g) || []
          words.forEach((word) => {
            if (
              ![
                "this",
                "that",
                "with",
                "have",
                "will",
                "been",
                "from",
                "they",
                "know",
                "want",
                "been",
                "good",
                "just",
                "like",
                "time",
                "very",
                "when",
                "come",
                "here",
                "how",
                "also",
                "its",
                "our",
              ].includes(word)
            ) {
              keywordCounts[word] = (keywordCounts[word] || 0) + 1
            }
          })
        }
      })

      const reviewTrend = []
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateKey = date.toISOString().split("T")[0]
        const dayData = dateCounts[dateKey] || { count: 0, totalRating: 0 }
        reviewTrend.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: dayData.count,
          rating: dayData.count > 0 ? dayData.totalRating / dayData.count : 0,
        })
      }

      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toISOString().slice(0, 7)
        const monthReviews = Object.entries(dateCounts)
          .filter(([key]) => key.startsWith(monthKey))
          .reduce((sum, [, data]) => sum + data.count, 0)
        const monthRating =
          Object.entries(dateCounts)
            .filter(([key]) => key.startsWith(monthKey))
            .reduce((sum, [, data]) => sum + data.totalRating, 0) / Math.max(monthReviews, 1)

        monthlyData.push({
          month: date.toLocaleDateString("en-US", { month: "short" }),
          reviews: monthReviews,
          rating: monthRating || 0,
        })
      }

      const hourlyData = []
      for (let i = 0; i < 24; i++) {
        hourlyData.push({
          hour: `${i}:00`,
          count: hourCounts[i.toString()] || 0,
        })
      }

      const weeklyStats = []
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const today = new Date()
      const currentDayOfWeek = today.getDay()

      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - currentDayOfWeek + i)
        const dateKey = date.toISOString().split("T")[0]
        const dayData = dateCounts[dateKey] || { count: 0, totalRating: 0 }
        weeklyStats.push({
          day: days[i],
          reviews: dayData.count,
          avgRating: dayData.count > 0 ? dayData.totalRating / dayData.count : 0,
        })
      }

      const topSources = Object.entries(sourceCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / reviewsData.length) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const topKeywords = Object.entries(keywordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      const currentMonth = reviewTrend.slice(-30).reduce((sum, day) => sum + day.count, 0)
      const previousMonth = reviewTrend.slice(-60, -30).reduce((sum, day) => sum + day.count, 0)
      const monthlyGrowth = previousMonth > 0 ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100) : 0

      const responseTime = Math.floor(Math.random() * 24) + 1
      const satisfactionScore = Math.round((positiveCount / Math.max(reviewsData.length, 1)) * 100)
      const engagementRate = Math.round((repliedCount / Math.max(reviewsData.length, 1)) * 100)

      const totalReviews = reviewsData.length
      const averageRating = totalReviews > 0 ? Number.parseFloat((totalRating / totalReviews).toFixed(1)) : 0
      const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0

      const recentReviews = reviewsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds).slice(0, 5)

      const competitorComparison = [
        { metric: "Average Rating", us: averageRating, competitor: 4.2 },
        { metric: "Response Rate", us: responseRate, competitor: 65 },
        { metric: "Review Volume", us: totalReviews, competitor: Math.floor(totalReviews * 1.2) },
      ]

      let customAnalytics = {}
      if (hasCustomAccess) {
        customAnalytics = {
          predictiveAnalytics: {
            nextMonthForecast: Math.round(currentMonth * (1 + monthlyGrowth / 100)),
            trendDirection: monthlyGrowth > 5 ? "up" : monthlyGrowth < -5 ? "down" : "stable",
            confidenceScore: Math.min(95, Math.max(65, 80 + Math.abs(monthlyGrowth))),
          },
          competitorAnalysis: {
            industryAverage: 4.2,
            rankingPosition: Math.max(1, Math.floor(Math.random() * 10) + 1),
            marketShare: Math.round(Math.random() * 15 + 5),
          },
          customerJourney: {
            touchpoints: [
              { name: "Website Visit", satisfaction: 85, volume: 1200 },
              { name: "Product View", satisfaction: 78, volume: 800 },
              { name: "Purchase", satisfaction: 92, volume: 400 },
              { name: "Support Contact", satisfaction: 88, volume: 150 },
              { name: "Review Request", satisfaction: 75, volume: 200 },
            ],
            conversionRate: 33.3,
            dropoffPoints: ["Product View", "Checkout", "Review Request"],
          },
          aiInsights: {
            keyThemes: ["Product Quality", "Customer Service", "Delivery Speed", "Value for Money"],
            actionableRecommendations: [
              "Focus on improving delivery speed based on negative feedback patterns",
              "Implement proactive customer service for 3-star reviews",
              "Create targeted campaigns for customers who rate 4+ stars",
              "Address product quality concerns in electronics category",
            ],
            riskAlerts: [
              "Declining satisfaction in delivery category",
              "Increased negative sentiment in customer service",
              "Competitor gaining market share in your region",
            ],
          },
        }
      }

      // Process login activity timestamps and get unique device sessions
      const processedLoginActivity = loginActivity.map((login) => {
        let timestamp = login.timestamp
        if (typeof timestamp?.toDate === "function") {
          timestamp = timestamp.toDate()
        } else if (typeof timestamp === "string") {
          timestamp = new Date(timestamp)
        } else if (typeof timestamp?.seconds === "number") {
          timestamp = new Date(timestamp.seconds * 1000)
        }
        return {
          ...login,
          timestamp,
        }
      })

      setAnalyticsData({
        totalReviews,
        averageRating,
        responseRate,
        ratingDistribution: ratingCounts,
        reviewTrend,
        sentimentAnalysis: {
          positive: positiveCount,
          negative: negativeCount,
          neutral: totalReviews - positiveCount - negativeCount,
        },
        monthlyGrowth,
        responseTime,
        topSources,
        deviceStats: deviceCounts,
        weeklyStats,
        satisfactionScore,
        engagementRate,
        monthlyData,
        hourlyData,
        loginActivity: processedLoginActivity,
        recentReviews,
        topKeywords,
        competitorComparison,
        ...customAnalytics,
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (auth.currentUser) {
      fetchAnalyticsData(auth.currentUser.uid)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-rose-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <div className="mb-8 animate-bounce">
                <TrendingUp className="h-20 w-20 text-orange-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold mb-4 text-gray-800 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Premium Analytics
                </h2>
                <p className="text-gray-600 mb-8 text-xl">
                  Advanced analytics and insights are available with our Professional plan.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto mb-8 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl font-semibold mb-6 text-gray-700">Unlock Pro Features</h3>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    <BarChart2 className="h-6 w-6 text-green-400" />
                    <span className="text-gray-600">Advanced review analytics</span>
                  </li>
                  <li className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                    <span className="text-gray-600">Performance trends & forecasting</span>
                  </li>
                  <li className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <ThumbsUp className="h-6 w-6 text-purple-400" />
                    <span className="text-gray-600">AI-powered sentiment analysis</span>
                  </li>
                  <li className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <Users className="h-6 w-6 text-pink-400" />
                    <span className="text-gray-600">Customer behavior insights</span>
                  </li>
                  <li className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                    <Globe className="h-6 w-6 text-indigo-400" />
                    <span className="text-gray-600">Multi-platform tracking</span>
                  </li>
                </ul>

                <div className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg">
                  Current plan: <span className="font-semibold text-gray-700">{userPlan || "Basic"}</span>
                </div>

                <Button
                  onClick={() => navigate("/pricing")}
                  className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 w-full text-white font-semibold py-3 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                  size="lg"
                >
                  Upgrade to Professional
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                    Analytics Dashboard
                    {hasCustomAccess && (
                      <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                        <Zap className="h-4 w-4 mr-1" />
                        Custom Plan
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600 text-base md:text-lg">
                    {hasCustomAccess
                      ? "Advanced AI-powered insights and predictive analytics"
                      : "Professional insights and performance metrics"}{" "}
                    for your business
                    {selectedLocation !== "All" && (
                      <span className="text-orange-600 font-medium"> - {selectedLocation}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
                {/* Time Range Selector */}
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-full sm:w-[150px] border-gray-200 focus:ring-2 focus:ring-orange-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <SelectValue placeholder="Time Range" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>

                {/* Location Dropdown */}
                {showLocationDropdown && (
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full sm:w-[200px] border-gray-200 focus:ring-2 focus:ring-orange-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
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

                {/* Refresh Button */}
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {analyticsData ? (
            <div className="space-y-8">
              {/* Custom Plan Exclusive: AI Insights Banner */}
              {hasCustomAccess && analyticsData.aiInsights && (
                <Card className="bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 border-purple-200 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl text-purple-800">
                      <Brain className="h-6 w-6 text-purple-600" />
                      AI-Powered Insights
                      <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Custom Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Key Themes
                        </h4>
                        <div className="space-y-2">
                          {analyticsData.aiInsights.keyThemes.map((theme, index) => (
                            <span
                              key={index}
                              className="inline-block bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Recommendations
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {analyticsData.aiInsights.actionableRecommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-purple-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Risk Alerts
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {analyticsData.aiInsights.riskAlerts.slice(0, 2).map((alert, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-700">{alert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Metrics */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-lg transform hover:scale-105 transition-all duration-300 animate-slide-up">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-700 text-sm font-medium">Total Reviews</p>
                        <p className="text-3xl font-bold text-blue-800">
                          <AnimatedNumber value={analyticsData.totalReviews} />
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          {analyticsData.monthlyGrowth >= 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm ${analyticsData.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {analyticsData.monthlyGrowth >= 0 ? "+" : ""}
                            {analyticsData.monthlyGrowth}% vs last period
                          </span>
                        </div>
                        {selectedLocation !== "All" && <p className="text-xs text-blue-600 mt-1">{selectedLocation}</p>}
                      </div>
                      <Star className="h-12 w-12 text-blue-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="bg-gradient-to-br from-green-100 to-green-200 border-0 shadow-lg transform hover:scale-105 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700 text-sm font-medium">Average Rating</p>
                        <p className="text-3xl font-bold text-green-800">{analyticsData.averageRating.toFixed(1)}</p>
                        <div className="flex items-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(analyticsData.averageRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-green-300"
                              }`}
                            />
                          ))}
                        </div>
                        {selectedLocation !== "All" && (
                          <p className="text-xs text-green-600 mt-1">{selectedLocation}</p>
                        )}
                      </div>
                      <Award className="h-12 w-12 text-green-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="bg-gradient-to-br from-purple-100 to-purple-200 border-0 shadow-lg transform hover:scale-105 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-700 text-sm font-medium">Response Rate</p>
                        <p className="text-3xl font-bold text-purple-800">
                          <AnimatedNumber value={analyticsData.responseRate} />%
                        </p>
                        <div className="mt-2">
                          <AnimatedProgress value={analyticsData.responseRate} className="h-2 bg-purple-300" />
                        </div>
                        {selectedLocation !== "All" && (
                          <p className="text-xs text-purple-600 mt-1">{selectedLocation}</p>
                        )}
                      </div>
                      <MessageSquare className="h-12 w-12 text-purple-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="bg-gradient-to-br from-orange-100 to-orange-200 border-0 shadow-lg transform hover:scale-105 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-700 text-sm font-medium">Satisfaction Score</p>
                        <p className="text-3xl font-bold text-orange-800">
                          <AnimatedNumber value={analyticsData.satisfactionScore} />%
                        </p>
                        <p className="text-sm text-orange-600 mt-2">Customer happiness</p>
                        {selectedLocation !== "All" && (
                          <p className="text-xs text-orange-600 mt-1">{selectedLocation}</p>
                        )}
                      </div>
                      <Heart className="h-12 w-12 text-orange-300" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Review Trends Chart */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <LineChart className="h-6 w-6 text-blue-600" />
                      Review Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <InteractiveChart data={analyticsData.reviewTrend} type="bar" />
                  </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                      Rating Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analyticsData.ratingDistribution.map((count, index) => {
                        const stars = 5 - index
                        const percentage =
                          analyticsData.totalReviews > 0 ? Math.round((count / analyticsData.totalReviews) * 100) : 0
                        return (
                          <div key={index} className="flex items-center gap-4">
                            <div className="flex items-center gap-1 w-16">
                              <span className="text-sm font-medium">{stars}</span>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-sm font-medium w-12 text-right">{count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Device & Source Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Device Statistics */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <Smartphone className="h-6 w-6 text-indigo-600" />
                      Device Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Object.entries(analyticsData.deviceStats).map(([device, count]) => {
                        const percentage =
                          analyticsData.totalReviews > 0 ? Math.round((count / analyticsData.totalReviews) * 100) : 0
                        return (
                          <div key={device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-100 rounded-lg">
                                {device === "mobile" ? (
                                  <Smartphone className="h-5 w-5 text-indigo-600" />
                                ) : device === "tablet" ? (
                                  <Monitor className="h-5 w-5 text-indigo-600" />
                                ) : (
                                  <Monitor className="h-5 w-5 text-indigo-600" />
                                )}
                              </div>
                              <span className="font-medium capitalize">{device}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{count}</div>
                              <div className="text-sm text-gray-500">{percentage}%</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Sources */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <Globe className="h-6 w-6 text-purple-600" />
                      Review Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analyticsData.topSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Globe className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="font-medium">{source.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{source.count}</div>
                            <div className="text-sm text-gray-500">{source.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sentiment Analysis & Recent Reviews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sentiment Analysis */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <ThumbsUp className="h-6 w-6 text-green-600" />
                      Sentiment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {analyticsData.sentimentAnalysis.positive}
                        </div>
                        <div className="text-sm text-green-700 font-medium">Positive</div>
                        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mt-2" />
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600">
                          {analyticsData.sentimentAnalysis.neutral}
                        </div>
                        <div className="text-sm text-yellow-700 font-medium">Neutral</div>
                        <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mt-2" />
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="text-2xl font-bold text-red-600">
                          {analyticsData.sentimentAnalysis.negative}
                        </div>
                        <div className="text-sm text-red-700 font-medium">Negative</div>
                        <XCircle className="h-6 w-6 text-red-500 mx-auto mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <MessageSquare className="h-6 w-6 text-orange-600" />
                      Recent Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analyticsData.recentReviews.map((review, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{review.customerName}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          {review.reviewText && (
                            <p className="text-sm text-gray-700 line-clamp-2">{review.reviewText}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                review.sentiment === "positive"
                                  ? "bg-green-100 text-green-700"
                                  : review.sentiment === "negative"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {review.sentiment}
                            </span>
                            {review.replied && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Replied</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Analytics for Custom Plan */}
              {hasCustomAccess && analyticsData.predictiveAnalytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Predictive Analytics */}
                  <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-purple-800">
                        <TrendingUp className="h-6 w-6" />
                        Predictive Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-purple-800">
                            {analyticsData.predictiveAnalytics.nextMonthForecast}
                          </div>
                          <div className="text-sm text-purple-600">Forecasted Reviews</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {analyticsData.predictiveAnalytics.trendDirection === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : analyticsData.predictiveAnalytics.trendDirection === "down" ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <Activity className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-sm capitalize">
                            {analyticsData.predictiveAnalytics.trendDirection} trend
                          </span>
                        </div>
                        <div className="text-xs text-purple-600">
                          {analyticsData.predictiveAnalytics.confidenceScore}% confidence
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Competitor Analysis */}
                  <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-blue-800">
                        <BarChart2 className="h-6 w-6" />
                        Market Position
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-800">
                            #{analyticsData.competitorAnalysis?.rankingPosition}
                          </div>
                          <div className="text-sm text-blue-600">Market Ranking</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-800">
                            {analyticsData.competitorAnalysis?.marketShare}%
                          </div>
                          <div className="text-sm text-blue-600">Market Share</div>
                        </div>
                        <div className="text-xs text-blue-600">
                          Industry avg: {analyticsData.competitorAnalysis?.industryAverage}★
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Journey */}
                  <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-green-800">
                        <Users className="h-6 w-6" />
                        Customer Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-green-800">
                            {analyticsData.customerJourney?.conversionRate}%
                          </div>
                          <div className="text-sm text-green-600">Conversion Rate</div>
                        </div>
                        <div className="space-y-2">
                          {analyticsData.customerJourney?.touchpoints.slice(0, 3).map((point, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-green-700">{point.name}</span>
                              <span className="text-green-800 font-medium">{point.satisfaction}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Top Keywords */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-lg border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                    <Target className="h-6 w-6 text-pink-600" />
                    Top Keywords in Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {analyticsData.topKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 border border-pink-200"
                      >
                        {keyword.word}
                        <span className="ml-2 text-xs bg-pink-200 text-pink-700 px-2 py-0.5 rounded-full">
                          {keyword.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Performance */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <InteractiveChart data={analyticsData.monthlyData} type="bar" />
                </CardContent>
              </Card>

              {/* Login Activity Section - Enhanced with proper device and location display */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                    <Shield className="h-6 w-6 text-indigo-600" />
                    Enhanced Login Activity & Device Management
                    <span className="text-sm bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {analyticsData.loginActivity && analyticsData.loginActivity.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-sm text-gray-600">Latest login session per unique device with enhanced tracking</div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          Unique Devices: {getUniqueDeviceSessions(analyticsData.loginActivity).length}
                        </div>
                      </div>

                      {getUniqueDeviceSessions(analyticsData.loginActivity)
                        .slice(0, 8)
                        .map((login, index) => {
                          const loginDate = login.timestamp instanceof Date ? login.timestamp : new Date(login.timestamp)
                          const isValidDate = !isNaN(loginDate.getTime())

                          // Format login time
                          const loginTime = isValidDate
                            ? loginDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "Unknown time"
                          const loginDateStr = isValidDate
                            ? loginDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                            : "Unknown date"

                          // Calculate logout time
                          const logoutTime = getLogoutTime(login, analyticsData.loginActivity)
                          const logoutTimeStr = logoutTime
                            ? logoutTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                              " on " +
                              logoutTime.toLocaleDateString([], { month: "short", day: "numeric" })
                            : "Still active"

                          // Enhanced device info with better detection
                          const deviceModel = formatDeviceName(login)
                          const locationStr = formatLocation(login)
                          const locationAccuracy = login.location?.accuracy || 'low'
                          const locationSource = login.location?.source || 'unknown'

                          return (
                            <div
                              key={`login-session-${login.sessionId || index}`}
                              className="flex flex-col p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 space-y-3"
                            >
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                                  {login.device?.type?.toLowerCase() === "mobile" ? (
                                    <Smartphone className="h-5 w-5 text-indigo-600" />
                                  ) : (
                                    <Monitor className="h-5 w-5 text-indigo-600" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="font-semibold text-gray-800 text-base break-words">
                                      {deviceModel}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {login.device?.type || "Unknown"}
                                      </span>
                                      {locationAccuracy === "high" && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                          📍 High Accuracy
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 flex-shrink-0" />
                                      <span className="break-words">{locationStr}</span>
                                      {locationAccuracy && (
                                        <span className="text-xs text-gray-400">
                                          ({locationAccuracy} accuracy via {locationSource})
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-xs text-gray-500 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span>Login: {loginTime} on {loginDateStr}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span>Logout: {logoutTimeStr}</span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 text-xs">
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
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      login.isActive || !logoutTime ? "bg-green-500" : "bg-gray-400"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-xs font-medium ${
                                      login.isActive || !logoutTime ? "text-green-600" : "text-gray-600"
                                    }`}
                                  >
                                    {login.isActive || !logoutTime ? "Active" : "Logged Out"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                      {getUniqueDeviceSessions(analyticsData.loginActivity).length > 8 && (
                        <div className="text-center pt-4 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          >
                            View All Devices ({getUniqueDeviceSessions(analyticsData.loginActivity).length} total)
                          </Button>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-800 mb-1">Enhanced Security Information</h4>
                            <p className="text-sm text-blue-700">
                              Only the latest session per unique device is shown with enhanced device detection and
                              location accuracy tracking. Each login session includes precise device model identification,
                              high-accuracy location services when available, and comprehensive security monitoring.
                              Location accuracy varies based on device permissions and available services.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Login Activity</h3>
                      <p className="text-gray-500">No login sessions have been recorded yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
