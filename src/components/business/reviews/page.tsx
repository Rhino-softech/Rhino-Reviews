"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Check,
  FolderOpen,
  MailOpen,
  Star,
  Trash2,
  MapPin,
  Globe,
  Sparkles,
  TrendingUp,
  Calendar,
  MessageSquare,
  Send,
  Plus,
  Edit,
  Crown,
  Clock,
  Mail,
  Gift,
  ShoppingCart,
  Package,
  Copy,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
        template: `Dear {customerName},

Thank you so much for your wonderful {rating}-star review! We're absolutely delighted that you had such a positive experience with {businessName}.

Your kind words motivate our entire team to continue delivering exceptional service. We look forward to serving you again soon!

Warm regards,
{businessName} Team`,
      },
      {
        id: "detailed-appreciation",
        name: "Detailed Appreciation",
        icon: "💎",
        template: `Dear {customerName},

We are truly grateful for your {rating}-star review of {businessName}. Your positive feedback not only brightens our day but also helps other customers discover our services.

We're committed to maintaining the high standards that impressed you, and we can't wait to welcome you back.

With sincere appreciation,
{businessName} Team`,
      },
    ],
    negative: [
      {
        id: "comprehensive-apology-solution",
        name: "Comprehensive Apology & Solution",
        icon: "🤝",
        template: `Dear {customerName},

Thank you for taking the time to share your feedback about your recent experience with {businessName}. We sincerely apologize that we didn't meet your expectations.

Your concerns are incredibly important to us, and we'd like the opportunity to make things right. We've already begun reviewing our processes to prevent similar issues in the future.

Would you be available for a brief call this week so we can discuss how we can improve and potentially resolve any outstanding concerns? We're committed to turning your experience around.

With sincere apologies and commitment to improvement,
{businessName} Management Team`,
      },
      {
        id: "empathetic-personal-response",
        name: "Empathetic Personal Response",
        icon: "💙",
        template: `Dear {customerName},

I want to personally apologize for your disappointing experience with {businessName}. Reading your review, I can understand your frustration, and I take full responsibility for not meeting the standards you rightfully expected.

Every customer deserves exceptional service, and we clearly fell short. I would very much like to speak with you personally to understand exactly what went wrong and how we can make it right.

Please reply to this email or call me directly. I'm committed to ensuring your next experience with us exceeds your expectations.

Sincerely,
[Your Name]
{businessName} Management`,
      },
      {
        id: "action-oriented-recovery",
        name: "Action-Oriented Recovery",
        icon: "⚡",
        template: `Dear {customerName},

Thank you for bringing your concerns about {businessName} to our attention. We take all feedback seriously and are already implementing changes based on your experience.

Here's what we're doing immediately:
• Reviewing our service protocols
• Additional staff training
• Enhanced quality control measures

Our management team would like to speak with you directly to ensure we address your specific concerns. Please reply to this email or call us at your convenience.

We're committed to earning back your trust and providing you with the exceptional service you deserve.

Sincerely,
{businessName} Management Team`,
      },
      {
        id: "learning-partnership-approach",
        name: "Learning Partnership Approach",
        icon: "📚",
        template: `Dear {customerName},

Thank you for your honest and valuable feedback about {businessName}. While we're disappointed that we didn't meet your expectations, we're grateful for the opportunity to learn and improve.

Your experience highlights areas where we can do better, and we're already taking steps to address these issues. We believe that every piece of feedback makes us stronger and helps us serve our community better.

We'd love to keep you updated on our improvements and invite you back to experience the positive changes we're making. Would you be open to a follow-up conversation in a few weeks?

Thank you for helping us grow.

With appreciation,
{businessName} Team`,
      },
      {
        id: "transparent-commitment",
        name: "Transparent Commitment",
        icon: "🛡️",
        template: `Dear {customerName},

We appreciate your transparency in sharing your experience with {businessName}. Your feedback is a valuable gift that helps us understand where we need to improve.

We believe in open, honest communication, and we want to be equally transparent with you about the steps we're taking to address your concerns:

• Immediate review of the situation
• Staff retraining where necessary
• Process improvements to prevent recurrence
• Follow-up to ensure lasting change

We'd welcome the opportunity to discuss your experience in more detail and show you the improvements we're making. When would be a convenient time for a conversation?

With commitment to excellence,
{businessName} Leadership Team`,
      },
      {
        id: "community-responsibility",
        name: "Community Responsibility",
        icon: "🌍",
        template: `Dear {customerName},

As a valued member of our {businessName} community, your feedback carries special weight with us. We're disappointed that we didn't provide you with the experience you deserved.

We take our responsibility to our community seriously, and your review reminds us of the trust you place in us every time you choose our services. We're committed to honoring that trust through continuous improvement.

We'd be grateful for the opportunity to discuss your experience and show you the positive changes we're implementing. Your insights will help us serve not just you, but our entire community better.

Thank you for caring enough to share your feedback.

With community commitment,
{businessName} Team`,
      },
      {
        id: "quality-excellence-focus",
        name: "Quality Excellence Focus",
        icon: "⭐",
        template: `Dear {customerName},

Maintaining excellence in every aspect of {businessName} is our unwavering commitment, and we clearly didn't achieve that standard in your experience. We're genuinely sorry for this shortfall.

Excellence isn't just our goal—it's our promise to every customer. Your feedback shows us exactly where we need to focus our improvement efforts. We're already implementing enhanced quality measures to ensure this doesn't happen again.

We'd be honored if you would give us another opportunity to demonstrate the level of service that reflects our true commitment to excellence. Could we arrange a time to discuss how we can make this right?

With renewed commitment to quality,
{businessName} Quality Team`,
      },
    ],
    neutral: [
      {
        id: "engagement-improvement-focus",
        name: "Engagement & Improvement Focus",
        icon: "💪",
        template: `Dear {customerName},

Thank you for your {rating}-star review of {businessName}. We appreciate you taking the time to share your experience with us.

We're always looking to improve our service and would love to understand what would elevate your experience to a 5-star level. Your insights are invaluable in helping us serve you and our community better.

If you have any specific suggestions or if there's anything we could have done differently, we'd love to hear from you. We're committed to continuous improvement and your feedback guides that journey.

Thank you for choosing {businessName}.

Best regards,
{businessName} Team`,
      },
      {
        id: "curiosity-driven-engagement",
        name: "Curiosity-Driven Engagement",
        icon: "🤔",
        template: `Dear {customerName},

Thank you for your {rating}-star review of {businessName}. We're curious to learn more about your experience and how we can make it even better.

Your rating suggests we did some things right, but we'd love to understand what we could improve. What aspects of your experience stood out positively, and what areas could we enhance?

We believe every customer interaction is an opportunity to learn and grow. Your detailed feedback would help us understand how to serve you and others even better.

We'd welcome a brief conversation about your experience if you're open to it.

With curiosity and commitment to improvement,
{businessName} Team`,
      },
      {
        id: "potential-partnership",
        name: "Potential Partnership",
        icon: "🚀",
        template: `Dear {customerName},

Thank you for your {rating}-star review of {businessName}. We see tremendous potential in enhancing your experience with us, and we'd love your partnership in making that happen.

Your feedback tells us we're on the right track but have room to grow. We're excited about the possibility of turning your next visit into a 5-star experience.

What would make the biggest positive difference for you? We're committed to continuous improvement and would value your specific insights on how we can better serve you.

Thank you for being part of our journey toward excellence.

With appreciation and excitement for improvement,
{businessName} Team`,
      },
      {
        id: "collaborative-excellence",
        name: "Collaborative Excellence",
        icon: "🤝",
        template: `Dear {customerName},

Your {rating}-star review of {businessName} represents valuable feedback that helps us on our journey toward excellence. We appreciate your honest assessment.

We'd love to collaborate with you to understand what would transform your experience from good to exceptional. Your perspective as a customer is invaluable in helping us identify opportunities for improvement.

Would you be open to a brief conversation about your experience? We're committed to making meaningful improvements based on customer feedback like yours.

Thank you for helping us grow and improve.

With collaborative spirit,
{businessName} Improvement Team`,
      },
      {
        id: "growth-mindset-response",
        name: "Growth Mindset Response",
        icon: "📈",
        template: `Dear {customerName},

Thank you for your honest {rating}-star review of {businessName}. We embrace a growth mindset, and your feedback is essential fuel for our continuous improvement.

We're always evolving and enhancing our services, and customer insights like yours guide that evolution. We'd love to understand what specific changes would make the most meaningful impact on your experience.

Your feedback doesn't just help us serve you better—it helps us improve for every customer who walks through our doors. We're grateful for your contribution to our growth.

What would you most like to see us improve or enhance?

With gratitude and commitment to growth,
{businessName} Development Team`,
      },
    ],
    followup: [
      {
        id: "comprehensive-followup",
        name: "Comprehensive Follow-up",
        icon: "📞",
        template: `Dear {customerName},

I hope this email finds you well. Following up on your recent review of {businessName}, we wanted to ensure that any concerns have been addressed and that you're completely satisfied with the resolution.

Your feedback is invaluable to us, and we're always here if you need anything else. We're committed to continuous improvement and your experience guides that commitment.

Thank you for giving us the opportunity to serve you and for helping us become better.

Warm regards,
{businessName} Customer Success Team`,
      },
      {
        id: "improvement-update-followup",
        name: "Improvement Update Follow-up",
        icon: "📈",
        template: `Dear {customerName},

We wanted to follow up on your recent feedback about {businessName} and share some exciting updates on the improvements we've implemented based on customer insights like yours.

Your input has directly contributed to positive changes in our service, and we'd love to invite you back to experience these improvements firsthand.

Would you be interested in visiting us again to see the positive changes? We're confident you'll notice the difference.

Thank you for being part of our improvement journey.

With appreciation,
{businessName} Team`,
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
      positive: `Dear ${customerName},

Thank you so much for your wonderful ${rating}-star review! We're absolutely delighted that you had such a positive experience with ${businessName}.

Your kind words motivate our entire team to continue delivering exceptional service. We look forward to serving you again soon!

Warm regards,
${businessName} Team`,
      negative: `Dear ${customerName},

Thank you for taking the time to share your feedback about your recent experience with ${businessName}.

We sincerely apologize that we didn't meet your expectations. Your concerns are important to us, and we'd like the opportunity to make things right.

Would you be available for a brief call so we can discuss how we can improve and potentially resolve any issues?

Best regards,
${businessName} Team`,
      neutral: `Dear ${customerName},

Thank you for your ${rating}-star review of ${businessName}. We appreciate you taking the time to share your experience with us.

We're always looking to improve our service. If you have any specific suggestions or if there's anything we could have done better, we'd love to hear from you.

Thank you for choosing ${businessName}.

Best regards,
${businessName} Team`,
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

  // SUBSCRIPTION PLAN STATES - UNCHANGED EXISTING LOGIC
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
  const [showBonusPrompt, setShowBonusPrompt] = useState(false)
  const [bonusReviews, setBonusReviews] = useState(0)

  // ADD-ON SYSTEM STATES - COMPLETELY SEPARATE AND ONLY FOR BUSINESS REVIEWS PAGE
  const [showAddonDialog, setShowAddonDialog] = useState(false)
  const [addonCredits, setAddonCredits] = useState(0) // SEPARATE from subscription plan
  const [usedAddonCredits, setUsedAddonCredits] = useState(0) // SEPARATE from subscription plan
  const [selectedAddonPackage, setSelectedAddonPackage] = useState<any>(null)
  const [addonPackages, setAddonPackages] = useState<any[]>([])

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

  // NEW: LOCATION-BASED PRICING STATES
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [userCurrency, setUserCurrency] = useState<string>("USD")
  const [currencySymbol, setCurrencySymbol] = useState<string>("$")
  const [pricingConfig, setPricingConfig] = useState<any>({
    starter: 49,
    professional: 99,
    custom: 299,
  })

  // Map currency symbols to country codes
  const CURRENCY_SYMBOLS: Record<string, string> = {
    US: "$",
    IN: "₹",
    GB: "£",
    AU: "A$",
    CA: "C$",
    EU: "€",
    DEFAULT: "$",
  }

  // NEW: LOCATION-BASED PRICING SETUP
  useEffect(() => {
    // Fetch admin pricing configuration
    const fetchPricingConfig = async () => {
      try {
        const configRef = doc(db, "admin", "pricing")
        const configDoc = await getDoc(configRef)
        if (configDoc.exists()) {
          const data = configDoc.data()
          setPricingConfig({
            starter: data.starter || 49,
            professional: data.professional || 99,
            custom: data.custom || 299,
          })
        }
      } catch (error) {
        console.error("Error fetching pricing config:", error)
      }
    }

    fetchPricingConfig()
  }, [])

  useEffect(() => {
    // Fetch user location and exchange rate
    const fetchUserCurrency = async () => {
      try {
        const ipResponse = await fetch("https://ipapi.co/json/")
        const ipData = await ipResponse.json()
        const countryCode = ipData.country || "US"
        const symbol = CURRENCY_SYMBOLS[countryCode] || CURRENCY_SYMBOLS.DEFAULT
        setCurrencySymbol(symbol)
        if (countryCode !== "US") {
          const currencyCode = getCurrencyCode(countryCode)
          if (currencyCode) {
            setUserCurrency(currencyCode)
            const rateResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
            const rateData = await rateResponse.json()
            setExchangeRate(rateData.rates[currencyCode])
          }
        }
      } catch (error) {
        console.error("Error fetching currency data:", error)
        setUserCurrency("USD")
        setCurrencySymbol("$")
      }
    }

    const getCurrencyCode = (countryCode: string): string | null => {
      const currencyMap: Record<string, string> = {
        IN: "INR",
        GB: "GBP",
        AU: "AUD",
        CA: "CAD",
        EU: "EUR",
      }
      return currencyMap[countryCode] || null
    }

    fetchUserCurrency()
  }, [])

  // NEW: LOCATION-BASED PRICE CONVERSION FUNCTION
  const getConvertedPrice = (usdPrice: number): string => {
    if (userCurrency === "USD" || !exchangeRate) {
      return `${currencySymbol}${usdPrice}`
    }
    const convertedPrice = usdPrice * exchangeRate
    if (userCurrency === "INR") {
      return `${currencySymbol}${Math.round(convertedPrice)}`
    }
    return `${currencySymbol}${convertedPrice.toFixed(2)}`
  }

  // FETCH USER DATA - EXISTING SUBSCRIPTION LOGIC UNCHANGED
  const fetchUserData = useCallback(async (user: any) => {
    try {
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const userData = userDoc.data()

        // Check if this is the first subscription - EXISTING LOGIC
        const isFirstSubscription = !userData.firstSubscriptionDone

        setUserPlan({
          ...userData,
          firstSubscriptionDone: userData.firstSubscriptionDone || false,
          isFirstSubscription,
        })

        // Show bonus prompt for first-time subscribers - EXISTING LOGIC
        if (isFirstSubscription && userData.subscriptionPlan) {
          setShowBonusPrompt(true)
          await updateDoc(userRef, { firstSubscriptionDone: true })
        }

        // LOAD ADD-ON CREDITS - COMPLETELY SEPARATE FROM SUBSCRIPTION PLAN
        // These are stored separately and don't affect subscription plan logic
        setAddonCredits(userData.addonCredits || 0)
        setUsedAddonCredits(userData.usedAddonCredits || 0)

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

        // Get subscription history and sort by start date (newest first) - EXISTING LOGIC
        const subscriptionHistoryData = userData.subscriptionHistory || []
        const sortedHistory = subscriptionHistoryData.sort((a: any, b: any) => {
          const aDate = a.startDate?.toDate()?.getTime() || 0
          const bDate = b.startDate?.toDate()?.getTime() || 0
          return bDate - aDate
        })

        // Filter out current subscription from history - EXISTING LOGIC
        const currentStart = userData.subscriptionStartDate?.toDate()
        const currentEnd = userData.subscriptionEndDate?.toDate()

        const filteredHistory = sortedHistory.filter((item: any) => {
          const itemStart = item.startDate?.toDate()
          const itemEnd = item.endDate?.toDate()

          // Exclude if it matches current subscription dates
          return !(itemStart?.getTime() === currentStart?.getTime() && itemEnd?.getTime() === currentEnd?.getTime())
        })

        setSubscriptionHistory(filteredHistory)

        // Load custom templates for custom plan users - EXISTING LOGIC
        if (isCustomPlan(userData.subscriptionPlan)) {
          setCustomTemplates(userData.customTemplates || [])
        }

        // CALCULATE REVIEW LIMITS WITH FIRST-TIME BONUS - SUBSCRIPTION PLAN ONLY (UNCHANGED)
        let limit = 50
        let bonus = 0

        if (userData.subscriptionPlan) {
          setSubscriptionPlan(userData.subscriptionPlan)
          switch (userData.subscriptionPlan.toLowerCase()) {
            case "starter":
            case "plan_basic":
              limit = 100
              bonus = isFirstSubscription ? 25 : 0
              break
            case "professional":
            case "plan_pro":
              limit = 500
              bonus = isFirstSubscription ? 25 : 0
              break
            case "custom":
            case "plan_premium":
            case "enterprise":
              limit = 0 // Unlimited
              bonus = 0
              break
            default:
              limit = 50
              bonus = 0
          }
        }

        setBonusReviews(bonus)
        setReviewsLimit(limit + bonus) // SUBSCRIPTION PLAN LIMIT ONLY

        if (userData.trialActive) {
          const now = new Date()
          const trialEnd = userData.trialEndDate?.toDate()
          const trialDaysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
          setTrialInfo({
            active: true,
            daysLeft: trialDaysLeft > 0 ? trialDaysLeft : 0,
          })
        }

        // Fetch Google Reviews - EXISTING LOGIC
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

        // Store Google reviews separately to be merged in fetchReviews
        setReviews(googleReviews)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }, [])

  // FETCH REVIEWS - EXISTING LOGIC UNCHANGED
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
          // Check if review belongs to current subscription - EXISTING LOGIC
          if (
            currentSubscriptionStart &&
            createdAt >= currentSubscriptionStart &&
            (!currentSubscriptionEnd || createdAt <= currentSubscriptionEnd)
          ) {
            currentSubscriptionReviewsData.push(review)
          } else {
            // Check if review belongs to any previous subscription - EXISTING LOGIC
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

            // If doesn't belong to any subscription period, add to previous for now
            if (!belongsToPreviousSubscription && (!currentSubscriptionStart || createdAt < currentSubscriptionStart)) {
              previousSubscriptionReviewsData.push(review)
            }
          }
        }
      })

      // Sort reviews by creation date - EXISTING LOGIC
      currentSubscriptionReviewsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      previousSubscriptionReviewsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      // APPLY REVIEW LIMIT TO CURRENT SUBSCRIPTION REVIEWS ONLY - EXISTING LOGIC
      let limitedCurrentSubscriptionReviews = currentSubscriptionReviewsData
      if (reviewsLimit > 0 && currentSubscriptionReviewsData.length > reviewsLimit) {
        limitedCurrentSubscriptionReviews = currentSubscriptionReviewsData.slice(0, reviewsLimit)
      }

      // Merge Google reviews with Firestore reviews, avoiding duplicates
      const allReviews = [...reviewsData]
      reviews.forEach((googleReview) => {
        if (googleReview.platform === "Google" && !allReviews.some((r) => r.id === googleReview.id)) {
          allReviews.push(googleReview)
        }
      })

      setReviews(allReviews)
      setCurrentSubscriptionReviews(limitedCurrentSubscriptionReviews)
      setPreviousSubscriptionReviews(previousSubscriptionReviewsData)

      // Count valid reviews (excluding abandoned/incomplete) - EXISTING LOGIC
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
  }, [currentUser, reviewsLimit, userPlan, subscriptionHistory, reviews])

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

  // Fetch addon packages
  useEffect(() => {
    const fetchAddonPackages = async () => {
      try {
        const configRef = doc(db, "admin", "addonPackages")
        const configDoc = await getDoc(configRef)
        if (configDoc.exists()) {
          const data = configDoc.data()
          setAddonPackages(data.packages || [])
        }
      } catch (error) {
        console.error("Error fetching addon packages:", error)
      }
    }

    if (showAddonDialog) {
      fetchAddonPackages()
    }
  }, [showAddonDialog])

  // EXISTING HELPER FUNCTIONS - UNCHANGED
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

  // EXISTING DELETE REVIEW FUNCTION - UNCHANGED
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

  // EXISTING TOGGLE REPLY FUNCTION - UNCHANGED
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

  // EXISTING START REVIEW PROCESS - UNCHANGED
  const handleStartReviewProcess = () => {
    if (isReviewLimitReached) {
      router("/#pricing")
    } else {
      window.location.assign("/components/business/review-link")
    }
  }

  // TEMPLATE DIALOG HANDLER - WITH ADD-ON CREDIT CHECK FOR PREVIOUS PLANS ONLY
  const handleOpenTemplateDialog = (review: Review, type: "whatsapp" | "email") => {
    // CHECK ADD-ON CREDITS ONLY FOR PREVIOUS PLAN REVIEWS
    if (viewMode === "previous") {
      const availableCredits = addonCredits - usedAddonCredits
      if (availableCredits <= 0) {
        setShowAddonDialog(true)
        return
      }
    }
    // FOR CURRENT PLAN REVIEWS - USE EXISTING SUBSCRIPTION LOGIC (NO CHANGE)

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

  // SEND MESSAGE HANDLER - DEDUCT ADD-ON CREDIT ONLY FOR PREVIOUS PLAN REVIEWS
  const handleSendMessage = async () => {
    if (!selectedReview) return

    // DEDUCT ADD-ON CREDIT ONLY FOR PREVIOUS PLAN REVIEWS
    if (viewMode === "previous" && currentUser) {
      const newUsedCredits = usedAddonCredits + 1
      setUsedAddonCredits(newUsedCredits)

      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          usedAddonCredits: newUsedCredits,
        })
      } catch (error) {
        console.error("Error updating addon credits:", error)
      }
    }
    // FOR CURRENT PLAN REVIEWS - NO ADD-ON CREDIT DEDUCTION (EXISTING LOGIC)

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

  // PURCHASE ADD-ON HANDLER - ONLY FOR PREVIOUS PLAN REVIEWS
  const handlePurchaseAddon = (addonPackage: any) => {
    setSelectedAddonPackage(addonPackage)
    // Navigate to payment with addon package details
    router("/payment", {
      state: {
        planName: `${addonPackage.name} - ${addonPackage.replies} Reply Credits`,
        price: addonPackage.basePrice || addonPackage.price,
        planId: addonPackage.id,
        isAddon: true, // FLAG TO INDICATE THIS IS AN ADD-ON, NOT A SUBSCRIPTION PLAN
        addonReplies: addonPackage.replies,
      },
    })
  }

  // FILTERED REVIEWS - EXISTING LOGIC UNCHANGED
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

  // Template selector for custom plans
  const renderTemplateSelector = () => {
    if (!isCustomPlan(userPlan?.subscriptionPlan)) return null

    const templates = getTemplateMessages(
      businessName,
      selectedReview?.name || "",
      selectedReview?.rating || 0,
      userPlan?.subscriptionPlan,
    )

    const relevantTemplates =
      messageCategory === "followup" ? templates.followup?.[templateType] || [] : templates[templateType] || []

    return (
      <Tabs value={messageCategory} onValueChange={(value) => setMessageCategory(value as "response" | "followup")}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-2xl p-1">
          <TabsTrigger value="response" className="rounded-xl font-semibold">
            Response Templates
          </TabsTrigger>
          <TabsTrigger value="followup" className="rounded-xl font-semibold">
            Follow-up Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value={messageCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {relevantTemplates.map((template: any) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedTemplateId === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleTemplateSelect(template.id, template.template)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{template.icon || "📝"}</span>
                  <span className="font-semibold text-sm">{template.name}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3">{template.template.substring(0, 100)}...</p>
              </motion.div>
            ))}
          </div>
          {relevantTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>
                No {messageCategory} templates found for {templateType}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    )
  }

  // RENDER PLAN DETAILS - EXISTING LOGIC WITH ADD-ON CREDIT DISPLAY
  const renderPlanDetails = () => {
    if (!userPlan) return null

    const planKey = userPlan.subscriptionPlan || userPlan.plan
    const planName = formatPlanName(planKey)
    const planDuration = getPlanDurationText(planKey)
    const isCustomUser = isCustomPlan(planKey)
    const isFirstSub = userPlan.isFirstSubscription

    // SUBSCRIPTION PLAN USAGE - UNCHANGED EXISTING LOGIC
    const usageText =
      reviewsLimit === 0
        ? `Review usage: ${currentSubscriptionCount} valid (Unlimited)`
        : `Review usage: ${Math.min(currentSubscriptionCount, reviewsLimit)} valid / ${reviewsLimit}`

    const excludedText = abandonedCount > 0 ? ` (${abandonedCount} abandoned excluded)` : ""
    const bonusText = bonusReviews > 0 ? ` (+${bonusReviews} bonus)` : ""

    // ADD-ON CREDITS - COMPLETELY SEPARATE FROM SUBSCRIPTION PLAN
    const availableAddonCredits = addonCredits - usedAddonCredits

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
                    {bonusReviews > 0 && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-semibold shadow-lg animate-pulse">
                        <Gift className="h-3 w-3 mr-1" />+{bonusReviews} Bonus
                      </Badge>
                    )}
                  </div>
                  <div className="text-slate-600 text-sm font-medium mt-1">
                    {usageText} {excludedText} {bonusText}
                  </div>
                  {/* ADD-ON CREDITS DISPLAY - ONLY FOR PREVIOUS PLAN REVIEWS */}
                  {viewMode === "previous" && addonCredits > 0 && (
                    <div className="text-sm text-orange-600 mt-2 font-semibold flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      Add-on Credits: {availableAddonCredits} / {addonCredits} available (Previous Plans Only)
                    </div>
                  )}
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
                    <option value="current">Current Plan Reviews ({currentSubscriptionReviews.length})</option>
                    <option value="previous">Previous Plans ({previousSubscriptionReviews.length})</option>
                  </select>
                </div>

                {/* ADD-ON PURCHASE BUTTON - ONLY SHOWN FOR PREVIOUS PLAN REVIEWS */}
                {viewMode === "previous" && (
                  <Button
                    onClick={() => setShowAddonDialog(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2.5 rounded-2xl font-semibold"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Reply Credits
                  </Button>
                )}

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
              className="flex flex-col sm:flex-row gap-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleStartReviewProcess}
                className={`${
                  isReviewLimitReached
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                } text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-3 rounded-2xl font-bold text-lg`}
              >
                {isReviewLimitReached ? (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Upgrade Plan
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Get New Review
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 ml-8">
            <motion.div
              className="max-w-7xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Business Reviews
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Manage and respond to your customer reviews with intelligent templates and comprehensive analytics
                </p>
              </motion.div>

              {renderPlanDetails()}

              {/* EXISTING FILTERS AND CONTROLS - UNCHANGED */}
              <motion.div
                className="bg-white/90 border border-slate-200/60 rounded-3xl p-6 shadow-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-4">
                    {activeBranches.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger className="w-48 bg-white border-slate-200 rounded-xl">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Locations</SelectItem>
                            {activeBranches.map((branch) => (
                              <SelectItem key={branch} value={branch}>
                                {branch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-slate-500" />
                      <Select value={filterOption} onValueChange={setFilterOption}>
                        <SelectTrigger className="w-48 bg-white border-slate-200 rounded-xl">
                          <SelectValue placeholder="Filter reviews" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Reviews</SelectItem>
                          <SelectItem value="Above 3">Above 3 Stars</SelectItem>
                          <SelectItem value="Below 3">3 Stars & Below</SelectItem>
                          <SelectItem value="Replied">Replied</SelectItem>
                          <SelectItem value="Not Replied">Not Replied</SelectItem>
                          <SelectItem value="Google Reviews">Google Reviews</SelectItem>
                          <SelectItem value="Abandoned">Abandoned Reviews</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <Select value={sortOrder} onValueChange={(value: "desc" | "asc") => setSortOrder(value)}>
                        <SelectTrigger className="w-48 bg-white border-slate-200 rounded-xl">
                          <SelectValue placeholder="Sort by date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Newest First</SelectItem>
                          <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-xl font-medium">
                    Showing {filteredReviews.length} of{" "}
                    {viewMode === "current" ? currentSubscriptionReviews.length : previousSubscriptionReviews.length}{" "}
                    reviews
                  </div>
                </div>
              </motion.div>

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

              {/* EXISTING REVIEWS GRID - UNCHANGED */}
              <AnimatePresence>
                {filteredReviews.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {filteredReviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.9 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                        className="group relative bg-white/95 border border-slate-200/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {review.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 text-lg">{review.name}</h3>
                                <div className="flex items-center gap-2">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-slate-500">({review.rating}/5)</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(review.platform)}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReviewToDelete(review)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete review</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>

                          <div className="space-y-3 mb-6">
                            <p className="text-slate-700 leading-relaxed line-clamp-4">{review.message}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {review.date}
                              </span>
                              {review.branchname && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {review.branchname}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {review.replied && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 rounded-full">
                                  <Check className="h-3 w-3 mr-1" />
                                  Replied
                                </Badge>
                              )}
                              {review.platform === "Google" && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 rounded-full">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Google
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {review.phone && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenTemplateDialog(review, "whatsapp")}
                                      className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Send WhatsApp message</TooltipContent>
                                </Tooltip>
                              )}
                              {review.email && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenTemplateDialog(review, "email")}
                                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Send email</TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleReply(review.id)}
                                    className="border-slate-200 hover:bg-slate-50 rounded-xl"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {review.replied ? "Mark as not replied" : "Mark as replied"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FolderOpen className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">No Reviews Found</h3>
                    <p className="text-slate-500 text-lg mb-8">
                      {viewMode === "current"
                        ? "No reviews found for your current subscription period with the selected filters."
                        : "No reviews found from your previous subscription periods with the selected filters."}
                    </p>
                    <Button
                      onClick={handleStartReviewProcess}
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-3 rounded-2xl font-bold text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Get Your First Review
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </main>
        </div>

        {/* DIALOGS */}

        {/* Add-on Dialog */}
        <Dialog open={showAddonDialog} onOpenChange={setShowAddonDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
            <DialogHeader className="text-center pb-8 border-b border-slate-200/60">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
              >
                <Package className="h-10 w-10 text-white" />
              </motion.div>
              <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Reply Credit Packages
              </DialogTitle>
              <DialogDescription className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Purchase reply credits to respond to reviews from your previous subscription periods
              </DialogDescription>
            </DialogHeader>

            <div className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {addonPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                      pkg.popular
                        ? "border-gradient-to-r from-green-400 to-emerald-500 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-lg"
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                          <Crown className="h-4 w-4 inline mr-1" />
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      <div className="text-center mb-8">
                        <div className="text-5xl mb-4">{pkg.icon}</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{pkg.name}</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="text-center mb-8">
                        <div className="text-5xl font-bold text-slate-800 mb-2">{getConvertedPrice(pkg.price)}</div>
                        <div className="text-slate-600 text-lg">{pkg.replies} Reply Credits</div>
                        <div className="text-sm text-slate-500 mt-2">
                          {getConvertedPrice(pkg.price / pkg.replies)} per reply
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-slate-700">
                          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                          <span>Works for WhatsApp & Email replies</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                          <span>Credits never expire</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                          <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                          <span>Only for previous plan reviews</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handlePurchaseAddon(pkg)}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                          pkg.popular
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Purchase Package
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {addonPackages.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No add-on packages available at the moment.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Dialog */}
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
                    <Mail className="h-6 w-6 text-white" />
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

        {/* Custom Template Manager Dialog */}
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
                <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
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
                                <span className="text-white text-sm">{template.type === "whatsapp" ? "📱" : "📧"}</span>
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
                      <SelectContent>
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
                    <SelectContent>
                      <SelectItem value="response">Response Template</SelectItem>
                      <SelectItem value="followup">Follow-up Template</SelectItem>
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
                    placeholder="Use {businessName}, {customerName}, and {rating} as placeholders..."
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Available placeholders: {"{businessName}"}, {"{customerName}"}, {"{rating}"}
                  </p>
                </div>

                <Button
                  onClick={handleSaveCustomTemplate}
                  disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={!!reviewToDelete}
          onClose={() => setReviewToDelete(null)}
          onConfirm={handleDeleteReview}
          title="Delete Review"
          description={`Are you sure you want to delete the review from ${reviewToDelete?.name}? This action cannot be undone.`}
        />
      </div>
    </TooltipProvider>
  )
}
