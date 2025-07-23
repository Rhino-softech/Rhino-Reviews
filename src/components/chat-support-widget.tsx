"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, Send, User, Bot, Star, ThumbsUp, MessageCircle, CreditCard, Settings, UserCircle, HelpCircle, Lightbulb, Clock, CheckCircle } from 'lucide-react'
import { db } from "../firebase/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"

interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

interface IssueCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  responses: string[]
  followUpQuestions: string[]
  detailedInfo: string
}

const issueCategories: IssueCategory[] = [
  {
    id: "billing",
    title: "Billing & Payments",
    description: "Questions about invoices, payments, subscription plans, or refunds",
    icon: <CreditCard className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    detailedInfo:
      "I can help you with billing inquiries, payment issues, subscription management, invoice questions, and refund requests. Our billing system is designed to be transparent and user-friendly.",
    responses: [
      "I understand you have billing concerns. Let me help you resolve this quickly and efficiently.",
      "Billing issues can be frustrating. I'm here to guide you through any payment or subscription questions you might have.",
      "I'm well-equipped to handle all types of billing inquiries. What specific aspect would you like to discuss?",
      "Let's get your billing sorted out. I have access to comprehensive billing support resources.",
    ],
    followUpQuestions: [
      "Are you experiencing issues with a recent payment or transaction?",
      "Do you need help understanding charges on your invoice or statement?",
      "Would you like assistance with updating your payment method or billing information?",
      "Are you interested in changing your subscription plan or billing cycle?",
      "Do you have questions about refunds or cancellation policies?",
    ],
  },
  {
    id: "technical",
    title: "Technical Support",
    description: "Help with features, bugs, performance issues, or technical difficulties",
    icon: <Settings className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    detailedInfo:
      "Our technical support covers feature troubleshooting, bug reports, performance optimization, integration issues, and general technical guidance. I can help diagnose problems and provide step-by-step solutions.",
    responses: [
      "Technical issues can be challenging, but I'm here to help you troubleshoot and find solutions.",
      "Let's work together to resolve your technical concern. I'll guide you through the process step by step.",
      "I have extensive knowledge of our platform's technical aspects. What specific issue are you encountering?",
      "Technical problems can disrupt your workflow. Let me help you get back on track quickly.",
    ],
    followUpQuestions: [
      "Which specific feature or functionality are you having trouble with?",
      "When did you first notice this technical issue occurring?",
      "Are you receiving any error messages or codes that I can help interpret?",
      "Have you tried any troubleshooting steps already, such as refreshing or restarting?",
      "Is this issue affecting multiple users or just your account?",
    ],
  },
  {
    id: "account",
    title: "Account Management",
    description: "Profile settings, password reset, login issues, or account access",
    icon: <UserCircle className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
    detailedInfo:
      "Account management support includes login assistance, password resets, profile updates, security settings, two-factor authentication, and account access issues. Your account security and accessibility are our priorities.",
    responses: [
      "Account management is crucial for your security and user experience. I'm here to help with any account-related concerns.",
      "I can assist you with various account settings and access issues. Let's get your account properly configured.",
      "Account security and accessibility are important. What specific account management help do you need?",
      "Let's ensure your account is set up correctly and securely. I'm here to guide you through any changes needed.",
    ],
    followUpQuestions: [
      "Are you unable to log into your account or experiencing authentication issues?",
      "Do you need to update your profile information, email, or contact details?",
      "Would you like help with password reset or security settings?",
      "Are you having trouble with two-factor authentication or security verification?",
      "Do you need assistance with account permissions or user role management?",
    ],
  },
  {
    id: "general",
    title: "General Inquiries",
    description: "Questions about services, pricing, features, or how things work",
    icon: <HelpCircle className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600",
    detailedInfo:
      "General inquiries cover service information, pricing details, feature explanations, getting started guides, best practices, and comparisons. I'm here to provide comprehensive information about our platform.",
    responses: [
      "I'm happy to answer your questions about our services and help you understand how everything works.",
      "General inquiries are always welcome. I have comprehensive information about our platform and services.",
      "Let me provide you with detailed information about whatever you'd like to know about our services.",
      "I'm here to help you understand our platform better. What specific information are you looking for?",
    ],
    followUpQuestions: [
      "Are you interested in learning about specific features or capabilities of our platform?",
      "Would you like detailed pricing information or plan comparisons?",
      "Do you need help getting started or understanding how to use certain features?",
      "Are you comparing our solution with other alternatives in the market?",
      "Would you like to know about best practices or optimization tips?",
    ],
  },
  {
    id: "feedback",
    title: "Feedback & Suggestions",
    description: "Share thoughts, suggestions, report issues, or provide testimonials",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-pink-500 to-pink-600",
    detailedInfo:
      "Your feedback drives our continuous improvement. Whether it's feature requests, bug reports, user experience feedback, or suggestions for enhancement, every piece of input is valuable to us.",
    responses: [
      "Your feedback is incredibly valuable to us. Thank you for taking the time to share your thoughts and help us improve.",
      "We appreciate all feedback as it helps us enhance our service and user experience. What would you like to share?",
      "I'd love to hear your thoughts, suggestions, or any issues you've encountered. Your input shapes our development.",
      "Feedback from users like you is essential for our growth. Please share whatever is on your mind.",
    ],
    followUpQuestions: [
      "What aspect of our service or platform would you like to provide feedback on?",
      "Do you have suggestions for new features or improvements to existing ones?",
      "Have you encountered any bugs or issues that you'd like to report?",
      "Is there something about the user experience that could be enhanced?",
      "Would you like to share a positive experience or testimonial about our service?",
    ],
  },
]

