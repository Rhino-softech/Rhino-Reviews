"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Check,
  FolderOpen,
  MailOpen,
  Star,
  Trash2,
  MapPin,
  CreditCard,
  Globe,
  Sparkles,
  TrendingUp,
  Calendar,
  AlertCircle,
  MessageSquare,
  Send,
  Plus,
  Edit,
  Copy,
  Crown,
  Users,
  Clock,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import ConfirmDialog from "@/components/confirm-dialog"
import type { Review } from "@/lib/types"
import { collection, query, getDocs, doc, deleteDoc, updateDoc, orderBy, getDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/firebase"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { onAuthStateChanged } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

const GOOGLE_API_KEY = "AIzaSyA-CiYkNslFVHpkDd-jlJH9LOhabb1yLLw"

// Enhanced template system with extensive negative and neutral review templates
const CUSTOM_PLAN_TEMPLATES = {
  whatsapp: {
    positive: [
      {
        id: "grateful-professional",
        name: "Grateful & Professional",
        icon: "🌟",
        template: `Hi {customerName}! 🌟 Thank you so much for your {rating}-star review of {businessName}! We're thrilled you had a great experience. Your feedback means the world to us! 😊`,
      },
      {
        id: "personal-warm",
        name: "Personal & Warm",
        icon: "✨",
        template: `Dear {customerName}, your kind words absolutely made our day! ✨ We're so grateful for customers like you who make what we do at {businessName} worthwhile. Thank you for the {rating}-star review! 🙏`,
      },
      {
        id: "business-growth",
        name: "Business Growth",
        icon: "🚀",
        template: `Hi {customerName}! 🚀 Reviews like yours help {businessName} grow and serve our community better. Thank you for being part of our journey with your amazing {rating}-star review!`,
      },
    ],
    negative: [
      {
        id: "sincere-apology-solution",
        name: "Sincere Apology & Solution",
        icon: "🤝",
        template: `Dear {customerName}, we sincerely apologize for falling short of your expectations at {businessName}. 🙏 Your experience matters deeply to us. Could we schedule a call this week to discuss how we can make this right? We're committed to turning this around.`,
      },
      {
        id: "empathetic-understanding",
        name: "Empathetic Understanding",
        icon: "💙",
        template: `Hi {customerName}, thank you for sharing your honest feedback about {businessName}. 💙 We completely understand your frustration, and we take full responsibility. We'd love the opportunity to show you the improvements we've made. Would you consider giving us another chance?`,
      },
      {
        id: "immediate-action-response",
        name: "Immediate Action Response",
        icon: "⚡",
        template: `{customerName}, we're taking immediate action to address your concerns about {businessName}. ⚡ Our management team will personally contact you within 24 hours. Your feedback is helping us become better, and we're grateful for your patience.`,
      },
      {
        id: "personal-accountability",
        name: "Personal Accountability",
        icon: "🛡️",
        template: `Dear {customerName}, I personally want to apologize for your disappointing experience with {businessName}. 🛡️ As someone who cares deeply about our service quality, I'd like to speak with you directly to understand what went wrong and how we can improve.`,
      },
      {
        id: "learning-growth-mindset",
        name: "Learning & Growth Mindset",
        icon: "📚",
        template: `Hi {customerName}, thank you for this valuable feedback about {businessName}. 📚 Every review helps us grow and improve. We've already started implementing changes based on your input. Could we update you on our progress in a few weeks?`,
      },
      {
        id: "service-recovery-champion",
        name: "Service Recovery Champion",
        icon: "🏆",
        template: `{customerName}, we believe every customer deserves an exceptional experience at {businessName}. 🏆 We clearly missed the mark with you, and we'd like to make it right. Our service recovery team will reach out to ensure your next experience exceeds expectations.`,
      },
      {
        id: "transparent-communication",
        name: "Transparent Communication",
        icon: "💬",
        template: `Dear {customerName}, we appreciate your transparency about your experience with {businessName}. 💬 We believe in open communication and would love to discuss your concerns in detail. When would be a good time for a brief conversation?`,
      },
      {
        id: "community-focused-response",
        name: "Community Focused Response",
        icon: "🌍",
        template: `Hi {customerName}, as a valued member of our {businessName} community, your feedback is incredibly important to us. 🌍 We're committed to serving our community better, and your experience shows us where we need to improve. Thank you for helping us grow.`,
      },
      {
        id: "quality-commitment",
        name: "Quality Commitment",
        icon: "⭐",
        template: `{customerName}, maintaining high quality at {businessName} is our top priority, and we clearly didn't meet that standard for you. ⭐ We're reviewing our processes to ensure this doesn't happen again. Could we invite you back to experience our improvements?`,
      },
      {
        id: "partnership-approach",
        name: "Partnership Approach",
        icon: "🤝",
        template: `Dear {customerName}, we see you as a partner in helping {businessName} improve. 🤝 Your feedback is a gift that helps us serve everyone better. We'd love to work together to turn your experience around. Are you open to a conversation?`,
      },
    ],
    neutral: [
      {
        id: "appreciation-improvement",
        name: "Appreciation & Improvement",
        icon: "💪",
        template: `Hi {customerName}, thank you for your {rating}-star review of {businessName}. 💪 We appreciate your honest feedback and would love to know how we can elevate your experience to a 5-star level. What would make the biggest difference for you?`,
      },
      {
        id: "engagement-building",
        name: "Engagement Building",
        icon: "🌟",
        template: `Dear {customerName}, thanks for taking time to review {businessName}! 🌟 We'd love to hear more about your experience and how we can make it even better next time. Your insights help us improve for everyone.`,
      },
      {
        id: "curiosity-driven",
        name: "Curiosity Driven",
        icon: "🤔",
        template: `Hi {customerName}, we're curious about your {rating}-star experience with {businessName}. 🤔 What aspects did you enjoy, and what could we have done differently? Your detailed feedback helps us understand how to serve you better.`,
      },
      {
        id: "potential-focused",
        name: "Potential Focused",
        icon: "🚀",
        template: `{customerName}, we see great potential in improving your experience with {businessName}! 🚀 Your {rating}-star rating tells us we're on the right track but have room to grow. What would turn this into a 5-star experience for you?`,
      },
      {
        id: "collaborative-improvement",
        name: "Collaborative Improvement",
        icon: "🤝",
        template: `Dear {customerName}, your {rating}-star review of {businessName} is valuable feedback for us. 🤝 We'd love to collaborate with you to understand what would make your next visit exceptional. Could we schedule a quick chat?`,
      },
      {
        id: "growth-mindset",
        name: "Growth Mindset",
        icon: "📈",
        template: `Hi {customerName}, thank you for your honest {rating}-star review of {businessName}. 📈 We're always growing and improving, and your feedback is essential to that process. What specific changes would enhance your experience?`,
      },
      {
        id: "service-enhancement",
        name: "Service Enhancement",
        icon: "✨",
        template: `{customerName}, we're committed to enhancing every aspect of the {businessName} experience. ✨ Your {rating}-star review shows us we're making progress but aren't quite there yet. What would make the biggest positive impact for you?`,
      },
      {
        id: "customer-centric",
        name: "Customer Centric",
        icon: "❤️",
        template: `Dear {customerName}, putting our customers at the center of everything we do at {businessName} is our mission. ❤️ Your {rating}-star review helps us understand where we can better serve you. What matters most to you in your experience with us?`,
      },
    ],
    followup: [
      {
        id: "thank-you-followup",
        name: "Thank You Follow-up",
        icon: "😊",
        template: `Hi {customerName}, thank you again for your recent review of {businessName}. 😊 We wanted to follow up and see if there's anything else we can help you with.`,
      },
      {
        id: "service-recovery",
        name: "Service Recovery",
        icon: "🤝",
        template: `Hi {customerName}, we hope our recent conversation addressed your concerns about {businessName}. 🤝 We'd love to earn back your trust and welcome you back soon.`,
      },
      {
        id: "improvement-update",
        name: "Improvement Update",
        icon: "📈",
        template: `Hello {customerName}! We wanted to update you on the improvements we've made at {businessName} based on your feedback. 📈 We'd love to show you the positive changes in person!`,
      },
    ],
  },
  email: {
    positive: [
      {
        id: "grateful-professional",
        name: "Grateful & Professional",
        icon: "🌟",
        template: `Dear {customerName},\n\nThank you so much for your wonderful {rating}-star review! We're absolutely delighted that you had such a positive experience with {businessName}.\n\nYour kind words motivate our entire team to continue delivering exceptional service. We look forward to serving you again soon!\n\nWarm regards,\n{businessName} Team`,
      },
      {
        id: "detailed-appreciation",
        name: "Detailed Appreciation",
        icon: "💎",
        template: `Dear {customerName},\n\nWe are truly grateful for your {rating}-star review of {businessName}. Your positive feedback not only brightens our day but also helps other customers discover our services.\n\nWe're committed to maintaining the high standards that impressed you, and we can't wait to welcome you back.\n\nWith sincere appreciation,\n{businessName} Team`,
      },
    ],
    negative: [
      {
        id: "comprehensive-apology-solution",
        name: "Comprehensive Apology & Solution",
        icon: "🤝",
        template: `Dear {customerName},\n\nThank you for taking the time to share your feedback about your recent experience with {businessName}. We sincerely apologize that we didn't meet your expectations.\n\nYour concerns are incredibly important to us, and we'd like the opportunity to make things right. We've already begun reviewing our processes to prevent similar issues in the future.\n\nWould you be available for a brief call this week so we can discuss how we can improve and potentially resolve any outstanding concerns? We're committed to turning your experience around.\n\nWith sincere apologies and commitment to improvement,\n{businessName} Management Team`,
      },
      {
        id: "empathetic-personal-response",
        name: "Empathetic Personal Response",
        icon: "💙",
        template: `Dear {customerName},\n\nI want to personally apologize for your disappointing experience with {businessName}. Reading your review, I can understand your frustration, and I take full responsibility for not meeting the standards you rightfully expected.\n\nEvery customer deserves exceptional service, and we clearly fell short. I would very much like to speak with you personally to understand exactly what went wrong and how we can make it right.\n\nPlease reply to this email or call me directly. I'm committed to ensuring your next experience with us exceeds your expectations.\n\nSincerely,\n[Your Name]\n{businessName} Management`,
      },
      {
        id: "action-oriented-recovery",
        name: "Action-Oriented Recovery",
        icon: "⚡",
        template: `Dear {customerName},\n\nThank you for bringing your concerns about {businessName} to our attention. We take all feedback seriously and are already implementing changes based on your experience.\n\nHere's what we're doing immediately:\n• Reviewing our service protocols\n• Additional staff training\n• Enhanced quality control measures\n\nOur management team would like to speak with you directly to ensure we address your specific concerns. Please reply to this email or call us at your convenience.\n\nWe're committed to earning back your trust and providing you with the exceptional service you deserve.\n\nSincerely,\n{businessName} Management Team`,
      },
      {
        id: "learning-partnership-approach",
        name: "Learning Partnership Approach",
        icon: "📚",
        template: `Dear {customerName},\n\nThank you for your honest and valuable feedback about {businessName}. While we're disappointed that we didn't meet your expectations, we're grateful for the opportunity to learn and improve.\n\nYour experience highlights areas where we can do better, and we're already taking steps to address these issues. We believe that every piece of feedback makes us stronger and helps us serve our community better.\n\nWe'd love to keep you updated on our improvements and invite you back to experience the positive changes we're making. Would you be open to a follow-up conversation in a few weeks?\n\nThank you for helping us grow.\n\nWith appreciation,\n{businessName} Team`,
      },
      {
        id: "transparent-commitment",
        name: "Transparent Commitment",
        icon: "🛡️",
        template: `Dear {customerName},\n\nWe appreciate your transparency in sharing your experience with {businessName}. Your feedback is a valuable gift that helps us understand where we need to improve.\n\nWe believe in open, honest communication, and we want to be equally transparent with you about the steps we're taking to address your concerns:\n\n• Immediate review of the situation\n• Staff retraining where necessary\n• Process improvements to prevent recurrence\n• Follow-up to ensure lasting change\n\nWe'd welcome the opportunity to discuss your experience in more detail and show you the improvements we're making. When would be a convenient time for a conversation?\n\nWith commitment to excellence,\n{businessName} Leadership Team`,
      },
      {
        id: "community-responsibility",
        name: "Community Responsibility",
        icon: "🌍",
        template: `Dear {customerName},\n\nAs a valued member of our {businessName} community, your feedback carries special weight with us. We're disappointed that we didn't provide you with the experience you deserved.\n\nWe take our responsibility to our community seriously, and your review reminds us of the trust you place in us every time you choose our services. We're committed to honoring that trust through continuous improvement.\n\nWe'd be grateful for the opportunity to discuss your experience and show you the positive changes we're implementing. Your insights will help us serve not just you, but our entire community better.\n\nThank you for caring enough to share your feedback.\n\nWith community commitment,\n{businessName} Team`,
      },
      {
        id: "quality-excellence-focus",
        name: "Quality Excellence Focus",
        icon: "⭐",
        template: `Dear {customerName},\n\nMaintaining excellence in every aspect of {businessName} is our unwavering commitment, and we clearly didn't achieve that standard in your experience. We're genuinely sorry for this shortfall.\n\nExcellence isn't just our goal—it's our promise to every customer. Your feedback shows us exactly where we need to focus our improvement efforts. We're already implementing enhanced quality measures to ensure this doesn't happen again.\n\nWe'd be honored if you would give us another opportunity to demonstrate the level of service that reflects our true commitment to excellence. Could we arrange a time to discuss how we can make this right?\n\nWith renewed commitment to quality,\n{businessName} Quality Team`,
      },
    ],
    neutral: [
      {
        id: "engagement-improvement-focus",
        name: "Engagement & Improvement Focus",
        icon: "💪",
        template: `Dear {customerName},\n\nThank you for your {rating}-star review of {businessName}. We appreciate you taking the time to share your experience with us.\n\nWe're always looking to improve our service and would love to understand what would elevate your experience to a 5-star level. Your insights are invaluable in helping us serve you and our community better.\n\nIf you have any specific suggestions or if there's anything we could have done differently, we'd love to hear from you. We're committed to continuous improvement and your feedback guides that journey.\n\nThank you for choosing {businessName}.\n\nBest regards,\n{businessName} Team`,
      },
      {
        id: "curiosity-driven-engagement",
        name: "Curiosity-Driven Engagement",
        icon: "🤔",
        template: `Dear {customerName},\n\nThank you for your {rating}-star review of {businessName}. We're curious to learn more about your experience and how we can make it even better.\n\nYour rating suggests we did some things right, but we'd love to understand what we could improve. What aspects of your experience stood out positively, and what areas could we enhance?\n\nWe believe every customer interaction is an opportunity to learn and grow. Your detailed feedback would help us understand how to serve you and others even better.\n\nWe'd welcome a brief conversation about your experience if you're open to it.\n\nWith curiosity and commitment to improvement,\n{businessName} Team`,
      },
      {
        id: "potential-partnership",
        name: "Potential Partnership",
        icon: "🚀",
        template: `Dear {customerName},\n\nThank you for your {rating}-star review of {businessName}. We see tremendous potential in enhancing your experience with us, and we'd love your partnership in making that happen.\n\nYour feedback tells us we're on the right track but have room to grow. We're excited about the possibility of turning your next visit into a 5-star experience.\n\nWhat would make the biggest positive difference for you? We're committed to continuous improvement and would value your specific insights on how we can better serve you.\n\nThank you for being part of our journey toward excellence.\n\nWith appreciation and excitement for improvement,\n{businessName} Team`,
      },
      {
        id: "collaborative-excellence",
        name: "Collaborative Excellence",
        icon: "🤝",
        template: `Dear {customerName},\n\nYour {rating}-star review of {businessName} represents valuable feedback that helps us on our journey toward excellence. We appreciate your honest assessment.\n\nWe'd love to collaborate with you to understand what would transform your experience from good to exceptional. Your perspective as a customer is invaluable in helping us identify opportunities for improvement.\n\nWould you be open to a brief conversation about your experience? We're committed to making meaningful improvements based on customer feedback like yours.\n\nThank you for helping us grow and improve.\n\nWith collaborative spirit,\n{businessName} Improvement Team`,
      },
      {
        id: "growth-mindset-response",
        name: "Growth Mindset Response",
        icon: "📈",
        template: `Dear {customerName},\n\nThank you for your honest {rating}-star review of {businessName}. We embrace a growth mindset, and your feedback is essential fuel for our continuous improvement.\n\nWe're always evolving and enhancing our services, and customer insights like yours guide that evolution. We'd love to understand what specific changes would make the most meaningful impact on your experience.\n\nYour feedback doesn't just help us serve you better—it helps us improve for every customer who walks through our doors. We're grateful for your contribution to our growth.\n\nWhat would you most like to see us improve or enhance?\n\nWith gratitude and commitment to growth,\n{businessName} Development Team`,
      },
    ],
    followup: [
      {
        id: "comprehensive-followup",
        name: "Comprehensive Follow-up",
        icon: "📞",
        template: `Dear {customerName},\n\nI hope this email finds you well. Following up on your recent review of {businessName}, we wanted to ensure that any concerns have been addressed and that you're completely satisfied with the resolution.\n\nYour feedback is invaluable to us, and we're always here if you need anything else. We're committed to continuous improvement and your experience guides that commitment.\n\nThank you for giving us the opportunity to serve you and for helping us become better.\n\nWarm regards,\n{businessName} Customer Success Team`,
      },
      {
        id: "improvement-update-followup",
        name: "Improvement Update Follow-up",
        icon: "📈",
        template: `Dear {customerName},\n\nWe wanted to follow up on your recent feedback about {businessName} and share some exciting updates on the improvements we've implemented based on customer insights like yours.\n\nYour input has directly contributed to positive changes in our service, and we'd love to invite you back to experience these improvements firsthand.\n\nWould you be interested in visiting us again to see the positive changes? We're confident you'll notice the difference.\n\nThank you for being part of our improvement journey.\n\nWith appreciation,\n{businessName} Team`,
      },
    ],
  },
}

const renderStars = (rating: number) => (
  <div className="flex text-yellow-500" aria-label={`${rating} out of 5 stars`}>
    {[...Array(5)].map((_, index) =>
      index < rating ? (
        <motion.div
          key={index}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        >
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" aria-hidden="true" />
        </motion.div>
      ) : (
        <Star key={index} className="h-4 w-4 text-gray-300" aria-hidden="true" />
      ),
    )}
  </div>
)

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Google":
      return <Globe className="h-4 w-4 text-blue-500" />
    case "internal":
      return <MailOpen className="h-4 w-4 text-gray-500" />
    default:
      return <MailOpen className="h-4 w-4 text-gray-500" />
  }
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

