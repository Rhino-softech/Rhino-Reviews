"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Phone,
  MessageSquare,
  Calendar,
  RefreshCw,
  Mail,
  Bell,
  User,
  Building,
  Trash2,
  X,
  Users,
  Star,
  Send,
  Check,
} from "lucide-react"
import { collection, getDocs, query, orderBy, deleteDoc, where, updateDoc, doc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"

interface DemoBooking {
  id: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  businessName: string
  createdAt: any
}

interface ChatMessage {
  id: string
  text: string
  category: string
  timestamp: any
  isBot: boolean
  userId?: string
  businessName?: string
  userEmail?: string
  userPhone?: string
}

interface SupportRequest {
  id: string
  name: string
  email: string
  phone: string
  message: string
  priority: string
  category: string
  timestamp: any
  status: string
  businessName?: string
  replied?: boolean
}

interface ChatFeedback {
  id: string
  rating: number
  feedback: string
  category: string
  timestamp: any
  businessName?: string
}

function DemoBookingChatContent() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>([])
  const [deletingBookings, setDeletingBookings] = useState<Set<string>>(new Set())
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [chatFeedback, setChatFeedback] = useState<ChatFeedback[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState("7")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [showReplyDialog, setShowReplyDialog] = useState(false)

  useEffect(() => {
    fetchDemoBookings()
    fetchChatData()
  }, [])

  useEffect(() => {
    fetchChatData()
  }, [selectedTimeRange, selectedCategory])

  const fetchDemoBookings = async () => {
    try {
      const bookingsRef = collection(db, "demoBookings")
      const q = query(bookingsRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const bookings: DemoBooking[] = []
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        } as DemoBooking)
      })
      setDemoBookings(bookings)
    } catch (error) {
      console.error("Error fetching demo bookings:", error)
    }
  }

  const fetchChatData = async () => {
    try {
      setLoading(true)
      const daysBack = Number.parseInt(selectedTimeRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysBack)

      // Fetch chat messages
      const messagesQuery = query(
        collection(db, "chat_messages"),
        orderBy("timestamp", "desc"),
        where("timestamp", ">=", cutoffDate),
      )
      const messagesSnapshot = await getDocs(messagesQuery)
      const messagesData: ChatMessage[] = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[]

      // Fetch support requests
      const requestsQuery = query(
        collection(db, "support_requests"),
        orderBy("timestamp", "desc"),
        where("timestamp", ">=", cutoffDate),
      )
      const requestsSnapshot = await getDocs(requestsQuery)
      const requestsData: SupportRequest[] = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportRequest[]

      // Fetch chat feedback
      const feedbackQuery = query(
        collection(db, "chat_feedback"),
        orderBy("timestamp", "desc"),
        where("timestamp", ">=", cutoffDate),
      )
      const feedbackSnapshot = await getDocs(feedbackQuery)
      const feedbackData: ChatFeedback[] = feedbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatFeedback[]

      // Filter by category if not "All"
      const filteredMessages =
        selectedCategory === "All" ? messagesData : messagesData.filter((msg) => msg.category === selectedCategory)
      const filteredRequests =
        selectedCategory === "All" ? requestsData : requestsData.filter((req) => req.category === selectedCategory)
      const filteredFeedback =
        selectedCategory === "All" ? feedbackData : feedbackData.filter((fb) => fb.category === selectedCategory)

      setChatMessages(filteredMessages)
      setSupportRequests(filteredRequests)
      setChatFeedback(filteredFeedback)
    } catch (error) {
      console.error("Error fetching chat data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this demo booking?")) {
      return
    }
    try {
      setDeletingBookings((prev) => new Set(prev).add(bookingId))
      await deleteDoc(doc(db, "demoBookings", bookingId))
      setDemoBookings((prev) => prev.filter((booking) => booking.id !== bookingId))
      toast({
        title: "Booking Deleted",
        description: "Demo booking has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingBookings((prev) => {
        const newSet = new Set(prev)
        newSet.delete(bookingId)
        return newSet
      })
    }
  }

  const handleDeleteAllBookings = async () => {
    if (!confirm("Are you sure you want to delete ALL demo bookings? This action cannot be undone.")) {
      return
    }
    try {
      setLoading(true)
      const deletePromises = demoBookings.map((booking) => deleteDoc(doc(db, "demoBookings", booking.id)))
      await Promise.all(deletePromises)
      setDemoBookings([])
      toast({
        title: "All Bookings Deleted",
        description: "All demo bookings have been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting all bookings:", error)
      toast({
        title: "Error",
        description: "Failed to delete all bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = (email: string, subject: string, message: string) => {
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    window.open(emailUrl, "_blank")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleToggleReply = async (requestId: string) => {
    try {
      const requestRef = doc(db, "support_requests", requestId)
      const request = supportRequests.find((r) => r.id === requestId)
      if (request) {
        await updateDoc(requestRef, {
          replied: !request.replied,
          status: !request.replied ? "in-progress" : "pending",
        })
        setSupportRequests(
          supportRequests.map((req) => (req.id === requestId ? { ...req, replied: !req.replied } : req)),
        )
      }
    } catch (error) {
      console.error("Error toggling reply status:", error)
    }
  }

  const handleOpenReplyDialog = (request: SupportRequest) => {
    setSelectedRequest(request)
    setReplyMessage(
      `Dear ${request.name},\n\nThank you for contacting us regarding your ${request.priority} priority support request about "${request.category}".\n\nWe are looking into this matter and will get back to you shortly.\n\nBest regards,\nSupport Team`,
    )
    setShowReplyDialog(true)
  }

  const handleSendReply = () => {
    if (!selectedRequest) return
    handleSendEmail(selectedRequest.email, `Re: ${selectedRequest.category} Support Request`, replyMessage)
    handleToggleReply(selectedRequest.id)
    setShowReplyDialog(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header Section - Fully Responsive */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Demo Booking & Chat Support
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base lg:text-lg">
              Manage customer interactions, demo bookings, and support requests
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                fetchDemoBookings()
                fetchChatData()
              }}
              disabled={loading}
              className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Refresh All</span>
              <span className="xs:hidden">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Analytics Overview - Responsive Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-0 shadow-xl sm:shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 lg:-translate-y-16 lg:translate-x-16"></div>
              <CardContent className="p-3 sm:p-4 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">Total Messages</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{chatMessages.length}</p>
                    <p className="text-blue-200 text-xs mt-1 hidden sm:block">+12% from last week</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-0 shadow-xl sm:shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 lg:-translate-y-16 lg:translate-x-16"></div>
              <CardContent className="p-3 sm:p-4 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-emerald-100 text-xs sm:text-sm font-medium truncate">Support Requests</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{supportRequests.length}</p>
                    <p className="text-emerald-200 text-xs mt-1 hidden sm:block">-5% from last week</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 border-0 shadow-xl sm:shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 lg:-translate-y-16 lg:translate-x-16"></div>
              <CardContent className="p-3 sm:p-4 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-purple-100 text-xs sm:text-sm font-medium truncate">Customer Feedback</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{chatFeedback.length}</p>
                    <p className="text-purple-200 text-xs mt-1 hidden sm:block">+8% from last week</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 border-0 shadow-xl sm:shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 lg:-translate-y-16 lg:translate-x-16"></div>
              <CardContent className="p-3 sm:p-4 md:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-orange-100 text-xs sm:text-sm font-medium truncate">Demo Bookings</p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{demoBookings.length}</p>
                    <p className="text-orange-200 text-xs mt-1 hidden sm:block">+23% from last week</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Chat Support Details - Responsive */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-xl sm:shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <div className="p-2 sm:p-3 md:p-4 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                      Chat Support Management
                    </CardTitle>
                    <CardDescription className="text-purple-100 text-xs sm:text-sm md:text-base lg:text-lg mt-1">
                      Monitor and manage customer support interactions
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="px-3 py-2 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 bg-white/10 text-white backdrop-blur-sm text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <option value="7" className="text-gray-800">
                      Last 7 days
                    </option>
                    <option value="30" className="text-gray-800">
                      Last 30 days
                    </option>
                    <option value="90" className="text-gray-800">
                      Last 90 days
                    </option>
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 bg-white/10 text-white backdrop-blur-sm text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <option value="All" className="text-gray-800">
                      All Categories
                    </option>
                    <option value="Billing & Payments" className="text-gray-800">
                      Billing & Payments
                    </option>
                    <option value="Technical Support" className="text-gray-800">
                      Technical Support
                    </option>
                    <option value="Account Management" className="text-gray-800">
                      Account Management
                    </option>
                    <option value="General Inquiries" className="text-gray-800">
                      General Inquiries
                    </option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
              <Tabs defaultValue="requests" className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg border-2 border-gray-200 rounded-xl sm:rounded-2xl p-1 h-auto">
                  <TabsTrigger
                    value="messages"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl transition-all duration-200 py-2 text-xs sm:text-sm px-1"
                  >
                    <span className="hidden sm:inline">Chat Messages</span>
                    <span className="sm:hidden">Messages</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="requests"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl transition-all duration-200 py-2 text-xs sm:text-sm px-1"
                  >
                    <span className="hidden sm:inline">Support Requests</span>
                    <span className="sm:hidden">Requests</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl transition-all duration-200 py-2 text-xs sm:text-sm px-1"
                  >
                    <span className="hidden sm:inline">Customer Feedback</span>
                    <span className="sm:hidden">Feedback</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="messages">
                  <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 sm:p-4 md:p-6 border-2 border-gray-100 rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 hover:border-blue-200 hover:shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 sm:mb-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              className={
                                message.isBot
                                  ? "bg-blue-100 text-blue-800 border border-blue-200 text-xs"
                                  : "bg-green-100 text-green-800 border border-green-200 text-xs"
                              }
                            >
                              {message.isBot ? "Bot" : "User"}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-xs">
                              {message.category}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                            {message.timestamp?.toDate?.()?.toLocaleString() || "Unknown time"}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm">{message.text}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <p className="text-xs text-gray-500 flex items-center gap-1 sm:gap-2">
                            <Building className="h-3 w-3" />
                            <span className="truncate">Business: {message.businessName}</span>
                          </p>
                          <div className="flex gap-2">
                            {message.userEmail && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleSendEmail(
                                    message.userEmail!,
                                    `Re: ${message.category} Support`,
                                    `Thank you for contacting us regarding: "${message.text}"\n\nWe will get back to you shortly.`,
                                  )
                                }
                                className="text-blue-600 hover:bg-blue-50 border-blue-200 rounded-xl text-xs px-2 py-1"
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Email Response</span>
                                <span className="sm:hidden">Email</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm sm:text-base lg:text-lg">
                          No chat messages found for the selected criteria.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="requests">
                  <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                    <AnimatePresence>
                      {supportRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="p-3 sm:p-4 md:p-6 border-2 border-gray-100 rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-200 group relative hover:border-green-200 hover:shadow-lg"
                        >
                          {request.replied && (
                            <motion.div
                              className="absolute right-3 sm:right-4 md:right-6 top-3 sm:top-4 md:top-6 z-10"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.3,
                              }}
                            >
                              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-1.5 sm:p-2 md:p-3 rounded-full shadow-xl">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                              </div>
                            </motion.div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 sm:mb-4 pr-8 sm:pr-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <Badge className={`${getPriorityColor(request.priority)} text-xs`}>
                                {request.priority.toUpperCase()}
                              </Badge>
                              <Badge className={`${getStatusColor(request.status)} text-xs`}>
                                {request.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="border-gray-300 text-xs">
                                {request.category}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                              {request.timestamp?.toDate?.()?.toLocaleString() || "Unknown time"}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{request.name}</h4>
                          <div className="text-xs text-gray-600 mb-2 space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{request.email}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {request.phone}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                            {request.message}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <p className="text-xs text-gray-500 flex items-center gap-1 sm:gap-2">
                              <Building className="h-3 w-3" />
                              <span className="truncate">Business: {request.businessName}</span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReplyDialog(request)}
                                className="text-blue-600 hover:bg-blue-50 border-blue-200 rounded-xl text-xs px-2 py-1"
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleReply(request.id)}
                                className="text-emerald-600 hover:bg-emerald-50 border-emerald-200 rounded-xl text-xs px-2 py-1"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">
                                  {request.replied ? "Mark as Pending" : "Mark as Replied"}
                                </span>
                                <span className="sm:hidden">{request.replied ? "Pending" : "Replied"}</span>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {supportRequests.length === 0 && (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm sm:text-base lg:text-lg">
                          No support requests found for the selected criteria.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="feedback">
                  <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                    {chatFeedback.map((feedback) => (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 sm:p-4 md:p-6 border-2 border-gray-100 rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 hover:border-yellow-200 hover:shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 sm:mb-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-gray-200">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${
                                    i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline" className="border-gray-300 text-xs">
                              {feedback.category}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                            {feedback.timestamp?.toDate?.()?.toLocaleString() || "Unknown time"}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                          {feedback.feedback || "No written feedback provided"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 sm:gap-2">
                          <Building className="h-3 w-3" />
                          <span className="truncate">Business: {feedback.businessName}</span>
                        </p>
                      </motion.div>
                    ))}
                    {chatFeedback.length === 0 && (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <Star className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm sm:text-base lg:text-lg">No feedback found for the selected criteria.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Bookings Cards - Responsive */}
        {demoBookings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="shadow-xl sm:shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="p-2 sm:p-3 md:p-4 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                        Demo Bookings ({demoBookings.length})
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg mt-1">
                        Latest demo appointments scheduled by customers
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllBookings}
                    className="bg-red-600 hover:bg-red-700 shadow-xl rounded-xl px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Delete All Bookings</span>
                    <span className="sm:hidden">Delete All</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {demoBookings.slice(0, 6).map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all duration-200 group"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={deletingBookings.has(booking.id)}
                        className="absolute top-2 right-2 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                      >
                        {deletingBookings.has(booking.id) ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-600"></div>
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                      <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 pr-6 sm:pr-8">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                          <div className="p-1 sm:p-1.5 md:p-2 bg-blue-200 rounded-lg sm:rounded-xl flex-shrink-0">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg truncate">
                            {booking.name}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-200 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1 rounded-full font-medium whitespace-nowrap">
                          {formatDate(booking.date)}
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 md:space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-gray-600 bg-white p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl">
                          <Bell className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          <span className="font-medium truncate">{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-gray-600 bg-white p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl">
                          <Mail className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="truncate font-medium">{booking.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-gray-600 bg-white p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl">
                          <Phone className="h-3 w-3 text-purple-500 flex-shrink-0" />
                          <span className="font-medium">{booking.phone}</span>
                        </div>
                        {booking.businessName && (
                          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-gray-600 bg-white p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl">
                            <Building className="h-3 w-3 text-orange-500 flex-shrink-0" />
                            <span className="truncate font-medium">{booking.businessName}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {demoBookings.length > 6 && (
                  <div className="mt-4 sm:mt-6 md:mt-8 text-center">
                    <p className="text-gray-500 bg-gray-100 inline-block px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full text-xs sm:text-sm">
                      Showing 6 of {demoBookings.length} total bookings
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Reply Dialog - Responsive */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="w-[95vw] max-w-[700px] rounded-2xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <span className="leading-tight">Reply to Support Request</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base md:text-lg">
              Send a response to {selectedRequest?.name}'s {selectedRequest?.priority} priority request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div>
              <label htmlFor="message" className="text-sm sm:text-base md:text-lg font-semibold">
                Message
              </label>
              <Textarea
                id="message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={8}
                className="mt-2 border-2 border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl text-sm sm:text-base"
                placeholder="Enter your reply message..."
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <Button
              variant="outline"
              onClick={() => setShowReplyDialog(false)}
              className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl border-2 w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto order-1 sm:order-2"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DemoBookingChat() {
  return (
    <SimpleAdminLayout>
      <DemoBookingChatContent />
    </SimpleAdminLayout>
  )
}
