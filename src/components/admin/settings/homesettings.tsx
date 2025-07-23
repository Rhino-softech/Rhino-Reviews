"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Save,
  Palette,
  Star,
  HelpCircle,
  Settings,
  Workflow,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  Phone,
  MessageCircle,
  Users,
  Target,
  Award,
  Heart,
  BookOpen,
  Grid3X3,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"

interface HomeContent {
  hero: {
    title: string
    subtitle: string
    description: string
    ctaText: string
    demoText: string
    animatedMessages: string[]
  }
  features: {
    title: string
    subtitle: string
    description: string
    items: Array<{
      title: string
      description: string
    }>
  }
  testimonials: {
    title: string
    subtitle: string
    description: string
    ctaTitle: string
    ctaDescription: string
    ctaButtonText: string
    items: Array<{
      name: string
      role: string
      content: string
      stars: number
    }>
  }
  stats: {
    title: string
    description: string
    items: Array<{
      value: string
      label: string
    }>
  }
  howItWorks: {
    title: string
    subtitle: string
    description: string
    demoTitle: string
    demoDescription: string
    demoButtonText: string
    steps: Array<{
      number: string
      title: string
      description: string
    }>
  }
  faq: {
    title: string
    subtitle: string
    description: string
    contactText: string
    items: Array<{
      question: string
      answer: string
    }>
  }
  footer: {
    description: string
    companyName: string
  }
}

interface AboutContent {
  hero: {
    title: string
    subtitle: string
  }
  story: {
    title: string
    content: string[]
    imageUrl: string
    imageAlt: string
  }
  values: Array<{
    title: string
    description: string
    iconColor: string
  }>
  heads: Array<{
    name: string
    role: string
    bio: string
    imageUrl: string
  }>
  team: Array<{
    name: string
    role: string
    bio: string
    imageUrl: string
  }>
  mission: {
    title: string
    description: string
    primaryButtonText: string
    secondaryButtonText: string
    primaryButtonLink: string
    secondaryButtonLink: string
  }
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  navbarColor: string
  chatWidgetColor: string
  contactWidgetColor: string
}

interface ContactSettings {
  phoneNumber: string
  whatsappNumber: string
  enableDemo: boolean
  enableChatSupport: boolean
  enableContactWidget: boolean
}