const isCustomPlan = (plan: string | undefined) => {
  if (!plan) return false
  const normalizedPlan = plan.toLowerCase()
  return (
    normalizedPlan.includes("custom") || normalizedPlan.includes("enterprise") || normalizedPlan.includes("premium")
  )
}

// Enhanced template message function with custom plan support
const getTemplateMessages = (businessName: string, customerName: string, rating: number, plan?: string) => {
  const isCustomUser = isCustomPlan(plan)

  if (isCustomUser) {
    const category = rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral"
    return {
      whatsapp: CUSTOM_PLAN_TEMPLATES.whatsapp[category] || [],
      email: CUSTOM_PLAN_TEMPLATES.email[category] || [],
      followup: {
        whatsapp: CUSTOM_PLAN_TEMPLATES.whatsapp.followup || [],
        email: CUSTOM_PLAN_TEMPLATES.email.followup || [],
      },
    }
  }

  // Basic templates for non-custom plans
  const templates = {
    whatsapp: {
      positive: `Hi ${customerName}! 🌟 Thank you so much for your ${rating}-star review of ${businessName}! We're thrilled you had a great experience. Your feedback means the world to us! 😊`,
      negative: `Hi ${customerName}, Thank you for taking the time to share your feedback about ${businessName}. We sincerely apologize that we didn't meet your expectations. We'd love to make this right - could we schedule a call to discuss how we can improve? 🙏`,
      neutral: `Hi ${customerName}, Thank you for your ${rating}-star review of ${businessName}. We appreciate your feedback and would love to know how we can improve your experience with us. 💪`,
    },
    email: {
      positive: `Dear ${customerName},\n\nThank you so much for your wonderful ${rating}-star review! We're absolutely delighted that you had such a positive experience with ${businessName}.\n\nYour kind words motivate our entire team to continue delivering exceptional service. We look forward to serving you again soon!\n\nWarm regards,\n${businessName} Team`,
      negative: `Dear ${customerName},\n\nThank you for taking the time to share your feedback about your recent experience with ${businessName}.\n\nWe sincerely apologize that we didn't meet your expectations. Your concerns are important to us, and we'd like the opportunity to make things right.\n\nWould you be available for a brief call so we can discuss how we can improve and potentially resolve any issues?\n\nBest regards,\n${businessName} Team`,
      neutral: `Dear ${customerName},\n\nThank you for your ${rating}-star review of ${businessName}. We appreciate you taking the time to share your experience with us.\n\nWe're always looking to improve our service. If you have any specific suggestions or if there's anything we could have done better, we'd love to hear from you.\n\nThank you for choosing ${businessName}.\n\nBest regards,\n${businessName} Team`,
    },
  }

  const category = rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral"
  return {
    whatsapp: templates.whatsapp[category],
    email: templates.email[category],
  }
}

