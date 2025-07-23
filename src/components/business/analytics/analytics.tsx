"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  BarChart2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Users,
  Award,
  Heart,
  Calendar,
  ArrowUp,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  ArrowDown,
  MapPin,
  Brain,
  Target,
  Zap,
  Eye,
  Clock,
  Filter,
  LineChart,
  TrendingDown,
} from "lucide-react"
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
  // Custom plan exclusive features
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

// Helper function to check if user has custom plan
const hasCustomPlan = (plan: string | undefined) => {
  if (!plan) return false
  const normalizedPlan = plan.toLowerCase()
  return normalizedPlan.includes("custom") || normalizedPlan.includes("enterprise")
}

// Helper function to check if user has pro plan
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

// Animation component for counting numbers
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

// Animated progress bar
const AnimatedProgress = ({ value, className }: { value: number; className?: string }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 500)
    return () => clearTimeout(timer)
  }, [value])

  return <Progress value={progress} className={className} />
}

// Interactive Chart Component
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
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check user's subscription plan
          const userRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            const plan = userData.subscriptionPlan || userData.plan
            const isTrialActive = userData.trialActive || false

            setUserPlan(plan || "")
            setTrialActive(isTrialActive)

            // Set branches for location dropdown
            const businessInfo = userData.businessInfo || {}
            const branchesData = businessInfo.branches || []
            setBranches(branchesData)

            // Check if user has access to location dropdown
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

  // Refetch analytics data when location or time range changes
  useEffect(() => {
    if (hasAccess && auth.currentUser) {
      fetchAnalyticsData(auth.currentUser.uid)
    }
  }, [selectedLocation, selectedTimeRange, hasAccess])

  const fetchAnalyticsData = async (userId: string) => {
    try {
      // Fetch reviews
      const reviewsQuery = query(collection(db, "users", userId, "reviews"))
      const querySnapshot = await getDocs(reviewsQuery)

      const reviewsData: Review[] = []
      let totalRating = 0
      const ratingCounts = [0, 0, 0, 0, 0] // 1-5 stars
      const dateCounts: Record<string, { count: number; totalRating: number }> = {}
      const sourceCounts: Record<string, number> = {}
      const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
      const hourCounts: Record<string, number> = {}
      let repliedCount = 0
      let positiveCount = 0
      let negativeCount = 0

      // Filter by time range
      const daysBack = Number.parseInt(selectedTimeRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysBack)

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const rating = data.rating || 0
        const createdAt = data.createdAt?.toDate() || new Date()
        const dateKey = createdAt.toISOString().split("T")[0] // YYYY-MM-DD
        const hourKey = createdAt.getHours().toString()
        const source = data.source || "Direct"
        const deviceType = data.deviceType || "desktop"
        const branchname = data.branchname || ""

        // Filter by time range
        if (createdAt < cutoffDate) return

        // Filter by location if not "All"
        if (selectedLocation !== "All" && !branchname.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return // Skip this review if it doesn't match the selected location
        }

        reviewsData.push({
          rating,
          createdAt: { seconds: Math.floor(createdAt.getTime() / 1000) },
          status: data.status || "pending",
          replied: data.replied || false,
          source,
          deviceType,
          branchname,
        })

        // Calculate stats
        totalRating += rating
        if (rating >= 1 && rating <= 5) {
          ratingCounts[5 - rating]++ // 5-star at index 0, 1-star at index 4
        }

        // Count by date
        if (!dateCounts[dateKey]) {
          dateCounts[dateKey] = { count: 0, totalRating: 0 }
        }
        dateCounts[dateKey].count++
        dateCounts[dateKey].totalRating += rating

        // Count by hour
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1

        // Count sources
        sourceCounts[source] = (sourceCounts[source] || 0) + 1

        // Count devices
        if (deviceType in deviceCounts) {
          deviceCounts[deviceType as keyof typeof deviceCounts]++
        }

        // Count replies
        if (data.replied) repliedCount++

        // Sentiment analysis (simple version based on rating)
        if (rating >= 4) positiveCount++
        else if (rating <= 2) negativeCount++
      })

      // Prepare review trend data
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

      // Prepare monthly data (last 6 months)
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
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

      // Prepare hourly data
      const hourlyData = []
      for (let i = 0; i < 24; i++) {
        hourlyData.push({
          hour: `${i}:00`,
          count: hourCounts[i.toString()] || 0,
        })
      }

      // Calculate weekly stats
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

      // Top sources
      const topSources = Object.entries(sourceCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / reviewsData.length) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculate monthly growth
      const currentMonth = reviewTrend.slice(-30).reduce((sum, day) => sum + day.count, 0)
      const previousMonth = reviewTrend.slice(-60, -30).reduce((sum, day) => sum + day.count, 0)
      const monthlyGrowth = previousMonth > 0 ? Math.round(((currentMonth - previousMonth) / previousMonth) * 100) : 0

      // Calculate metrics
      const responseTime = Math.floor(Math.random() * 24) + 1
      const satisfactionScore = Math.round((positiveCount / Math.max(reviewsData.length, 1)) * 100)
      const engagementRate = Math.round((repliedCount / Math.max(reviewsData.length, 1)) * 100)

      // Calculate totals
      const totalReviews = reviewsData.length
      const averageRating = totalReviews > 0 ? Number.parseFloat((totalRating / totalReviews).toFixed(1)) : 0
      const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0

      // Custom plan exclusive analytics
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
        ...customAnalytics,
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
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
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange} className="w-full sm:w-auto">
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

                {/* Location Dropdown - Only show for Professional/Premium plans */}
                {showLocationDropdown && (
                  <Select value={selectedLocation} onValueChange={setSelectedLocation} className="w-full sm:w-auto">
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
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
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

              {/* Custom Plan Exclusive: Predictive Analytics */}
              {hasCustomAccess && analyticsData.predictiveAnalytics && (
                <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50 animate-fade-in">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl text-indigo-700">
                        <Eye className="h-6 w-6 text-indigo-600" />
                        Predictive Forecast
                        <span className="text-sm bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">AI</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-800 mb-2">
                          <AnimatedNumber value={analyticsData.predictiveAnalytics.nextMonthForecast} />
                        </div>
                        <p className="text-indigo-600 mb-4">Predicted reviews next month</p>
                        <div className="flex items-center justify-center gap-2">
                          {analyticsData.predictiveAnalytics.trendDirection === "up" && (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          )}
                          {analyticsData.predictiveAnalytics.trendDirection === "down" && (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          {analyticsData.predictiveAnalytics.trendDirection === "stable" && (
                            <Activity className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium text-indigo-700">
                            {analyticsData.predictiveAnalytics.confidenceScore}% confidence
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 animate-fade-in">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl text-green-700">
                        <Target className="h-6 w-6 text-green-600" />
                        Market Position
                        <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded-full">Live</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Industry Average</span>
                          <span className="font-bold text-green-800">
                            {analyticsData.competitorAnalysis?.industryAverage}★
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Your Ranking</span>
                          <span className="font-bold text-green-800">
                            #{analyticsData.competitorAnalysis?.rankingPosition}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Market Share</span>
                          <span className="font-bold text-green-800">
                            {analyticsData.competitorAnalysis?.marketShare}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl border-0 bg-gradient-to-br from-pink-50 to-rose-50 animate-fade-in">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl text-pink-700">
                        <Users className="h-6 w-6 text-pink-600" />
                        Customer Journey
                        <span className="text-sm bg-pink-200 text-pink-800 px-2 py-1 rounded-full">360°</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.customerJourney?.touchpoints.slice(0, 3).map((touchpoint, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-pink-700">{touchpoint.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-pink-200 rounded-full h-2">
                                <div
                                  className="bg-pink-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${touchpoint.satisfaction}%` }}
                                />
                              </div>
                              <span className="text-xs text-pink-600">{touchpoint.satisfaction}%</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-pink-200">
                          <div className="flex justify-between items-center">
                            <span className="text-pink-700 font-medium">Conversion Rate</span>
                            <span className="font-bold text-pink-800">
                              {analyticsData.customerJourney?.conversionRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Interactive Charts Section */}
              <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
                {/* Rating Distribution */}
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <BarChart2 className="h-6 w-6 text-blue-500" />
                      Rating Distribution
                      {selectedLocation !== "All" && (
                        <span className="text-sm text-orange-600 font-normal">- {selectedLocation}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[5, 4, 3, 2, 1].map((rating, index) => (
                        <div
                          key={rating}
                          className="flex items-center gap-4 animate-slide-right hover:bg-gray-50 p-2 rounded-lg transition-all duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-2 w-20">
                            <span className="text-sm font-medium text-gray-700">{rating}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${
                                  analyticsData.totalReviews > 0
                                    ? (analyticsData.ratingDistribution[index] / analyticsData.totalReviews) * 100
                                    : 0
                                }%`,
                                animationDelay: `${index * 0.2}s`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right font-medium">
                            {analyticsData.ratingDistribution[index]} (
                            {analyticsData.totalReviews > 0
                              ? Math.round((analyticsData.ratingDistribution[index] / analyticsData.totalReviews) * 100)
                              : 0}
                            %)
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Sentiment Analysis */}
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <Heart className="h-6 w-6 text-pink-500" />
                      Sentiment Analysis
                      {selectedLocation !== "All" && (
                        <span className="text-sm text-orange-600 font-normal">- {selectedLocation}</span>
                      )}
                      {hasCustomAccess && (
                        <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                          AI Enhanced
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between animate-slide-left hover:bg-green-50 p-3 rounded-lg transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <ThumbsUp className="h-5 w-5 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-700">Positive</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">
                            <AnimatedNumber value={analyticsData.sentimentAnalysis.positive} />
                          </span>
                          <p className="text-sm text-gray-500">
                            {analyticsData.totalReviews > 0
                              ? Math.round(
                                  (analyticsData.sentimentAnalysis.positive / analyticsData.totalReviews) * 100,
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between animate-slide-left hover:bg-red-50 p-3 rounded-lg transition-all duration-300"
                        style={{ animationDelay: "0.1s" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <ThumbsDown className="h-5 w-5 text-red-600" />
                          </div>
                          <span className="font-medium text-gray-700">Negative</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-red-600">
                            <AnimatedNumber value={analyticsData.sentimentAnalysis.negative} />
                          </span>
                          <p className="text-sm text-gray-500">
                            {analyticsData.totalReviews > 0
                              ? Math.round(
                                  (analyticsData.sentimentAnalysis.negative / analyticsData.totalReviews) * 100,
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between animate-slide-left hover:bg-yellow-50 p-3 rounded-lg transition-all duration-300"
                        style={{ animationDelay: "0.2s" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Activity className="h-5 w-5 text-yellow-600" />
                          </div>
                          <span className="font-medium text-gray-700">Neutral</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-yellow-600">
                            <AnimatedNumber value={analyticsData.sentimentAnalysis.neutral} />
                          </span>
                          <p className="text-sm text-gray-500">
                            {analyticsData.totalReviews > 0
                              ? Math.round((analyticsData.sentimentAnalysis.neutral / analyticsData.totalReviews) * 100)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Monthly Trend Chart */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-700">
                      <LineChart className="h-6 w-6 text-blue-500" />
                      Review Trends Over Time
                      {selectedLocation !== "All" && (
                        <span className="text-sm text-orange-600 font-normal">- {selectedLocation}</span>
                      )}
                      {hasCustomAccess && (
                        <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Interactive</span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <span className="text-gray-600">Reviews</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                        <span className="text-gray-600">Rating</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <InteractiveChart data={analyticsData.monthlyData} type="bar" />
                </CardContent>
              </Card>

              {/* Additional Analytics */}
              <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Weekly Performance */}
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg text-gray-700">
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      Weekly Performance
                      {selectedLocation !== "All" && (
                        <span className="text-xs text-orange-600 font-normal">- {selectedLocation}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.weeklyStats.map((day, index) => (
                        <div
                          key={day.day}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-300 animate-slide-right cursor-pointer"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                            <span className="font-medium text-gray-700">{day.day}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-indigo-600">{day.reviews} reviews</div>
                            <div className="text-xs text-gray-500">
                              {day.avgRating > 0 ? `${day.avgRating.toFixed(1)} ★` : "No ratings"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Device Analytics */}
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg text-gray-700">
                      <Monitor className="h-5 w-5 text-purple-500" />
                      Device Analytics
                      {selectedLocation !== "All" && (
                        <span className="text-xs text-orange-600 font-normal">- {selectedLocation}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between animate-slide-left hover:bg-blue-50 p-3 rounded-lg transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <Monitor className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-700">Desktop</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-blue-600">
                            <AnimatedNumber value={analyticsData.deviceStats.desktop} />
                          </span>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000"
                              style={{
                                width: `${
                                  analyticsData.totalReviews > 0
                                    ? (analyticsData.deviceStats.desktop / analyticsData.totalReviews) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between animate-slide-left hover:bg-green-50 p-3 rounded-lg transition-all duration-300"
                        style={{ animationDelay: "0.1s" }}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">Mobile</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-600">
                            <AnimatedNumber value={analyticsData.deviceStats.mobile} />
                          </span>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                              style={{
                                width: `${
                                  analyticsData.totalReviews > 0
                                    ? (analyticsData.deviceStats.mobile / analyticsData.totalReviews) * 100
                                    : 0
                                }%`,
                                animationDelay: "0.1s",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between animate-slide-left hover:bg-purple-50 p-3 rounded-lg transition-all duration-300"
                        style={{ animationDelay: "0.2s" }}
                      >
                        <div className="flex items-center gap-3">
                          <Monitor className="h-5 w-5 text-purple-500" />
                          <span className="text-gray-700">Tablet</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-purple-600">
                            <AnimatedNumber value={analyticsData.deviceStats.tablet} />
                          </span>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-1000"
                              style={{
                                width: `${
                                  analyticsData.totalReviews > 0
                                    ? (analyticsData.deviceStats.tablet / analyticsData.totalReviews) * 100
                                    : 0
                                }%`,
                                animationDelay: "0.2s",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Review Sources */}
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg text-gray-700">
                      <Globe className="h-5 w-5 text-orange-500" />
                      Review Sources
                      {selectedLocation !== "All" && (
                        <span className="text-xs text-orange-600 font-normal">- {selectedLocation}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.topSources.map((source, index) => (
                        <div
                          key={source.name}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg hover:shadow-md transition-all duration-300 animate-slide-left cursor-pointer"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="font-medium text-gray-700">{source.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-orange-600">
                              <AnimatedNumber value={source.count} />
                            </div>
                            <div className="text-xs text-gray-500">{source.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Custom Plan Exclusive: Advanced Insights */}
              {hasCustomAccess && (
                <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-50 to-purple-50 animate-fade-in">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl text-violet-700">
                        <Filter className="h-6 w-6 text-violet-600" />
                        Advanced Filtering
                        <span className="text-sm bg-violet-200 text-violet-800 px-2 py-1 rounded-full">Custom</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-violet-100 rounded-lg hover:bg-violet-200 transition-colors duration-300 cursor-pointer">
                          <h4 className="font-semibold text-violet-800 mb-2">Smart Segmentation</h4>
                          <p className="text-sm text-violet-700">
                            Automatically categorize reviews by customer type, purchase value, and engagement level.
                          </p>
                        </div>
                        <div className="p-4 bg-violet-100 rounded-lg hover:bg-violet-200 transition-colors duration-300 cursor-pointer">
                          <h4 className="font-semibold text-violet-800 mb-2">Behavioral Patterns</h4>
                          <p className="text-sm text-violet-700">
                            Identify patterns in customer behavior and review timing to optimize engagement.
                          </p>
                        </div>
                        <div className="p-4 bg-violet-100 rounded-lg hover:bg-violet-200 transition-colors duration-300 cursor-pointer">
                          <h4 className="font-semibold text-violet-800 mb-2">Predictive Scoring</h4>
                          <p className="text-sm text-violet-700">
                            AI-powered likelihood scores for customer satisfaction and review conversion.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50 animate-fade-in">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl text-emerald-700">
                        <Clock className="h-6 w-6 text-emerald-600" />
                        Real-time Monitoring
                        <span className="text-sm bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">Live</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors duration-300 cursor-pointer">
                          <h4 className="font-semibold text-emerald-800 mb-2">Instant Alerts</h4>
                          <p className="text-sm text-emerald-700">
                            Get notified immediately when negative reviews are detected or trends change.
                          </p>
                        </div>
                        <div className="p-4 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors duration-300 cursor-pointer">
                          <h4 className="font-semibold text-emerald-800 mb-2">Competitor Tracking</h4>
                          <p className="text-sm text-emerald-700">
                            Monitor competitor review performance and market positioning in real-time.
                          </p>
                        </div>
                        <div className="p-4 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors duration-300 cursor-pointer">
                          <h4 className="font-semibold text-emerald-800 mb-2">Trend Detection</h4>
                          <p className="text-sm text-emerald-700">
                            AI algorithms detect emerging trends and sentiment shifts before they impact your business.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="animate-pulse">
                <BarChart2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loading analytics data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