const defaultContent: HomeContent = {
  hero: {
    title: "Get More",
    subtitle: "5-Star Reviews",
    description:
      "Boost your online reputation with our automated review management platform. Generate positive reviews, respond to negative feedback, and grow your business.",
    ctaText: "Get Started Free",
    demoText: "Schedule Demo",
    animatedMessages: ["5-Star Reviews", "Customer Trust", "Business Growth"],
  },
  features: {
    title: "Features",
    subtitle: "Everything you need to manage your online reputation",
    description:
      "Our platform provides all the tools you need to collect, monitor, and leverage customer reviews to grow your business.",
    items: [
      {
        title: "Review Collection",
        description: "Automate the process of collecting reviews from customers through email and SMS campaigns.",
      },
      {
        title: "Review Monitoring",
        description: "Monitor all your reviews across Google, Facebook, Yelp and 100+ sites in one dashboard.",
      },
      {
        title: "Review Management",
        description:
          "Respond to all reviews from one place and improve your online reputation with AI-powered responses.",
      },
      {
        title: "Widgets & Embeds",
        description:
          "Display your best reviews on your website with customizable review widgets to build trust with potential customers.",
      },
      {
        title: "Review Marketing",
        description: "Leverage your positive reviews in your marketing campaigns to build trust and credibility.",
      },
      {
        title: "Analytics & Reports",
        description: "Get insights into your review performance with detailed analytics and custom reports.",
      },
    ],
  },
  testimonials: {
    title: "Testimonials",
    subtitle: "What our customers are saying",
    description: "Join thousands of businesses that have improved their online reputation with Rhino Review.",
    ctaTitle: "Ready to boost your online reputation?",
    ctaDescription:
      "Join thousands of businesses that use Rhino Review to collect, manage and showcase their customer reviews.",
    ctaButtonText: "Get Started Free",
    items: [
      {
        name: "Sarah Johnson",
        role: "Owner, The Beauty Spa",
        content:
          "Rhino Review has completely transformed our customer feedback process. We've seen a 230% increase in positive reviews within just three months of using the platform.",
        stars: 5,
      },
      {
        name: "Michael Chen",
        role: "Director, Chen's Restaurant Group",
        content:
          "Managing reviews across our 5 restaurant locations used to be a nightmare. Now with Rhino Review, we can monitor and respond to all reviews from one dashboard. Our overall rating has increased from 3.8 to 4.6!",
        stars: 5,
      },
      {
        name: "Jennifer Williams",
        role: "Marketing Manager, City Dental",
        content:
          "The automated review collection campaigns have been a game-changer for us. We're now collecting 5x more reviews than before, and our new patients frequently mention they chose us because of our stellar online reviews.",
        stars: 5,
      },
    ],
  },
  stats: {
    title: "Trusted by businesses worldwide",
    description: "Join thousands of businesses that use Rhino Review to manage their online reputation",
    items: [
      { value: "2M+", label: "Reviews Collected" },
      { value: "10k+", label: "Happy Customers" },
      { value: "34%", label: "Star Rating Increase" },
    ],
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Simple steps to improve your online reputation",
    description: "Our platform makes it easy to collect, manage, and leverage customer reviews to grow your business.",
    demoTitle: "See Rhino Review in action",
    demoDescription:
      "Schedule a personalized demo to see how Rhino Review can help your business collect more reviews and improve your online reputation.",
    demoButtonText: "Schedule Demo",
    steps: [
      {
        number: "01",
        title: "Connect Your Profiles",
        description:
          "Connect your business profiles from Google, Facebook, Yelp and 100+ review sites to monitor all reviews in one place.",
      },
      {
        number: "02",
        title: "Collect New Reviews",
        description:
          "Send automated email and SMS campaigns to your customers to collect more positive reviews on sites that matter most to your business.",
      },
      {
        number: "03",
        title: "Respond & Manage",
        description:
          "Respond to all reviews from one dashboard with AI-powered response suggestions to save time and improve customer satisfaction.",
      },
      {
        number: "04",
        title: "Showcase & Promote",
        description:
          "Display your best reviews on your website with customizable widgets and use them in your marketing materials to build trust.",
      },
    ],
  },
  faq: {
    title: "FAQ",
    subtitle: "Frequently Asked Questions",
    description: "Get answers to the most common questions about Rhino Review.",
    contactText: "Still have questions? Contact our support team for assistance.",
    items: [
      {
        question: "How does Rhino Review help monitor my reviews?",
        answer:
          "Rhino Review provides a centralized dashboard where you can track all your customer reviews from multiple platforms in one place. Get real-time notifications when new reviews are posted.",
      },
      {
        question: "Which review platforms can I monitor?",
        answer:
          "Our dashboard supports all major review platforms including Google, Facebook, Yelp, TripAdvisor, and many industry-specific sites. You can connect all your business profiles for comprehensive monitoring.",
      },
      {
        question: "Can I respond to reviews from the dashboard?",
        answer:
          "Yes, you can view and respond to all your reviews directly from our platform. We provide tools to help you manage your responses efficiently.",
      },
      {
        question: "How do I display reviews on my website?",
        answer:
          "Rhino Review offers simple widgets that you can easily embed on your website to showcase your best reviews. Customize which reviews to display based on rating or platform.",
      },
      {
        question: "Do you offer analytics for my reviews?",
        answer:
          "Yes, our dashboard provides analytics to track your review trends over time, including average ratings, response rates, and platform comparisons.",
      },
      {
        question: "How long does it take to set up?",
        answer:
          "Setup is quick and simple. Just connect your business profiles and you'll start seeing your reviews in the dashboard immediately.",
      },
    ],
  },
  footer: {
    description:
      "Rhino Review helps businesses collect, manage and showcase their customer reviews to improve their online reputation and attract more customers.",
    companyName: "Rhino Review",
  },
}