const replaceTemplateVariables = (template: string, businessName: string, customerName: string, rating: number) => {
  return template
    .replace(/{businessName}/g, businessName)
    .replace(/{customerName}/g, customerName)
    .replace(/{rating}/g, rating.toString())
}

export default function BusinessReviews() {
  const router = useNavigate()
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [filterOption, setFilterOption] = useState("All")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<any>(null)
  const [trialInfo, setTrialInfo] = useState<any>(null)
  const [reviewsLimit, setReviewsLimit] = useState<number>(50)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [userPlan, setUserPlan] = useState<any>(null)
  const [activeBranches, setActiveBranches] = useState<string[]>([])
  const [currentSubscriptionReviews, setCurrentSubscriptionReviews] = useState<Review[]>([])
  const [previousSubscriptionReviews, setPreviousSubscriptionReviews] = useState<Review[]>([])
  const [currentSubscriptionCount, setCurrentSubscriptionCount] = useState(0)
  const [viewMode, setViewMode] = useState<"current" | "previous">("current")
  const [branches, setBranches] = useState<any[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [isReviewLimitReached, setIsReviewLimitReached] = useState(false)
  const [selectedBranchForReview, setSelectedBranchForReview] = useState("")
  const [abandonedCount, setAbandonedCount] = useState(0)
  const [businessName, setBusinessName] = useState("")
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([])

  // Enhanced template message states
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [templateType, setTemplateType] = useState<"whatsapp" | "email">("whatsapp")
  const [customMessage, setCustomMessage] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [messageCategory, setMessageCategory] = useState<"response" | "followup">("response")
  const [showCustomTemplateManager, setShowCustomTemplateManager] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<any[]>([])
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateContent, setNewTemplateContent] = useState("")

  const fetchUserData = useCallback(async (user: any) => {
    try {
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUserPlan(userData)

        const businessInfo = userData.businessInfo || {}
        const branchesData = businessInfo.branches || []
        setBranches(branchesData)
        setBusinessName(businessInfo.businessName || "Your Business")

        const hasAccess = hasLocationAccess(userData.subscriptionPlan, userData.trialActive)
        setShowLocationDropdown(hasAccess)

        const activeBranchNames = branchesData
          .filter((branch: any) => branch.isActive !== false)
          .map((branch: any) => branch.name)
        setActiveBranches(activeBranchNames)

        // Get subscription history and sort by start date (newest first)
        const subscriptionHistoryData = userData.subscriptionHistory || []
        const sortedHistory = subscriptionHistoryData.sort((a: any, b: any) => {
          const aDate = a.startDate?.toDate()?.getTime() || 0
          const bDate = b.startDate?.toDate()?.getTime() || 0
          return bDate - aDate
        })

        const filteredHistory = sortedHistory.filter((item: any) => {
          const itemStart = item.startDate?.toDate()
          const itemEnd = item.endDate?.toDate()
          const currentStart = userData.subscriptionStartDate?.toDate()
          const currentEnd = userData.subscriptionEndDate?.toDate()

          return !(itemStart?.getTime() === currentStart?.getTime() && itemEnd?.getTime() === currentEnd?.getTime())
        })

        setSubscriptionHistory(filteredHistory)

        // Load custom templates for custom plan users
        if (isCustomPlan(userData.subscriptionPlan)) {
          setCustomTemplates(userData.customTemplates || [])
        }

        let limit = 50

        if (userData.subscriptionPlan) {
          setSubscriptionPlan(userData.subscriptionPlan)

          switch (userData.subscriptionPlan.toLowerCase()) {
            case "starter":
            case "plan_basic":
              limit = 100
              break
            case "professional":
            case "plan_pro":
              limit = 500
              break
            case "enterprise":
            case "plan_premium":
            case "custom":
              limit = 0
              break
            default:
              limit = 50
          }
        }

        setReviewsLimit(limit)

        if (userData.trialActive) {
          const now = new Date()
          const trialEnd = userData.trialEndDate?.toDate()
          const trialDaysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

          setTrialInfo({
            active: true,
            daysLeft: trialDaysLeft > 0 ? trialDaysLeft : 0,
          })
        }

        // Fetch Google Reviews
        const businessNameStr = businessInfo.businessName || ""
        const branchName = branchesData[0]?.name || ""
        const searchQuery = `${businessNameStr} ${branchName}`.trim()

        const googleReviews: Review[] = []

        try {
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

            const reviewsArray = detailsData.result?.reviews || []
            reviewsArray.forEach((r: any, i: number) => {
              googleReviews.push({
                id: `google-${i}`,
                name: r.author_name || "Google User",
                email: "",
                phone: "",
                branchname: branchName,
                message: r.text || "",
                rating: r.rating || 0,
                date: new Date().toLocaleDateString(),
                replied: false,
                status: "published",
                platform: "Google",
                reviewType: "Google",
                createdAt: new Date(),
              })
            })
          }
        } catch (error) {
          console.error("Failed to fetch Google reviews:", error)
        }

        setReviews((prev) => [...prev, ...googleReviews])
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }, [])

  const fetchReviews = useCallback(async () => {
    if (!currentUser || !userPlan) return

    try {
      const reviewsQuery = query(collection(db, "users", currentUser.uid, "reviews"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(reviewsQuery)

      const reviewsData: Review[] = []
      const currentSubscriptionReviewsData: Review[] = []
      const previousSubscriptionReviewsData: Review[] = []

      const currentSubscriptionStart = userPlan.subscriptionStartDate?.toDate()
      const currentSubscriptionEnd = userPlan.subscriptionEndDate?.toDate()
      const previousSubscriptions = subscriptionHistory || []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt ? data.createdAt.toDate() : null

        const review = {
          id: doc.id,
          name: data.name || "Anonymous",
          email: data.email || "",
          phone: data.phone || "",
          branchname: data.branchname || "",
          message: data.review || data.message || "",
          rating: data.rating || 0,
          date: createdAt ? format(createdAt, "MMM d, yyyy") : "Unknown date",
          replied: data.replied || false,
          status: data.status || "pending",
          platform: data.platform || "internal",
          reviewType: data.reviewType || "internal",
          createdAt: createdAt || new Date(),
          isComplete: data.isComplete !== false,
        }

        reviewsData.push(review)

        if (createdAt) {
          if (
            currentSubscriptionStart &&
            createdAt >= currentSubscriptionStart &&
            (!currentSubscriptionEnd || createdAt <= currentSubscriptionEnd)
          ) {
            currentSubscriptionReviewsData.push(review)
          } else {
            let belongsToPreviousSubscription = false
            for (const prevSub of previousSubscriptions) {
              const prevStart = prevSub.startDate?.toDate()
              const prevEnd = prevSub.endDate?.toDate()

              if (prevStart && createdAt >= prevStart && (!prevEnd || createdAt <= prevEnd)) {
                previousSubscriptionReviewsData.push(review)
                belongsToPreviousSubscription = true
                break
              }
            }

            if (!belongsToPreviousSubscription && (!currentSubscriptionStart || createdAt < currentSubscriptionStart)) {
              return
            }
          }
        }
      })

      currentSubscriptionReviewsData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      previousSubscriptionReviewsData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

      let limitedCurrentSubscriptionReviews = currentSubscriptionReviewsData
      if (reviewsLimit > 0 && currentSubscriptionReviewsData.length > reviewsLimit) {
        limitedCurrentSubscriptionReviews = currentSubscriptionReviewsData.slice(0, reviewsLimit)
      }

      setReviews(reviewsData)
      setCurrentSubscriptionReviews(limitedCurrentSubscriptionReviews)
      setPreviousSubscriptionReviews(previousSubscriptionReviewsData)

      const countedReviews = currentSubscriptionReviewsData.filter(
        (r) => r.status !== "abandoned" && r.isComplete !== false && !(r.message && r.message.startsWith("Rated")),
      )
      setAbandonedCount(currentSubscriptionReviewsData.length - countedReviews.length)

      setCurrentSubscriptionCount(countedReviews.length)
      setReviewsCount(reviewsData.length)

      const limitReached = reviewsLimit > 0 && countedReviews.length >= reviewsLimit
      setShowUpgradePrompt(limitReached)
      setIsReviewLimitReached(limitReached)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }, [currentUser, reviewsLimit, userPlan, subscriptionHistory])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        await fetchUserData(user)
      } else {
        setCurrentUser(null)
        router("/login")
      }
    })

    return () => unsubscribe()
  }, [fetchUserData, router])

  useEffect(() => {
    if (currentUser) {
      fetchReviews()
    }
  }, [currentUser, fetchReviews])

  const formatPlanName = (plan?: string) => {
    if (!plan) return "Free Trial"
    const planMap: Record<string, string> = {
      plan_basic: "Basic",
      plan_pro: "Pro",
      plan_premium: "Premium",
      starter: "Basic",
      professional: "Pro",
      custom: "Custom",
      enterprise: "Enterprise",
    }
    return planMap[plan] || plan
  }

  const getPlanDurationText = (plan?: string) => {
    if (!plan) return ""
    const durationMap: Record<string, string> = {
      plan_basic: "1 Month",
      starter: "1 Month",
      plan_pro: "1 Month",
      professional: "1 Month",
      plan_premium: "1 Month",
      enterprise: "1 Month",
      custom: "1 Month",
    }
    return durationMap[plan?.toLowerCase()] || "1 Month"
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete || !currentUser) return

    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "reviews", reviewToDelete.id))
      setReviews(reviews.filter((review) => review.id !== reviewToDelete.id))
      setReviewsCount((prev) => prev - 1)

      const reviewBelongsToCurrentSub = currentSubscriptionReviews.some((r) => r.id === reviewToDelete.id)

      if (reviewBelongsToCurrentSub) {
        setCurrentSubscriptionCount((prev) => prev - 1)
        setCurrentSubscriptionReviews(currentSubscriptionReviews.filter((review) => review.id !== reviewToDelete.id))

        if (reviewsLimit && currentSubscriptionCount - 1 < reviewsLimit) {
          setShowUpgradePrompt(false)
          setIsReviewLimitReached(false)
        }
      } else {
        setPreviousSubscriptionReviews(previousSubscriptionReviews.filter((review) => review.id !== reviewToDelete.id))
      }
    } catch (error) {
      console.error("Error deleting review:", error)
    } finally {
      setReviewToDelete(null)
    }
  }

  const handleToggleReply = async (id: string) => {
    if (!currentUser) return

    try {
      const reviewRef = doc(db, "users", currentUser.uid, "reviews", id)
      const review = reviews.find((r) => r.id === id)

      if (review) {
        await updateDoc(reviewRef, {
          replied: !review.replied,
        })

        setReviews(reviews.map((review) => (review.id === id ? { ...review, replied: !review.replied } : review)))

        const reviewBelongsToCurrentSub = currentSubscriptionReviews.some((r) => r.id === id)

        if (reviewBelongsToCurrentSub) {
          setCurrentSubscriptionReviews(
            currentSubscriptionReviews.map((r) => (r.id === id ? { ...r, replied: !r.replied } : r)),
          )
        } else {
          setPreviousSubscriptionReviews(
            previousSubscriptionReviews.map((r) => (r.id === id ? { ...r, replied: !r.replied } : r)),
          )
        }
      }
    } catch (error) {
      console.error("Error toggling reply status:", error)
    }
  }

  const handleStartReviewProcess = () => {
    if (isReviewLimitReached) {
      router("/#pricing")
    } else {
      window.location.assign("/components/business/review-link")
    }
  }

  const handleOpenTemplateDialog = (review: Review, type: "whatsapp" | "email") => {
    setSelectedReview(review)
    setTemplateType(type)
    setMessageCategory("response")
    setSelectedTemplateId("")

    const templates = getTemplateMessages(businessName, review.name, review.rating, userPlan?.subscriptionPlan)

    if (isCustomPlan(userPlan?.subscriptionPlan)) {
      // For custom plans, don't set a default message - let user choose from templates
      setCustomMessage("")
    } else {
      // For basic plans, set the default message
      setCustomMessage(templates[type] as string)
    }

    setShowTemplateDialog(true)
  }

  const handleTemplateSelect = (templateId: string, templateContent: string) => {
    setSelectedTemplateId(templateId)
    const processedContent = replaceTemplateVariables(
      templateContent,
      businessName,
      selectedReview?.name || "",
      selectedReview?.rating || 0,
    )
    setCustomMessage(processedContent)
  }

  const handleSendMessage = () => {
    if (!selectedReview) return

    if (templateType === "whatsapp") {
      const phoneNumber = selectedReview.phone.replace(/\D/g, "")
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(customMessage)}`
      window.open(whatsappUrl, "_blank")
    } else {
      const emailUrl = `mailto:${selectedReview.email}?subject=Thank you for your review&body=${encodeURIComponent(customMessage)}`
      window.open(emailUrl, "_blank")
    }

    if (selectedReview.id) {
      handleToggleReply(selectedReview.id)
    }

    setShowTemplateDialog(false)
    setSelectedReview(null)
    setCustomMessage("")
    setSelectedTemplateId("")
  }

  const handleSaveCustomTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim() || !currentUser) return

    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      template: newTemplateContent,
      type: templateType,
      category: messageCategory,
      createdAt: new Date(),
    }

    const updatedTemplates = [...customTemplates, newTemplate]
    setCustomTemplates(updatedTemplates)

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        customTemplates: updatedTemplates,
      })
    } catch (error) {
      console.error("Error saving custom template:", error)
    }

    setNewTemplateName("")
    setNewTemplateContent("")
  }

  const filteredReviews = useMemo(() => {
    const sourceReviews = viewMode === "current" ? currentSubscriptionReviews : previousSubscriptionReviews

    return sourceReviews
      .filter((review) => {
        const matchesLocation =
          selectedLocation === "All" || review.branchname?.toLowerCase().includes(selectedLocation.toLowerCase())

        const matchesFilter =
          filterOption === "All" ||
          (filterOption === "Above 3" && review.rating > 3) ||
          (filterOption === "Below 3" && review.rating <= 3) ||
          (filterOption === "Replied" && review.replied) ||
          (filterOption === "Not Replied" && !review.replied) ||
          (filterOption === "Google Reviews" && review.platform === "Google") ||
          (filterOption === "Abandoned" &&
            (review.status === "abandoned" ||
              review.isComplete === false ||
              (review.message && review.message.startsWith("Rated"))))

        return matchesLocation && matchesFilter
      })
      .sort((a, b) => {
        return sortOrder === "asc"
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      })
  }, [currentSubscriptionReviews, previousSubscriptionReviews, viewMode, selectedLocation, filterOption, sortOrder])

  const renderPlanDetails = () => {
    if (!userPlan) return null

    const planKey = userPlan.subscriptionPlan || userPlan.plan
    const planName = formatPlanName(planKey)
    const planDuration = getPlanDurationText(planKey)
    const isCustomUser = isCustomPlan(planKey)

    const usageText =
      reviewsLimit === 0
        ? `Review usage: ${currentSubscriptionCount} valid (Unlimited)`
        : `Review usage: ${Math.min(currentSubscriptionCount, reviewsLimit)} valid / ${reviewsLimit}`

    const excludedText = abandonedCount > 0 ? ` (${abandonedCount} abandoned excluded)` : ""

    return (
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-slate-200/60 rounded-3xl p-8 mb-8 shadow-xl backdrop-blur-sm"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-3 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                  {isCustomUser ? (
                    <Crown className="h-6 w-6 text-white" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xl flex items-center gap-3">
                    {planName} Plan ({planDuration})
                    {isCustomUser && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-sm font-semibold shadow-lg">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium Templates
                      </Badge>
                    )}
                  </div>
                  <div className="text-slate-600 text-sm font-medium mt-1">
                    {usageText} {excludedText}
                  </div>
                  {trialInfo?.active && trialInfo.daysLeft !== undefined && (
                    <div className="text-sm text-amber-600 mt-2 font-semibold flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {trialInfo.daysLeft} days left in trial
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 bg-white/90 border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-300">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as "current" | "previous")}
                    className="bg-transparent text-sm font-medium focus:outline-none text-slate-700"
                  >
                    <option value="current">Current Plan Reviews</option>
                    <option value="previous">Previous Plans ({subscriptionHistory.length})</option>
                  </select>
                </div>

                {isCustomUser && (
                  <Button
                    onClick={() => setShowCustomTemplateManager(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2.5 rounded-2xl font-semibold"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Templates
                  </Button>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-shrink-0"
            >
              <Button
                onClick={handleStartReviewProcess}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-3 rounded-2xl font-bold text-lg"
              >
                {isReviewLimitReached ? (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Leave Google Review
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    {userPlan.subscriptionActive ? "Request Review" : "Upgrade Plan"}
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderTemplateSelector = () => {
    if (!isCustomPlan(userPlan?.subscriptionPlan) || !selectedReview) return null

    const templates = getTemplateMessages(
      businessName,
      selectedReview.name,
      selectedReview.rating,
      userPlan?.subscriptionPlan,
    )
    const availableTemplates =
      messageCategory === "followup" ? templates.followup?.[templateType] || [] : templates[templateType] || []

    const userCustomTemplates = customTemplates.filter((t) => t.type === templateType && t.category === messageCategory)
    const allTemplates = [...availableTemplates, ...userCustomTemplates]

    const getTemplateColor = (rating: number) => {
      if (rating >= 4) return "from-green-500 to-emerald-600"
      if (rating <= 2) return "from-red-500 to-rose-600"
      return "from-yellow-500 to-orange-600"
    }

    const getTemplateIcon = (template: any) => {
      if (template.icon) return template.icon
      if (selectedReview.rating >= 4) return "🌟"
      if (selectedReview.rating <= 2) return "🤝"
      return "💪"
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-r ${getTemplateColor(selectedReview.rating)} rounded-xl shadow-lg`}>
              <span className="text-white text-lg">{getTemplateIcon({ rating: selectedReview.rating })}</span>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Message Type:</Label>
              <Select
                value={messageCategory}
                onValueChange={(value: "response" | "followup") => setMessageCategory(value)}
              >
                <SelectTrigger className="w-40 mt-1 border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="response">Response</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span>{allTemplates.length} templates available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {allTemplates.map((template: any, index: number) => (
            <motion.div
              key={template.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                  selectedTemplateId === template.id
                    ? `ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg`
                    : "hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50 shadow-md"
                }`}
                onClick={() => handleTemplateSelect(template.id || index.toString(), template.template)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                    <span className="text-lg">{getTemplateIcon(template)}</span>
                    <span className="flex-1">{template.name}</span>
                    {userCustomTemplates.includes(template) && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                        <Crown className="h-3 w-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">
                    {replaceTemplateVariables(
                      template.template,
                      businessName,
                      selectedReview.name,
                      selectedReview.rating,
                    )}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      {templateType === "whatsapp" ? (
                        <MessageSquare className="h-3 w-3" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      <span>{templateType === "whatsapp" ? "WhatsApp" : "Email"}</span>
                    </div>
                    {selectedTemplateId === template.id && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #7c3aed);
          }
        `}</style>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
              <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Customer Reviews
                </h1>
                <p className="text-slate-600 font-medium text-lg">
                  Manage and respond to your customer feedback professionally
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {showLocationDropdown && (
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-[220px] border-slate-200 focus:ring-2 focus:ring-blue-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white/90">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Select Location" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                      <SelectItem value="All">All Locations</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={filterOption} onValueChange={setFilterOption}>
                  <SelectTrigger className="w-[200px] border-slate-200 focus:ring-2 focus:ring-blue-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white/90">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                    <SelectItem value="All">All Reviews</SelectItem>
                    <SelectItem value="Above 3">Rating Above 3</SelectItem>
                    <SelectItem value="Below 3">Rating Below 3</SelectItem>
                    <SelectItem value="Replied">Replied</SelectItem>
                    <SelectItem value="Not Replied">Not Replied</SelectItem>
                    <SelectItem value="Google Reviews">Google Reviews</SelectItem>
                    <SelectItem value="Abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                  <SelectTrigger className="w-44 border-slate-200 focus:ring-2 focus:ring-blue-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white/90">
                    <SelectValue placeholder="Sort by Date" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </motion.div>

            {renderPlanDetails()}

            {showUpgradePrompt && viewMode === "current" && (
              <motion.div
                className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-8 rounded-3xl shadow-xl"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              >
                <div className="flex items-start">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <CreditCard className="h-7 w-7 text-amber-600 mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <div className="ml-4">
                    <p className="text-amber-800 font-semibold text-lg">
                      🚀 You've reached your monthly review limit ({currentSubscriptionCount}/{reviewsLimit}).
                      <button
                        onClick={() => window.location.assign("/#pricing")}
                        className="ml-2 font-bold text-amber-900 hover:underline hover:text-amber-700 transition-colors"
                      >
                        Upgrade your plan
                      </button>{" "}
                      to unlock unlimited reviews and premium features.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <p className="text-sm text-amber-700 font-medium">
                        New review requests will be redirected to Google Reviews.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === "previous" && (
              <motion.div
                className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-8 rounded-3xl shadow-xl"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              >
                <div className="flex items-start">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <Calendar className="h-7 w-7 text-blue-600 mt-0.5 flex-shrink-0" />
                  </motion.div>
                  <div className="ml-4">
                    <p className="text-blue-800 font-semibold text-lg">
                      You're viewing previous plans' reviews ({previousSubscriptionReviews.length} total). These are
                      sorted by plan duration and don't count toward your current subscription's limit.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <motion.div
                  className="bg-white/90 backdrop-blur-sm p-16 rounded-3xl border border-slate-200/60 text-center shadow-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <FolderOpen className="h-20 w-20 mx-auto text-slate-300 mb-8" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-700">No reviews found</h3>
                  <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">
                    {selectedLocation !== "All"
                      ? "No reviews found for the selected location. Try selecting a different location or filter."
                      : "Start collecting reviews from your customers to see them here"}
                  </p>
                  <div className="mt-8">
                    <Button
                      onClick={handleStartReviewProcess}
                      variant={isReviewLimitReached ? "default" : "outline"}
                      className={`${
                        isReviewLimitReached
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          : "border-slate-300 hover:bg-slate-50"
                      } px-8 py-3 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {isReviewLimitReached ? (
                        <>
                          <Globe className="w-5 h-5 mr-2" />
                          Leave a Google Review
                        </>
                      ) : (
                        "Request a Review"
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      className={`group bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 relative overflow-hidden ${
                        viewMode === "previous" ? "opacity-90" : ""
                      }`}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.95, height: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 },
                      }}
                    >
                      {viewMode === "previous" && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 pointer-events-none rounded-3xl" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />

                      {review.replied && (
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
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-full shadow-xl">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        </motion.div>
                      )}

                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <motion.div
                              className="flex items-center gap-4 mb-3"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl text-lg">
                                {review.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-xl">{review.name}</div>
                                <div className="text-slate-500 text-sm font-medium">{review.date}</div>
                              </div>
                              {review.platform === "Google" && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 border-blue-200 text-blue-700 font-semibold px-3 py-1"
                                >
                                  <div className="flex items-center gap-2">
                                    {getPlatformIcon(review.platform)}
                                    <span>Google Review</span>
                                  </div>
                                </Badge>
                              )}
                              {!review.isComplete && (
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 border-amber-200 text-amber-700 ml-2 px-3 py-1"
                                >
                                  Partial Feedback
                                </Badge>
                              )}
                            </motion.div>
                            <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {renderStars(review.rating)}
                            </motion.div>
                          </div>
                        </div>

                        <motion.div
                          className="text-slate-700 py-4 text-base leading-relaxed bg-slate-50/80 rounded-2xl p-6 border border-slate-100 mb-6"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {review.message}
                        </motion.div>

                        {!review.isComplete && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-3 p-4 bg-amber-50 rounded-2xl border border-amber-200"
                          >
                            <p className="text-sm text-amber-800 flex items-center gap-2 font-medium">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {review.message.includes("Rated")
                                  ? review.message
                                  : `Left after rating ${review.rating} stars`}
                              </span>
                            </p>
                          </motion.div>
                        )}

                        <motion.div
                          className="flex gap-3 mb-6"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {review.branchname && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-12 w-12 hover:bg-orange-50 hover:text-orange-600 rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm"
                                  aria-label="View branch"
                                  disabled={viewMode === "previous"}
                                >
                                  <MapPin className="h-5 w-5" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-4 border border-orange-200 shadow-xl rounded-2xl">
                                <p className="text-sm font-semibold">{review.branchname}</p>
                              </PopoverContent>
                            </Popover>
                          )}

                          {review.email && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-12 w-12 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm"
                                  aria-label="Send email template"
                                  onClick={() => handleOpenTemplateDialog(review, "email")}
                                  disabled={viewMode === "previous"}
                                >
                                  <MailOpen className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 text-white rounded-xl">
                                {review.email || "No email"}
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {review.phone && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-12 w-12 hover:bg-green-50 hover:text-green-600 rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm"
                                  aria-label="Send WhatsApp template"
                                  onClick={() => handleOpenTemplateDialog(review, "whatsapp")}
                                  disabled={viewMode === "previous"}
                                >
                                  <MessageSquare className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-slate-800 text-white rounded-xl">
                                {review.phone || "No Number"}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </motion.div>

                        {viewMode === "current" && (
                          <motion.div
                            className="flex justify-end items-center pt-4 border-t border-slate-100"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <div className="flex gap-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 hover:bg-emerald-50 rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm"
                                    aria-label="Toggle reply status"
                                  >
                                    <Check
                                      className={`h-5 w-5 ${review.replied ? "text-emerald-600" : "text-slate-400"}`}
                                    />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-3 border border-emerald-200 shadow-xl rounded-2xl">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium"
                                    onClick={() => handleToggleReply(review.id)}
                                  >
                                    {review.replied ? "Unmark as replied" : "Mark as replied"}
                                  </Button>
                                </PopoverContent>
                              </Popover>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm"
                                    aria-label="Delete review"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-3 border border-red-200 shadow-xl rounded-2xl">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setReviewToDelete(review)}
                                    className="rounded-xl font-medium"
                                  >
                                    Delete
                                  </Button>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Enhanced Template Message Dialog for Custom Plan Users */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto rounded-3xl">
                <DialogHeader className="pb-6">
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    {templateType === "whatsapp" ? (
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <MailOpen className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                      {templateType === "whatsapp" ? "WhatsApp Message" : "Email Template"}
                    </span>
                    {isCustomPlan(userPlan?.subscriptionPlan) && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        <Crown className="h-4 w-4 mr-2" />
                        Premium Templates
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-slate-600">
                    {isCustomPlan(userPlan?.subscriptionPlan)
                      ? `Choose from multiple professional templates or create custom responses for ${selectedReview?.name}'s ${selectedReview?.rating}-star review`
                      : `Customize your response to ${selectedReview?.name}'s ${selectedReview?.rating}-star review`}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                  {isCustomPlan(userPlan?.subscriptionPlan) && renderTemplateSelector()}

                  <div>
                    <Label htmlFor="message" className="text-lg font-semibold text-slate-700 mb-3 block">
                      Message Content
                    </Label>
                    <Textarea
                      id="message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={10}
                      className="mt-2 rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-300 text-base leading-relaxed"
                      placeholder={
                        isCustomPlan(userPlan?.subscriptionPlan)
                          ? "Select a template above or write your custom message..."
                          : "Enter your message..."
                      }
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm text-slate-500 font-medium">{customMessage.length} characters</p>
                      {isCustomPlan(userPlan?.subscriptionPlan) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(customMessage)
                          }}
                          className="text-slate-500 hover:text-slate-700 rounded-xl"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Message
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateDialog(false)}
                    className="rounded-2xl border-slate-200 hover:bg-slate-50 px-8 py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl px-8 py-3 font-semibold"
                    disabled={!customMessage.trim()}
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send {templateType === "whatsapp" ? "WhatsApp" : "Email"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Custom Template Manager Dialog for Custom Plan Users */}
            <Dialog open={showCustomTemplateManager} onOpenChange={setShowCustomTemplateManager}>
              <DialogContent className="sm:max-w-[1100px] max-h-[95vh] rounded-3xl">
                <DialogHeader className="pb-6">
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                      Template Manager
                    </span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 font-bold shadow-lg">
                      Custom Plan Feature
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-lg text-slate-600">
                    Create and manage your custom message templates for different review scenarios
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="existing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-2xl p-1">
                    <TabsTrigger value="existing" className="rounded-xl font-semibold">
                      Existing Templates
                    </TabsTrigger>
                    <TabsTrigger value="create" className="rounded-xl font-semibold">
                      Create New
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-6 mt-6">
                    <div className="grid gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {customTemplates.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                          <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4">
                            <MessageSquare className="h-12 w-12 text-slate-300" />
                          </div>
                          <p className="text-lg font-medium">No custom templates yet</p>
                          <p className="text-sm">Create your first template to get started!</p>
                        </div>
                      ) : (
                        customTemplates.map((template) => (
                          <Card key={template.id} className="p-6 rounded-2xl shadow-lg border-slate-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                    <span className="text-white text-sm">
                                      {template.type === "whatsapp" ? "📱" : "📧"}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-lg text-slate-800">{template.name}</h4>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {template.type === "whatsapp" ? "WhatsApp" : "Email"}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {template.category === "followup" ? "Follow-up" : "Response"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-4 rounded-xl">
                                  {template.template}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedTemplates = customTemplates.filter((t) => t.id !== template.id)
                                  setCustomTemplates(updatedTemplates)
                                  if (currentUser) {
                                    updateDoc(doc(db, "users", currentUser.uid), {
                                      customTemplates: updatedTemplates,
                                    })
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl ml-4"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="create" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="template-name" className="text-sm font-semibold text-slate-700">
                          Template Name
                        </Label>
                        <Input
                          id="template-name"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="e.g., Friendly Thank You"
                          className="mt-2 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Template Type</Label>
                        <Select
                          value={templateType}
                          onValueChange={(value: "whatsapp" | "email") => setTemplateType(value)}
                        >
                          <SelectTrigger className="mt-2 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Message Category</Label>
                      <Select
                        value={messageCategory}
                        onValueChange={(value: "response" | "followup") => setMessageCategory(value)}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="response">Response</SelectItem>
                          <SelectItem value="followup">Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="template-content" className="text-sm font-semibold text-slate-700">
                        Template Content
                      </Label>
                      <Textarea
                        id="template-content"
                        value={newTemplateContent}
                        onChange={(e) => setNewTemplateContent(e.target.value)}
                        rows={8}
                        className="mt-2 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-300"
                        placeholder="Use {customerName}, {businessName}, and {rating} as placeholders..."
                      />
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-xl">
                        <strong>Available placeholders:</strong> {"{customerName}"}, {"{businessName}"}, {"{rating}"}
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveCustomTemplate}
                      disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl py-3 font-bold text-lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Save Template
                    </Button>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomTemplateManager(false)}
                    className="rounded-2xl border-slate-200 hover:bg-slate-50 px-8 py-3"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <ConfirmDialog
              isOpen={!!reviewToDelete}
              onClose={() => setReviewToDelete(null)}
              onConfirm={handleDeleteReview}
              title="Delete Review"
              description={`Are you sure you want to delete the review from ${reviewToDelete?.name}? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              variant="destructive"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
