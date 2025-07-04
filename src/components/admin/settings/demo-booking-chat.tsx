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
import { Phone, MessageSquare, Calendar, RefreshCw, Mail, Bell, User, Building, Trash2, X, Users, Star, Send, Check } from 'lucide-react'
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  where,
  updateDoc,
  doc,
} from "firebase/firestore"
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
      <div className="space-y-8 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Demo Booking & Chat Support
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage customer interactions, demo bookings, and support requests
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                fetchDemoBookings()
                fetchChatData()
              }}
              disabled={loading}
              className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh All
            </Button>
          </div>
        </div>

        {/* Enhanced Analytics Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-0 shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Messages</p>
                    <p className="text-3xl font-bold">{chatMessages.length}</p>
                    <p className="text-blue-200 text-xs mt-1">+12% from last week</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-0 shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Support Requests</p>
                    <p className="text-3xl font-bold">{supportRequests.length}</p>
                    <p className="text-emerald-200 text-xs mt-1">-5% from last week</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 border-0 shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Customer Feedback</p>
                    <p className="text-3xl font-bold">{chatFeedback.length}</p>
                    <p className="text-purple-200 text-xs mt-1">+8% from last week</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Star className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 border-0 shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Demo Bookings</p>
                    <p className="text-3xl font-bold">{demoBookings.length}</p>
                    <p className="text-orange-200 text-xs mt-1">+23% from last week</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Calendar className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Chat Support Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold">Chat Support Management</CardTitle>
                    <CardDescription className="text-purple-100 text-lg mt-1">
                      Monitor and manage customer support interactions
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="px-4 py-2 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 bg-white/10 text-white backdrop-blur-sm"
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
                    className="px-4 py-2 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 bg-white/10 text-white backdrop-blur-sm"
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
            <CardContent className="p-8">
              <Tabs defaultValue="requests" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg border-2 border-gray-200 rounded-2xl p-2">
                  <TabsTrigger
                    value="messages"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
                  >
                    Chat Messages
                  </TabsTrigger>
                  <TabsTrigger
                    value="requests"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
                  >
                    Support Requests
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
                  >
                    Customer Feedback
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="messages">
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 border-2 border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 hover:border-blue-200 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={
                                message.isBot
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-green-100 text-green-800 border border-green-200"
                              }
                            >
                              {message.isBot ? "Bot" : "User"}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300">
                              {message.category}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {message.timestamp?.toDate?.()?.toLocaleString() || "Unknown time"}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">{message.text}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Business: {message.businessName}
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
                                className="text-blue-600 hover:bg-blue-50 border-blue-200 rounded-xl"
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Email Response
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No chat messages found for the selected criteria.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="requests">
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    <AnimatePresence>
                      {supportRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="p-6 border-2 border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-200 group relative hover:border-green-200 hover:shadow-lg"
                        >
                          {request.replied && (
                            <motion.div
                              className="absolute right-6 top-6 z-10"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.3,
                              }}
                            >
                              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-full shadow-xl">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            </motion.div>
                          )}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Badge className={getPriorityColor(request.priority)}>
                                {request.priority.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(request.status)}>{request.status.toUpperCase()}</Badge>
                              <Badge variant="outline" className="border-gray-300">
                                {request.category}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {request.timestamp?.toDate?.()?.toLocaleString() || "Unknown time"}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2 text-lg">{request.name}</h4>
                          <p className="text-sm text-gray-600 mb-2 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {request.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {request.phone}
                            </span>
                          </p>
                          <p className="text-gray-700 mb-4 leading-relaxed bg-gray-50 p-4 rounded-xl">
                            {request.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Business: {request.businessName}
                            </p>
                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReplyDialog(request)}
                                className="text-blue-600 hover:bg-blue-50 border-blue-200 rounded-xl"
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleReply(request.id)}
                                className="text-emerald-600 hover:bg-emerald-50 border-emerald-200 rounded-xl"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {request.replied ? "Mark as Pending" : "Mark as Replied"}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {supportRequests.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No support requests found for the selected criteria.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="feedback">
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {chatFeedback.map((feedback) => (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 border-2 border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 hover:border-yellow-200 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex bg-white p-2 rounded-xl border border-gray-200">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline" className="border-gray-300">
                              {feedback.category}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {feedback.timestamp?.toDate?.()?.toLocaleString() || "Unknown time"}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed bg-gray-50 p-4 rounded-xl">
                          {feedback.feedback || "No written feedback provided"}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Business: {feedback.businessName}
                        </p>
                      </motion.div>
                    ))}
                    {chatFeedback.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No feedback found for the selected criteria.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Bookings Cards */}
        {demoBookings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white p-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold">Demo Bookings ({demoBookings.length})</CardTitle>
                      <CardDescription className="text-blue-100 text-lg mt-1">
                        Latest demo appointments scheduled by customers
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllBookings}
                    className="bg-red-600 hover:bg-red-700 shadow-xl rounded-xl px-6 py-3"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Bookings
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {demoBookings.slice(0, 6).map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all duration-200 group"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={deletingBookings.has(booking.id)}
                        className="absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                      >
                        {deletingBookings.has(booking.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-start justify-between mb-4 pr-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-200 rounded-xl">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-800 text-lg">{booking.name}</span>
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-200 px-3 py-1 rounded-full font-medium">
                          {formatDate(booking.date)}
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 bg-white p-3 rounded-xl">
                          <Bell className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 bg-white p-3 rounded-xl">
                          <Mail className="h-4 w-4 text-green-500" />
                          <span className="truncate font-medium">{booking.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 bg-white p-3 rounded-xl">
                          <Phone className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{booking.phone}</span>
                        </div>
                        {booking.businessName && (
                          <div className="flex items-center gap-3 text-gray-600 bg-white p-3 rounded-xl">
                            <Building className="h-4 w-4 text-orange-500" />
                            <span className="truncate font-medium">{booking.businessName}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {demoBookings.length > 6 && (
                  <div className="mt-8 text-center">
                    <p className="text-gray-500 bg-gray-100 inline-block px-6 py-3 rounded-full">
                      Showing 6 of {demoBookings.length} total bookings
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="sm:max-w-[700px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              Reply to Support Request
            </DialogTitle>
            <DialogDescription className="text-lg">
              Send a response to {selectedRequest?.name}'s {selectedRequest?.priority} priority request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label htmlFor="message" className="text-lg font-semibold">
                Message
              </label>
              <Textarea
                id="message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={10}
                className="mt-3 border-2 border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl text-base"
                placeholder="Enter your reply message..."
              />
            </div>
          </div>
          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => setShowReplyDialog(false)}
              className="px-6 py-3 rounded-xl border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Send className="h-4 w-4 mr-2" />
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