const defaultAboutContent: AboutContent = {
  hero: {
    title: "About Rhino Review",
    subtitle:
      "We're on a mission to help businesses build stronger relationships with their customers through better review management.",
  },
  story: {
    title: "Our Story",
    content: [
      "Founded in 2020, Rhino Review was born out of frustration with existing review management tools that were either too complex or too limited for growing businesses.",
      "Our founders, having experienced the challenges of managing online reputation firsthand, set out to create a platform that would be powerful enough for enterprises yet simple enough for small businesses.",
      "Today, we serve thousands of businesses worldwide, helping them collect, manage, and leverage customer reviews to drive growth and improve customer satisfaction.",
    ],
    imageUrl: "/placeholder.svg?height=400&width=600",
    imageAlt: "Rhino Review team working together",
  },
  values: [
    {
      title: "Customer First",
      description: "Everything we do is focused on helping our customers succeed and grow their businesses.",
      iconColor: "#3b82f6",
    },
    {
      title: "Innovation",
      description: "We continuously innovate to provide the most advanced review management solutions.",
      iconColor: "#10b981",
    },
    {
      title: "Excellence",
      description: "We strive for excellence in everything we do, from product quality to customer service.",
      iconColor: "#8b5cf6",
    },
    {
      title: "Integrity",
      description: "We operate with transparency, honesty, and ethical business practices in all our interactions.",
      iconColor: "#ef4444",
    },
  ],
  heads: [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      imageUrl: "/placeholder.svg?height=300&width=300",
      bio: "Former VP of Marketing at a Fortune 500 company with 15 years of experience in customer experience and reputation management.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      imageUrl: "/placeholder.svg?height=300&width=300",
      bio: "Ex-Google engineer with expertise in machine learning and large-scale data processing systems.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      imageUrl: "/placeholder.svg?height=300&width=300",
      bio: "Product leader with 10+ years building SaaS platforms for small and medium businesses.",
    },
  ],
  team: [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      imageUrl: "/placeholder.svg?height=300&width=300",
      bio: "Former VP of Marketing at a Fortune 500 company with 15 years of experience in customer experience and reputation management.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      imageUrl: "/placeholder.svg?height=300&width=300",
      bio: "Ex-Google engineer with expertise in machine learning and large-scale data processing systems.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      imageUrl: "/placeholder.svg?height=300&width=300",
      bio: "Product leader with 10+ years building SaaS platforms for small and medium businesses.",
    },
    {
      name: "David Kim",
      role: "Head of Customer Success",
      imageUrl: "/placeholder.svg?height=300&width=300",
      bio: "Customer success expert who has helped thousands of businesses improve their online reputation and customer relationships.",
    },
  ],
  mission: {
    title: "Join Our Mission",
    description: "We're always looking for talented individuals who share our passion for helping businesses succeed.",
    primaryButtonText: "View Open Positions",
    secondaryButtonText: "Contact us",
    primaryButtonLink: "/careers",
    secondaryButtonLink: "/demo2",
  },
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c", // orange-600
  secondaryColor: "#fed7aa", // orange-200
  accentColor: "#fbbf24", // yellow-400
  backgroundColor: "#ffffff",
  textColor: "#111827", // gray-900
  borderColor: "#d1d5db", // gray-300
  navbarColor: "#ea580c",
  chatWidgetColor: "#ea580c",
  contactWidgetColor: "#ea580c",
}

const defaultContactSettings: ContactSettings = {
  phoneNumber: "+1 234 567 8900",
  whatsappNumber: "+1234567890",
  enableDemo: true,
  enableChatSupport: true,
  enableContactWidget: true,
}

const colorOptions = [
  { name: "Orange", value: "#ea580c", preview: "#fed7aa" },
  { name: "Blue", value: "#2563eb", preview: "#bfdbfe" },
  { name: "Green", value: "#16a34a", preview: "#bbf7d0" },
  { name: "Purple", value: "#9333ea", preview: "#ddd6fe" },
  { name: "Red", value: "#dc2626", preview: "#fecaca" },
  { name: "Pink", value: "#db2777", preview: "#fbcfe8" },
  { name: "Teal", value: "#0d9488", preview: "#99f6e4" },
  { name: "Indigo", value: "#4f46e5", preview: "#c7d2fe" },
  { name: "Yellow", value: "#eab308", preview: "#fef3c7" },
  { name: "Emerald", value: "#059669", preview: "#a7f3d0" },
  { name: "Cyan", value: "#0891b2", preview: "#a5f3fc" },
  { name: "Rose", value: "#e11d48", preview: "#fda4af" },
]