interface ChatSupportWidgetProps {
  isOpen: boolean
  onClose: () => void
}

interface ThemeSettings {
  chatWidgetColor: string
  textColor: string
}

const defaultTheme: ThemeSettings = {
  chatWidgetColor: "#ea580c",
  textColor: "#111827",
}

export default function ChatSupportWidget({ isOpen, onClose }: ChatSupportWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedIssue, setSelectedIssue] = useState<IssueCategory | null>(null)
  const [conversationStep, setConversationStep] = useState<"landing" | "issues" | "interaction" | "form">("landing")
  const [userInput, setUserInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    priority: "medium",
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && conversationStep === "landing") {
      // Reset everything when opening
      setMessages([])
      setSelectedIssue(null)
      setConversationStep("landing")
      setInteractionCount(0)
      setShowForm(false)
      setFormSubmitted(false)
      setShowFeedback(false)
    }
  }, [isOpen])

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const themeDoc = await getDoc(doc(db, "settings", "homeTheme"))
        if (themeDoc.exists()) {
          setTheme((prev) => ({ ...prev, ...themeDoc.data() }))
        }
      } catch (error) {
        console.error("Error loading theme:", error)
      }
    }
    loadTheme()
  }, [])

  const startChat = () => {
    setConversationStep("issues")
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      text: "Hi! I'm here to help you with any questions or concerns. Please select the category that best describes what you need assistance with, and I'll provide you with personalized support.",
      isBot: true,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  const handleIssueSelect = (issue: IssueCategory) => {
    setSelectedIssue(issue)
    setConversationStep("interaction")

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: issue.title,
      isBot: false,
      timestamp: new Date(),
    }

    const detailMessage: ChatMessage = {
      id: `bot-detail-${Date.now()}`,
      text: issue.detailedInfo,
      isBot: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, detailMessage])

    // Add initial response after a delay
    setTimeout(() => {
      const randomResponse = issue.responses[Math.floor(Math.random() * issue.responses.length)]
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: randomResponse,
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

      // Ask a follow-up question
      setTimeout(() => {
        const followUpQuestion = issue.followUpQuestions[Math.floor(Math.random() * issue.followUpQuestions.length)]
        const followUpMessage: ChatMessage = {
          id: `bot-followup-${Date.now()}`,
          text: followUpQuestion,
          isBot: true,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, followUpMessage])
      }, 1500)
    }, 1000)
  }

  const handleUserMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: userInput.trim(),
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setUserInput("")
    setIsTyping(true)
    setInteractionCount((prev) => prev + 1)

    // Save message to Firebase
    try {
      await addDoc(collection(db, "chat_messages"), {
        text: userInput.trim(),
        category: selectedIssue?.title || "General",
        timestamp: serverTimestamp(),
        isBot: false,
      })
    } catch (error) {
      console.error("Error saving message:", error)
    }

    // Simulate bot response
    setTimeout(
      () => {
        setIsTyping(false)

        const responses = [
          "I understand your concern completely. Let me provide you with some guidance on this matter.",
          "That's a great point you've raised. Based on what you've shared, here's what I can suggest...",
          "Thank you for providing those details. This helps me understand your situation better.",
          "I see exactly what you mean. Let me walk you through some options that might help.",
          "That's definitely something we can work on together. Here's my recommendation...",
          "I appreciate you sharing that information. Based on your specific needs, here's what I think would work best...",
        ]

        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: responses[Math.floor(Math.random() * responses.length)],
          isBot: true,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])

        // After sufficient interaction, offer form submission
        if (interactionCount >= 2) {
          setTimeout(() => {
            const formOfferMessage: ChatMessage = {
              id: `bot-form-offer-${Date.now()}`,
              text: "I want to make sure we address your concern thoroughly and provide you with the best possible support. Would you like to submit a detailed support request so our specialized team can give you personalized assistance and follow up directly?",
              isBot: true,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, formOfferMessage])
            setShowForm(true)
          }, 2000)
        } else {
          // Continue conversation with more questions
          setTimeout(() => {
            if (selectedIssue) {
              const remainingQuestions = selectedIssue.followUpQuestions.filter(
                (_, index) => index !== 0, // Avoid repeating the first question
              )
              const nextQuestion = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)]
              const questionMessage: ChatMessage = {
                id: `bot-question-${Date.now()}`,
                text: nextQuestion,
                isBot: true,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, questionMessage])
            }
          }, 1500)
        }
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setShowForm(false)

    // Save form data to Firebase
    try {
      await addDoc(collection(db, "support_requests"), {
        ...formData,
        category: selectedIssue?.title || "General",
        timestamp: serverTimestamp(),
        status: "pending",
      })
    } catch (error) {
      console.error("Error saving support request:", error)
    }

    const confirmationMessage: ChatMessage = {
      id: `bot-confirmation-${Date.now()}`,
      text: `Perfect! Thank you, ${formData.name}. Your ${formData.priority} priority support request has been submitted successfully. Our team will review your case and get back to you at ${formData.email} within 24 hours. You'll receive a confirmation email shortly with your ticket number.`,
      isBot: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, confirmationMessage])

    // Show feedback after form submission
    setTimeout(() => {
      setShowFeedback(true)
    }, 3000)

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
      priority: "medium",
    })
  }

  const submitFeedback = async () => {
    // Save feedback to Firebase
    try {
      await addDoc(collection(db, "chat_feedback"), {
        rating: feedbackRating,
        feedback: feedbackText,
        category: selectedIssue?.title || "General",
        timestamp: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error saving feedback:", error)
    }

    const feedbackMessage: ChatMessage = {
      id: `feedback-${Date.now()}`,
      text: `Thank you so much for your ${feedbackRating}-star rating${feedbackText ? " and detailed feedback" : ""}! Your input helps us continuously improve our support experience. Is there anything else I can help you with today?`,
      isBot: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, feedbackMessage])
    setShowFeedback(false)
    setFeedbackRating(0)
    setFeedbackText("")
  }

  const resetChat = () => {
    setMessages([])
    setSelectedIssue(null)
    setConversationStep("landing")
    setInteractionCount(0)
    setShowForm(false)
    setFormSubmitted(false)
    setShowFeedback(false)
    setFeedbackRating(0)
    setFeedbackText("")
  }

  const goBack = () => {
    if (conversationStep === "interaction") {
      setConversationStep("issues")
      setSelectedIssue(null)
      setInteractionCount(0)
      setShowForm(false)
    } else if (conversationStep === "issues") {
      setConversationStep("landing")
      setMessages([])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="absolute bottom-full right-0 mb-4 w-[420px] h-[650px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div
            className="text-white p-4"
            style={{ background: `linear-gradient(to right, ${theme.chatWidgetColor}, ${theme.chatWidgetColor}cc)` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {conversationStep !== "landing" && (
                  <button onClick={goBack} className="text-white hover:bg-white/20 p-1 rounded transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.chatWidgetColor }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Support Chat</h3>
                    <div className="flex items-center gap-1 text-sm text-white/80">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Online • Ready to help</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto h-[500px]">
            {/* Landing Page */}
            {conversationStep === "landing" && (
              <div className="p-6 h-full flex flex-col">
                <div className="text-center mb-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: `linear-gradient(to right, ${theme.chatWidgetColor}, ${theme.chatWidgetColor}cc)` }}
                  >
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: theme.textColor }}>
                    Welcome to Support
                  </h2>
                  <p className="leading-relaxed" style={{ color: theme.textColor }}>
                    Get instant help with your questions and concerns. Our intelligent support system is designed to
                    provide you with quick, accurate, and personalized assistance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <Clock className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-900 text-sm">Quick Response</h4>
                    <p className="text-blue-700 text-xs">Get answers in seconds</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-900 text-sm">Expert Help</h4>
                    <p className="text-green-700 text-xs">Professional guidance</p>
                  </div>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={startChat}
                    className="w-full text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    style={{ background: `linear-gradient(to right, ${theme.chatWidgetColor}, ${theme.chatWidgetColor}cc)` }}
                  >
                    Start Conversation
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-3" style={{ color: theme.textColor }}>
                    Average response time: Under 30 seconds
                  </p>
                </div>
              </div>
            )}

            {/* Issue Categories */}
            {conversationStep === "issues" && (
              <div className="p-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 mb-4 ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    {message.isBot && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `linear-gradient(to right, ${theme.chatWidgetColor}, ${theme.chatWidgetColor}cc)` }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        message.isBot
                          ? "bg-gray-100"
                          : "text-white"
                      }`}
                      style={{
                        backgroundColor: message.isBot ? undefined : theme.chatWidgetColor,
                        color: message.isBot ? theme.textColor : "white",
                      }}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </motion.div>
                ))}

                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-sm mb-3" style={{ color: theme.textColor }}>
                    Choose your support category:
                  </h4>
                  {issueCategories.map((issue) => (
                    <motion.button
                      key={issue.id}
                      onClick={() => handleIssueSelect(issue)}
                      className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${issue.color} rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          {issue.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1" style={{ color: theme.textColor }}>
                            {issue.title}
                          </h4>
                          <p className="text-sm leading-relaxed" style={{ color: theme.textColor }}>
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Interaction */}
            {conversationStep === "interaction" && (
              <div className="p-4 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.isBot ? "justify-start" : "justify-end"}`}
                    >
                      {message.isBot && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `linear-gradient(to right, ${theme.chatWidgetColor}, ${theme.chatWidgetColor}cc)` }}
                        >
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          message.isBot
                            ? "bg-gray-100"
                            : "text-white"
                        }`}
                        style={{
                          backgroundColor: message.isBot ? undefined : theme.chatWidgetColor,
                          color: message.isBot ? theme.textColor : "white",
                        }}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.isBot ? "text-gray-500" : "text-white/70"}`} style={{ color: message.isBot ? theme.textColor : "white" }}>
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!message.isBot && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `linear-gradient(to right, ${theme.chatWidgetColor}, ${theme.chatWidgetColor}cc)` }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-2xl">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Support Form */}
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200"
                    >
                      <h4 className="font-semibold mb-3 text-center" style={{ color: theme.textColor }}>
                        Submit Detailed Support Request
                      </h4>
                      <form onSubmit={handleFormSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Full Name *"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email Address *"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                            required
                          />
                        </div>
                        <input
                          type="tel"
                          placeholder="Phone Number (Optional)"
                          value={formData.phone}
                          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                        />
                        <textarea
                          placeholder="Please describe your issue in detail... *"
                          value={formData.message}
                          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-400"
                          rows={4}
                          required
                        />
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                          >
                            Submit Request
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                            style={{ color: theme.textColor }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Feedback Section */}
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200"
                    >
                      <h4 className="font-semibold mb-3 text-center" style={{ color: theme.textColor }}>
                        How was your experience?
                      </h4>
                      <div className="flex justify-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className="p-1"
                            whileTap={{ scale: 1.2 }}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= feedbackRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-300"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Share your feedback (optional)..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none mb-3"
                        rows={2}
                      />
                      <button
                        onClick={submitFeedback}
                        disabled={feedbackRating === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2 inline" />
                        Submit Feedback
                      </button>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          {conversationStep === "interaction" && !showForm && !formSubmitted && (
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleUserMessage} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: theme.chatWidgetColor }}
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isTyping}
                  className="text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ background: `linear-gradient(to right, ${theme.chatWidgetColor}, ${theme.chatWidgetColor}cc)` }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500" style={{ color: theme.textColor }}>Press Enter to send</p>
                <button onClick={resetChat} className="text-xs hover:text-orange-700 transition-colors" style={{ color: theme.chatWidgetColor }}>
                  New Chat
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