export function HomeSettings() {
  const [content, setContent] = useState<HomeContent>(defaultContent)
  const [aboutContent, setAboutContent] = useState<AboutContent>(defaultAboutContent)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [contactSettings, setContactSettings] = useState<ContactSettings>(defaultContactSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const [contentDoc, aboutDoc, themeDoc, contactDoc] = await Promise.all([
        getDoc(doc(db, "settings", "homeContent")),
        getDoc(doc(db, "settings", "aboutContent")),
        getDoc(doc(db, "settings", "homeTheme")),
        getDoc(doc(db, "settings", "contactSettings")),
      ])

      if (contentDoc.exists()) {
        setContent({ ...defaultContent, ...contentDoc.data() })
      }

      if (aboutDoc.exists()) {
        setAboutContent({ ...defaultAboutContent, ...aboutDoc.data() })
      }

      if (themeDoc.exists()) {
        setTheme({ ...defaultTheme, ...themeDoc.data() })
      }

      if (contactDoc.exists()) {
        setContactSettings({ ...defaultContactSettings, ...contactDoc.data() })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await Promise.all([
        setDoc(doc(db, "settings", "homeContent"), content),
        setDoc(doc(db, "settings", "aboutContent"), aboutContent),
        setDoc(doc(db, "settings", "homeTheme"), theme),
        setDoc(doc(db, "settings", "contactSettings"), contactSettings),
        setDoc(doc(db, "settings", "adminTheme"), { primaryColor: theme.primaryColor, textColor: theme.textColor }),
      ])

      toast({
        title: "✨ Success",
        description: "All settings saved successfully! Changes will reflect across Home, About, and Demo2 pages.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (section: keyof HomeContent, field: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const updateAboutContent = (section: keyof AboutContent, field: string, value: any) => {
    setAboutContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const updateTheme = (field: keyof ThemeSettings, value: string) => {
    setTheme((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateContactSettings = (field: keyof ContactSettings, value: any) => {
    setContactSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addFeatureItem = () => {
    const newFeature = {
      title: "New Feature",
      description: "Feature description here...",
    }
    updateContent("features", "items", [...content.features.items, newFeature])
  }

  const removeFeatureItem = (index: number) => {
    const newItems = content.features.items.filter((_, i) => i !== index)
    updateContent("features", "items", newItems)
  }

  const addFaqItem = () => {
    const newFaq = {
      question: "New question?",
      answer: "New answer here...",
    }
    updateContent("faq", "items", [...content.faq.items, newFaq])
  }

  const removeFaqItem = (index: number) => {
    const newItems = content.faq.items.filter((_, i) => i !== index)
    updateContent("faq", "items", newItems)
  }

  const addHowItWorksStep = () => {
    const newStep = {
      number: String(content.howItWorks.steps.length + 1).padStart(2, "0"),
      title: "New Step",
      description: "Step description here...",
    }
    updateContent("howItWorks", "steps", [...content.howItWorks.steps, newStep])
  }

  const removeHowItWorksStep = (index: number) => {
    const newSteps = content.howItWorks.steps.filter((_, i) => i !== index)
    updateContent("howItWorks", "steps", newSteps)
  }

  const addTeamMember = (section: "heads" | "team") => {
    const newMember = {
      name: "New Team Member",
      role: "Position",
      bio: "Bio description here...",
      imageUrl: "/placeholder.svg?height=300&width=300",
    }
    if (section === "heads") {
      setAboutContent((prev) => ({ ...prev, heads: [...prev.heads, newMember] }))
    } else {
      setAboutContent((prev) => ({ ...prev, team: [...prev.team, newMember] }))
    }
  }

  const removeTeamMember = (section: "heads" | "team", index: number) => {
    if (section === "heads") {
      setAboutContent((prev) => ({ ...prev, heads: prev.heads.filter((_, i) => i !== index) }))
    } else {
      setAboutContent((prev) => ({ ...prev, team: prev.team.filter((_, i) => i !== index) }))
    }
  }

  if (loading) {
    return (
      <SimpleAdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </SimpleAdminLayout>
    )
  }

  return (
    <SimpleAdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="p-3 rounded-2xl shadow-lg" style={{ backgroundColor: theme.primaryColor }}>
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-center"
                style={{ color: theme.primaryColor }}
              >
                Content Management
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Manage your website content, themes, and settings from one centralized dashboard
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Button
                  onClick={() => setPreviewMode(!previewMode)}
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="default"
                >
                  {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {previewMode ? "Exit Preview" : "Live Preview"}
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Auto-save enabled</span>
                </div>
              </div>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="shadow-lg w-full sm:w-auto"
                style={{ backgroundColor: theme.primaryColor }}
                size="default"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="home" className="space-y-6">
            <div className="bg-white rounded-2xl p-2 shadow-lg">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent gap-1 h-auto">
                <TabsTrigger
                  value="home"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-3 sm:py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Star className="w-4 h-4" />
                  <span className="text-center">Home</span>
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-3 sm:py-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-center">About</span>
                </TabsTrigger>
                <TabsTrigger
                  value="theme"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-3 sm:py-2 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700"
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-center">Theme</span>
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-3 sm:py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-center">More</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Home Content Tab */}
            <TabsContent value="home" className="space-y-6">
              {/* Hero Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Star className="w-5 h-5 text-blue-600" />
                    Hero Section
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Main banner content and call-to-action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title" className="text-sm font-semibold">
                        Title
                      </Label>
                      <Input
                        id="hero-title"
                        value={content.hero.title}
                        onChange={(e) => updateContent("hero", "title", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle" className="text-sm font-semibold">
                        Subtitle
                      </Label>
                      <Input
                        id="hero-subtitle"
                        value={content.hero.subtitle}
                        onChange={(e) => updateContent("hero", "subtitle", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-description" className="text-sm font-semibold">
                      Description
                    </Label>
                    <Textarea
                      id="hero-description"
                      value={content.hero.description}
                      onChange={(e) => updateContent("hero", "description", e.target.value)}
                      rows={3}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hero-cta" className="text-sm font-semibold">
                        CTA Button Text
                      </Label>
                      <Input
                        id="hero-cta"
                        value={content.hero.ctaText}
                        onChange={(e) => updateContent("hero", "ctaText", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-demo" className="text-sm font-semibold">
                        Demo Button Text
                      </Label>
                      <Input
                        id="hero-demo"
                        value={content.hero.demoText}
                        onChange={(e) => updateContent("hero", "demoText", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Animated Messages</Label>
                    <div className="space-y-3">
                      {content.hero.animatedMessages.map((message, index) => (
                        <Input
                          key={index}
                          value={message}
                          onChange={(e) => {
                            const newMessages = [...content.hero.animatedMessages]
                            newMessages[index] = e.target.value
                            updateContent("hero", "animatedMessages", newMessages)
                          }}
                          placeholder={`Message ${index + 1}`}
                          className="rounded-xl h-11"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Grid3X3 className="w-5 h-5 text-orange-600" />
                    Features Section
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage feature items and section content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Section Title</Label>
                      <Input
                        value={content.features.title}
                        onChange={(e) => updateContent("features", "title", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Subtitle</Label>
                      <Input
                        value={content.features.subtitle}
                        onChange={(e) => updateContent("features", "subtitle", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea
                      value={content.features.description}
                      onChange={(e) => updateContent("features", "description", e.target.value)}
                      rows={2}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <Label className="text-base font-semibold">Feature Items</Label>
                      <Button
                        onClick={addFeatureItem}
                        variant="outline"
                        size="default"
                        className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add Feature
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {content.features.items.map((feature, index) => (
                        <Card key={index} className="p-4 border-2 border-gray-100">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                Feature {index + 1}
                              </Badge>
                              <Button
                                onClick={() => removeFeatureItem(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Feature Title</Label>
                                <Input
                                  value={feature.title}
                                  onChange={(e) => {
                                    const newItems = [...content.features.items]
                                    newItems[index].title = e.target.value
                                    updateContent("features", "items", newItems)
                                  }}
                                  className="rounded-lg h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Feature Description</Label>
                                <Textarea
                                  value={feature.description}
                                  onChange={(e) => {
                                    const newItems = [...content.features.items]
                                    newItems[index].description = e.target.value
                                    updateContent("features", "items", newItems)
                                  }}
                                  rows={3}
                                  className="rounded-lg resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How It Works Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Workflow className="w-5 h-5 text-green-600" />
                    How It Works Section
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Step-by-step process explanation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Section Title</Label>
                      <Input
                        value={content.howItWorks.title}
                        onChange={(e) => updateContent("howItWorks", "title", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Subtitle</Label>
                      <Input
                        value={content.howItWorks.subtitle}
                        onChange={(e) => updateContent("howItWorks", "subtitle", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea
                      value={content.howItWorks.description}
                      onChange={(e) => updateContent("howItWorks", "description", e.target.value)}
                      rows={2}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <Label className="text-base font-semibold">Process Steps</Label>
                      <Button
                        onClick={addHowItWorksStep}
                        variant="outline"
                        size="default"
                        className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {content.howItWorks.steps.map((step, index) => (
                        <Card key={index} className="p-4 border-2 border-gray-100">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Step {index + 1}
                              </Badge>
                              <Button
                                onClick={() => removeHowItWorksStep(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Number</Label>
                                <Input
                                  value={step.number}
                                  onChange={(e) => {
                                    const newSteps = [...content.howItWorks.steps]
                                    newSteps[index].number = e.target.value
                                    updateContent("howItWorks", "steps", newSteps)
                                  }}
                                  className="rounded-lg h-10"
                                />
                              </div>
                              <div className="space-y-2 lg:col-span-2">
                                <Label className="text-sm font-medium">Title</Label>
                                <Input
                                  value={step.title}
                                  onChange={(e) => {
                                    const newSteps = [...content.howItWorks.steps]
                                    newSteps[index].title = e.target.value
                                    updateContent("howItWorks", "steps", newSteps)
                                  }}
                                  className="rounded-lg h-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Description</Label>
                              <Textarea
                                value={step.description}
                                onChange={(e) => {
                                  const newSteps = [...content.howItWorks.steps]
                                  newSteps[index].description = e.target.value
                                  updateContent("howItWorks", "steps", newSteps)
                                }}
                                rows={2}
                                className="rounded-lg resize-none"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                    FAQ Section
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Frequently asked questions and answers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Section Title</Label>
                      <Input
                        value={content.faq.title}
                        onChange={(e) => updateContent("faq", "title", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Subtitle</Label>
                      <Input
                        value={content.faq.subtitle}
                        onChange={(e) => updateContent("faq", "subtitle", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea
                      value={content.faq.description}
                      onChange={(e) => updateContent("faq", "description", e.target.value)}
                      rows={2}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <Label className="text-base font-semibold">FAQ Items</Label>
                      <Button
                        onClick={addFaqItem}
                        variant="outline"
                        size="default"
                        className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add FAQ
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {content.faq.items.map((item, index) => (
                        <Card key={index} className="p-4 border-2 border-gray-100">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                FAQ {index + 1}
                              </Badge>
                              <Button
                                onClick={() => removeFaqItem(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Question</Label>
                                <Input
                                  value={item.question}
                                  onChange={(e) => {
                                    const newItems = [...content.faq.items]
                                    newItems[index].question = e.target.value
                                    updateContent("faq", "items", newItems)
                                  }}
                                  className="rounded-lg h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Answer</Label>
                                <Textarea
                                  value={item.answer}
                                  onChange={(e) => {
                                    const newItems = [...content.faq.items]
                                    newItems[index].answer = e.target.value
                                    updateContent("faq", "items", newItems)
                                  }}
                                  rows={3}
                                  className="rounded-lg resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Content Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* About Hero Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    About Page Hero
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Main about page header content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Page Title</Label>
                      <Input
                        value={aboutContent.hero.title}
                        onChange={(e) => updateAboutContent("hero", "title", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Subtitle/Mission Statement</Label>
                      <Textarea
                        value={aboutContent.hero.subtitle}
                        onChange={(e) => updateAboutContent("hero", "subtitle", e.target.value)}
                        rows={3}
                        className="rounded-xl resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Story Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    Our Story Section
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Company background and history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Section Title</Label>
                      <Input
                        value={aboutContent.story.title}
                        onChange={(e) => updateAboutContent("story", "title", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Story Content (Paragraphs)</Label>
                      <div className="space-y-3">
                        {aboutContent.story.content.map((paragraph, index) => (
                          <Textarea
                            key={index}
                            value={paragraph}
                            onChange={(e) => {
                              const newContent = [...aboutContent.story.content]
                              newContent[index] = e.target.value
                              updateAboutContent("story", "content", newContent)
                            }}
                            rows={3}
                            placeholder={`Paragraph ${index + 1}`}
                            className="rounded-xl resize-none"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Image URL</Label>
                        <Input
                          value={aboutContent.story.imageUrl}
                          onChange={(e) => updateAboutContent("story", "imageUrl", e.target.value)}
                          className="rounded-xl h-11"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Image Alt Text</Label>
                        <Input
                          value={aboutContent.story.imageAlt}
                          onChange={(e) => updateAboutContent("story", "imageAlt", e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Values Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Target className="w-5 h-5 text-purple-600" />
                    Company Values
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Core values and principles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {aboutContent.values.map((value, index) => (
                      <Card key={index} className="p-4 border-2 border-gray-100">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            {index === 0 && <Users className="w-5 h-5" style={{ color: value.iconColor }} />}
                            {index === 1 && <Target className="w-5 h-5" style={{ color: value.iconColor }} />}
                            {index === 2 && <Award className="w-5 h-5" style={{ color: value.iconColor }} />}
                            {index === 3 && <Heart className="w-5 h-5" style={{ color: value.iconColor }} />}
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              Value {index + 1}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Title</Label>
                              <Input
                                value={value.title}
                                onChange={(e) => {
                                  const newValues = [...aboutContent.values]
                                  newValues[index].title = e.target.value
                                  setAboutContent((prev) => ({ ...prev, values: newValues }))
                                }}
                                className="rounded-lg h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Description</Label>
                              <Textarea
                                value={value.description}
                                onChange={(e) => {
                                  const newValues = [...aboutContent.values]
                                  newValues[index].description = e.target.value
                                  setAboutContent((prev) => ({ ...prev, values: newValues }))
                                }}
                                rows={3}
                                className="rounded-lg resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Icon Color</Label>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="color"
                                  value={value.iconColor}
                                  onChange={(e) => {
                                    const newValues = [...aboutContent.values]
                                    newValues[index].iconColor = e.target.value
                                    setAboutContent((prev) => ({ ...prev, values: newValues }))
                                  }}
                                  className="w-16 h-10 rounded-lg cursor-pointer"
                                />
                                <Input
                                  value={value.iconColor}
                                  onChange={(e) => {
                                    const newValues = [...aboutContent.values]
                                    newValues[index].iconColor = e.target.value
                                    setAboutContent((prev) => ({ ...prev, values: newValues }))
                                  }}
                                  className="flex-1 rounded-lg h-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* About Heads Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="w-5 h-5 text-orange-600" />
                    Meet Our Heads
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Leadership team section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <Label className="text-base font-semibold">Leadership Members</Label>
                    <Button
                      onClick={() => addTeamMember("heads")}
                      variant="outline"
                      size="default"
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Head
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {aboutContent.heads.map((member, index) => (
                      <Card key={index} className="p-4 border-2 border-gray-100">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Head {index + 1}
                            </Badge>
                            <Button
                              onClick={() => removeTeamMember("heads", index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Name</Label>
                              <Input
                                value={member.name}
                                onChange={(e) => {
                                  const newHeads = [...aboutContent.heads]
                                  newHeads[index].name = e.target.value
                                  setAboutContent((prev) => ({ ...prev, heads: newHeads }))
                                }}
                                className="rounded-lg h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Role/Position</Label>
                              <Input
                                value={member.role}
                                onChange={(e) => {
                                  const newHeads = [...aboutContent.heads]
                                  newHeads[index].role = e.target.value
                                  setAboutContent((prev) => ({ ...prev, heads: newHeads }))
                                }}
                                className="rounded-lg h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Bio</Label>
                              <Textarea
                                value={member.bio}
                                onChange={(e) => {
                                  const newHeads = [...aboutContent.heads]
                                  newHeads[index].bio = e.target.value
                                  setAboutContent((prev) => ({ ...prev, heads: newHeads }))
                                }}
                                rows={3}
                                className="rounded-lg resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Image URL</Label>
                              <Input
                                value={member.imageUrl}
                                onChange={(e) => {
                                  const newHeads = [...aboutContent.heads]
                                  newHeads[index].imageUrl = e.target.value
                                  setAboutContent((prev) => ({ ...prev, heads: newHeads }))
                                }}
                                className="rounded-lg h-10"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* About Team Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="w-5 h-5 text-teal-600" />
                    Meet Our Team
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Full team members section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <Label className="text-base font-semibold">Team Members</Label>
                    <Button
                      onClick={() => addTeamMember("team")}
                      variant="outline"
                      size="default"
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {aboutContent.team.map((member, index) => (
                      <Card key={index} className="p-4 border-2 border-gray-100">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                              Member {index + 1}
                            </Badge>
                            <Button
                              onClick={() => removeTeamMember("team", index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Name</Label>
                              <Input
                                value={member.name}
                                onChange={(e) => {
                                  const newTeam = [...aboutContent.team]
                                  newTeam[index].name = e.target.value
                                  setAboutContent((prev) => ({ ...prev, team: newTeam }))
                                }}
                                className="rounded-lg h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Role/Position</Label>
                              <Input
                                value={member.role}
                                onChange={(e) => {
                                  const newTeam = [...aboutContent.team]
                                  newTeam[index].role = e.target.value
                                  setAboutContent((prev) => ({ ...prev, team: newTeam }))
                                }}
                                className="rounded-lg h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Bio</Label>
                              <Textarea
                                value={member.bio}
                                onChange={(e) => {
                                  const newTeam = [...aboutContent.team]
                                  newTeam[index].bio = e.target.value
                                  setAboutContent((prev) => ({ ...prev, team: newTeam }))
                                }}
                                rows={3}
                                className="rounded-lg resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Image URL</Label>
                              <Input
                                value={member.imageUrl}
                                onChange={(e) => {
                                  const newTeam = [...aboutContent.team]
                                  newTeam[index].imageUrl = e.target.value
                                  setAboutContent((prev) => ({ ...prev, team: newTeam }))
                                }}
                                className="rounded-lg h-10"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* About Mission Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Join Our Mission Section
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Call-to-action and career opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Section Title</Label>
                      <Input
                        value={aboutContent.mission.title}
                        onChange={(e) => updateAboutContent("mission", "title", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Description</Label>
                      <Textarea
                        value={aboutContent.mission.description}
                        onChange={(e) => updateAboutContent("mission", "description", e.target.value)}
                        rows={2}
                        className="rounded-xl resize-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Primary Button Text</Label>
                      <Input
                        value={aboutContent.mission.primaryButtonText}
                        onChange={(e) => updateAboutContent("mission", "primaryButtonText", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Secondary Button Text</Label>
                      <Input
                        value={aboutContent.mission.secondaryButtonText}
                        onChange={(e) => updateAboutContent("mission", "secondaryButtonText", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Primary Button Link</Label>
                      <Input
                        value={aboutContent.mission.primaryButtonLink}
                        onChange={(e) => updateAboutContent("mission", "primaryButtonLink", e.target.value)}
                        className="rounded-xl h-11"
                        placeholder="/careers"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Secondary Button Link</Label>
                      <Input
                        value={aboutContent.mission.secondaryButtonLink}
                        onChange={(e) => updateAboutContent("mission", "secondaryButtonLink", e.target.value)}
                        className="rounded-xl h-11"
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Palette className="w-5 h-5 text-pink-600" />
                    Color Theme & Branding
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Customize colors for all components and sections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-4 sm:p-6">
                  {/* Quick Color Themes */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Quick Color Themes</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {colorOptions.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            updateTheme("primaryColor", color.value)
                            updateTheme("secondaryColor", color.preview)
                            updateTheme("navbarColor", color.value)
                            updateTheme("chatWidgetColor", color.value)
                            updateTheme("contactWidgetColor", color.value)
                          }}
                          className={`group relative p-3 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                            theme.primaryColor === color.value ? "ring-2 ring-offset-2" : ""
                          }`}
                          style={{
                            backgroundColor: color.preview + "40",
                            borderColor: color.value + (theme.primaryColor === color.value ? "ff" : "40"),
                            ringColor: color.value,
                          }}
                        >
                          <div className="space-y-2">
                            <div
                              className="w-8 h-8 rounded-xl mx-auto shadow-sm"
                              style={{ backgroundColor: color.value }}
                            />
                            <div className="text-center">
                              <div className="text-xs font-semibold">{color.name}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Primary Theme Colors */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Primary Theme Colors</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Primary Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) => updateTheme("primaryColor", e.target.value)}
                            className="w-16 h-12 rounded-xl cursor-pointer"
                          />
                          <Input
                            value={theme.primaryColor}
                            onChange={(e) => updateTheme("primaryColor", e.target.value)}
                            className="flex-1 rounded-xl h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Secondary Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={theme.secondaryColor}
                            onChange={(e) => updateTheme("secondaryColor", e.target.value)}
                            className="w-16 h-12 rounded-xl cursor-pointer"
                          />
                          <Input
                            value={theme.secondaryColor}
                            onChange={(e) => updateTheme("secondaryColor", e.target.value)}
                            className="flex-1 rounded-xl h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Accent Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={theme.accentColor}
                            onChange={(e) => updateTheme("accentColor", e.target.value)}
                            className="w-16 h-12 rounded-xl cursor-pointer"
                          />
                          <Input
                            value={theme.accentColor}
                            onChange={(e) => updateTheme("accentColor", e.target.value)}
                            className="flex-1 rounded-xl h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Live Preview */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Live Preview</Label>
                    <div
                      className="p-6 rounded-2xl border-2 space-y-4"
                      style={{
                        backgroundColor: theme.backgroundColor,
                        borderColor: theme.borderColor,
                      }}
                    >
                      <h3 className="text-2xl font-bold" style={{ color: theme.textColor }}>
                        Sample Heading
                      </h3>
                      <p className="text-base" style={{ color: theme.textColor + "cc" }}>
                        This is how your content will look with the selected theme colors. The preview updates in
                        real-time as you make changes.
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <Button className="shadow-lg" style={{ backgroundColor: theme.primaryColor, color: "white" }}>
                          Primary Button
                        </Button>
                        <Button
                          variant="outline"
                          className="shadow-sm bg-transparent"
                          style={{
                            borderColor: theme.primaryColor,
                            color: theme.primaryColor,
                          }}
                        >
                          Secondary Button
                        </Button>
                        <Button className="shadow-lg" style={{ backgroundColor: theme.accentColor, color: "white" }}>
                          Accent Button
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Phone className="w-5 h-5 text-indigo-600" />
                    Contact Settings
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Configure contact information and widget settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        value={contactSettings.phoneNumber}
                        onChange={(e) => updateContactSettings("phoneNumber", e.target.value)}
                        className="rounded-xl h-11"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">WhatsApp Number</Label>
                      <Input
                        value={contactSettings.whatsappNumber}
                        onChange={(e) => updateContactSettings("whatsappNumber", e.target.value)}
                        className="rounded-xl h-11"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Widget Settings</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {[
                        { key: "enableDemo", label: "Enable Demo Booking", icon: Eye },
                        { key: "enableChatSupport", label: "Enable Chat Support", icon: MessageCircle },
                        { key: "enableContactWidget", label: "Enable Contact Widget", icon: Phone },
                      ].map((setting) => (
                        <div key={setting.key} className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <setting.icon className="w-4 h-4" style={{ color: theme.primaryColor }} />
                              <Label className="font-semibold text-sm">{setting.label}</Label>
                            </div>
                            <Select
                              value={contactSettings[setting.key as keyof ContactSettings] ? "enabled" : "disabled"}
                              onValueChange={(value) =>
                                updateContactSettings(setting.key as keyof ContactSettings, value === "enabled")
                              }
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enabled">On</SelectItem>
                                <SelectItem value="disabled">Off</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Status Footer */}
          <div className="text-center py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                <span>Auto-sync enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Updates reflect on all pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleAdminLayout>
  )
}

export default HomeSettings
