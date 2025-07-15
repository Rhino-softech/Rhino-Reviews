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
  Type,
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
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"
import { motion } from "framer-motion"

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
      const [contentDoc, themeDoc, contactDoc] = await Promise.all([
        getDoc(doc(db, "settings", "homeContent")),
        getDoc(doc(db, "settings", "homeTheme")),
        getDoc(doc(db, "settings", "contactSettings")),
      ])

      if (contentDoc.exists()) {
        setContent({ ...defaultContent, ...contentDoc.data() })
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
        setDoc(doc(db, "settings", "homeTheme"), theme),
        setDoc(doc(db, "settings", "contactSettings"), contactSettings),
        setDoc(doc(db, "settings", "adminTheme"), { primaryColor: theme.primaryColor, textColor: theme.textColor }), // Save textColor for admin layout
      ])

      toast({
        title: "Success",
        description: "Settings saved successfully",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <SimpleAdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
        <motion.div
          className="max-w-7xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="p-4 rounded-3xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)` }}
              >
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h1
                className="text-5xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}
              >
                Home Settings
              </h1>
            </div>
            <p className="text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: theme.textColor }}>
              Customize your website content, appearance, and functionality with our comprehensive management system
            </p>
          </motion.div>

          {/* Action Bar */}
          <motion.div
            className="flex justify-between items-center bg-white/90 border border-slate-200/60 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="flex items-center gap-2"
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {previewMode ? "Exit Preview" : "Preview Changes"}
              </Button>
              <div className="flex items-center gap-2 text-sm text-slate-500" style={{ color: theme.textColor }}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-save enabled
              </div>
            </div>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </motion.div>

          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/90 border border-slate-200/60 rounded-2xl p-2 shadow-lg backdrop-blur-sm">
              <TabsTrigger
                value="content"
                className="flex items-center gap-2 data-[state=active]:shadow-lg transition-all"
              >
                <Type className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="theme"
                className="flex items-center gap-2 data-[state=active]:shadow-lg transition-all"
              >
                <Palette className="w-4 h-4" />
                Theme & Colors
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex items-center gap-2 data-[state=active]:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Hero Section */}
              <Card className="bg-white/90 border border-slate-200/60 shadow-xl backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                    <Star className="w-5 h-5 text-blue-600" />
                    Hero Section
                  </CardTitle>
                  <CardDescription style={{ color: theme.textColor }}>
                    Main banner content and call-to-action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title" className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Title
                      </Label>
                      <Input
                        id="hero-title"
                        value={content.hero.title}
                        onChange={(e) => updateContent("hero", "title", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="hero-subtitle"
                        className="text-sm font-semibold"
                        style={{ color: theme.textColor }}
                      >
                        Subtitle
                      </Label>
                      <Input
                        id="hero-subtitle"
                        value={content.hero.subtitle}
                        onChange={(e) => updateContent("hero", "subtitle", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="hero-description"
                      className="text-sm font-semibold"
                      style={{ color: theme.textColor }}
                    >
                      Description
                    </Label>
                    <Textarea
                      id="hero-description"
                      value={content.hero.description}
                      onChange={(e) => updateContent("hero", "description", e.target.value)}
                      rows={3}
                      className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hero-cta" className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        CTA Button Text
                      </Label>
                      <Input
                        id="hero-cta"
                        value={content.hero.ctaText}
                        onChange={(e) => updateContent("hero", "ctaText", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-demo" className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Demo Button Text
                      </Label>
                      <Input
                        id="hero-demo"
                        value={content.hero.demoText}
                        onChange={(e) => updateContent("hero", "demoText", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                      Animated Messages
                    </Label>
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
                          className="border-2 border-slate-200 rounded-xl focus:border-blue-400 transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How It Works Section */}
              <Card className="bg-white/90 border border-slate-200/60 shadow-xl backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                    <Workflow className="w-5 h-5 text-green-600" />
                    How It Works Section
                  </CardTitle>
                  <CardDescription style={{ color: theme.textColor }}>Step-by-step process explanation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Section Title
                      </Label>
                      <Input
                        value={content.howItWorks.title}
                        onChange={(e) => updateContent("howItWorks", "title", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-green-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Subtitle
                      </Label>
                      <Input
                        value={content.howItWorks.subtitle}
                        onChange={(e) => updateContent("howItWorks", "subtitle", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-green-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                      Description
                    </Label>
                    <Textarea
                      value={content.howItWorks.description}
                      onChange={(e) => updateContent("howItWorks", "description", e.target.value)}
                      rows={2}
                      className="border-2 border-slate-200 rounded-xl focus:border-green-400 transition-colors resize-none"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold" style={{ color: theme.textColor }}>
                        Process Steps
                      </Label>
                      <Button
                        onClick={addHowItWorksStep}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {content.howItWorks.steps.map((step, index) => (
                        <Card
                          key={index}
                          className="p-4 border-2 border-slate-100 hover:border-green-200 transition-colors"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Step {index + 1}
                              </Badge>
                              <Button
                                onClick={() => removeHowItWorksStep(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                                  Number
                                </Label>
                                <Input
                                  value={step.number}
                                  onChange={(e) => {
                                    const newSteps = [...content.howItWorks.steps]
                                    newSteps[index].number = e.target.value
                                    updateContent("howItWorks", "steps", newSteps)
                                  }}
                                  className="border border-slate-200 rounded-lg"
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                                  Title
                                </Label>
                                <Input
                                  value={step.title}
                                  onChange={(e) => {
                                    const newSteps = [...content.howItWorks.steps]
                                    newSteps[index].title = e.target.value
                                    updateContent("howItWorks", "steps", newSteps)
                                  }}
                                  className="border border-slate-200 rounded-lg"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                                Description
                              </Label>
                              <Textarea
                                value={step.description}
                                onChange={(e) => {
                                  const newSteps = [...content.howItWorks.steps]
                                  newSteps[index].description = e.target.value
                                  updateContent("howItWorks", "steps", newSteps)
                                }}
                                rows={2}
                                className="border border-slate-200 rounded-lg resize-none"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold" style={{ color: theme.textColor }}>
                      Demo Section
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                          Demo Title
                        </Label>
                        <Input
                          value={content.howItWorks.demoTitle}
                          onChange={(e) => updateContent("howItWorks", "demoTitle", e.target.value)}
                          className="border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                          Demo Button Text
                        </Label>
                        <Input
                          value={content.howItWorks.demoButtonText}
                          onChange={(e) => updateContent("howItWorks", "demoButtonText", e.target.value)}
                          className="border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                        Demo Description
                      </Label>
                      <Textarea
                        value={content.howItWorks.demoDescription}
                        onChange={(e) => updateContent("howItWorks", "demoDescription", e.target.value)}
                        rows={2}
                        className="border border-slate-200 rounded-lg resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="bg-white/90 border border-slate-200/60 shadow-xl backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                    FAQ Section
                  </CardTitle>
                  <CardDescription style={{ color: theme.textColor }}>
                    Frequently asked questions and answers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Section Title
                      </Label>
                      <Input
                        value={content.faq.title}
                        onChange={(e) => updateContent("faq", "title", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-purple-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Subtitle
                      </Label>
                      <Input
                        value={content.faq.subtitle}
                        onChange={(e) => updateContent("faq", "subtitle", e.target.value)}
                        className="border-2 border-slate-200 rounded-xl focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                      Description
                    </Label>
                    <Textarea
                      value={content.faq.description}
                      onChange={(e) => updateContent("faq", "description", e.target.value)}
                      rows={2}
                      className="border-2 border-slate-200 rounded-xl focus:border-purple-400 transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                      Contact Text
                    </Label>
                    <Input
                      value={content.faq.contactText}
                      onChange={(e) => updateContent("faq", "contactText", e.target.value)}
                      className="border-2 border-slate-200 rounded-xl focus:border-purple-400 transition-colors"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold" style={{ color: theme.textColor }}>
                        FAQ Items
                      </Label>
                      <Button
                        onClick={addFaqItem}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Plus className="w-4 h-4" />
                        Add FAQ
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {content.faq.items.map((item, index) => (
                        <Card
                          key={index}
                          className="p-4 border-2 border-slate-100 hover:border-purple-200 transition-colors"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                FAQ {index + 1}
                              </Badge>
                              <Button
                                onClick={() => removeFaqItem(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                                  Question
                                </Label>
                                <Input
                                  value={item.question}
                                  onChange={(e) => {
                                    const newItems = [...content.faq.items]
                                    newItems[index].question = e.target.value
                                    updateContent("faq", "items", newItems)
                                  }}
                                  className="border border-slate-200 rounded-lg"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium" style={{ color: theme.textColor }}>
                                  Answer
                                </Label>
                                <Textarea
                                  value={item.answer}
                                  onChange={(e) => {
                                    const newItems = [...content.faq.items]
                                    newItems[index].answer = e.target.value
                                    updateContent("faq", "items", newItems)
                                  }}
                                  rows={3}
                                  className="border border-slate-200 rounded-lg resize-none"
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

            <TabsContent value="theme" className="space-y-6">
              <Card className="bg-white/90 border border-slate-200/60 shadow-xl backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                    <Palette className="w-5 h-5 text-orange-600" />
                    Color Theme & Branding
                  </CardTitle>
                  <CardDescription style={{ color: theme.textColor }}>
                    Customize colors for all components and sections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                  {/* Primary Theme Colors */}
                  <div className="space-y-6">
                    <h3
                      className="text-lg font-semibold border-b border-slate-200 pb-2"
                      style={{ color: theme.textColor }}
                    >
                      Primary Theme Colors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Primary Color
                        </Label>
                        <Select
                          value={theme.primaryColor}
                          onValueChange={(value) => updateTheme("primaryColor", value)}
                        >
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span className="font-medium">{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Secondary Color
                        </Label>
                        <Select
                          value={theme.secondaryColor}
                          onValueChange={(value) => updateTheme("secondaryColor", value)}
                        >
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.preview}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.preview }}
                                  />
                                  <span className="font-medium">{color.name} Light</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Accent Color
                        </Label>
                        <Select value={theme.accentColor} onValueChange={(value) => updateTheme("accentColor", value)}>
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span className="font-medium">{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Text Color */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                      Text Color
                    </Label>
                    <Select value={theme.textColor} onValueChange={(value) => updateTheme("textColor", value)}>
                      <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { name: "Dark Gray", value: "#111827" }, // gray-900
                          { name: "Slate 700", value: "#334155" },
                          { name: "Slate 600", value: "#475569" },
                          { name: "Black", value: "#000000" },
                          { name: "White", value: "#ffffff" },
                        ].map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color.value }}
                              />
                              <span
                                className="font-medium"
                                style={{ color: color.value === "#ffffff" ? "#000000" : undefined }}
                              >
                                {color.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Component-Specific Colors */}
                  <div className="space-y-6">
                    <h3
                      className="text-lg font-semibold border-b border-slate-200 pb-2"
                      style={{ color: theme.textColor }}
                    >
                      Component Colors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label
                          className="text-sm font-semibold flex items-center gap-2"
                          style={{ color: theme.textColor }}
                        >
                          <Globe className="w-4 h-4" />
                          Navbar Color
                        </Label>
                        <Select value={theme.navbarColor} onValueChange={(value) => updateTheme("navbarColor", value)}>
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span className="font-medium">{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label
                          className="text-sm font-semibold flex items-center gap-2"
                          style={{ color: theme.textColor }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat Widget Color
                        </Label>
                        <Select
                          value={theme.chatWidgetColor}
                          onValueChange={(value) => updateTheme("chatWidgetColor", value)}
                        >
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span className="font-medium">{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label
                          className="text-sm font-semibold flex items-center gap-2"
                          style={{ color: theme.textColor }}
                        >
                          <Phone className="w-4 h-4" />
                          Contact Widget Color
                        </Label>
                        <Select
                          value={theme.contactWidgetColor}
                          onValueChange={(value) => updateTheme("contactWidgetColor", value)}
                        >
                          <SelectTrigger className="border-2 border-slate-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span className="font-medium">{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Live Preview */}
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold border-b border-slate-200 pb-2"
                      style={{ color: theme.textColor }}
                    >
                      Live Preview
                    </h3>
                    <div
                      className="p-8 rounded-2xl border-2 border-slate-200 shadow-inner"
                      style={{ backgroundColor: theme.backgroundColor }}
                    >
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold" style={{ color: theme.textColor }}>
                          Sample Heading
                        </h3>
                        <p style={{ color: theme.textColor }}>
                          This is how your content will look with the selected theme colors. The preview updates in
                          real-time as you make changes.
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          <Button
                            className="shadow-lg hover:shadow-xl transition-all"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            Primary Button
                          </Button>
                          <Button
                            variant="outline"
                            className="shadow-sm hover:shadow-md transition-all bg-transparent"
                            style={{
                              borderColor: theme.primaryColor,
                              color: theme.primaryColor,
                            }}
                          >
                            Secondary Button
                          </Button>
                          <Button
                            className="shadow-lg hover:shadow-xl transition-all"
                            style={{ backgroundColor: theme.accentColor }}
                          >
                            Accent Button
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-5 h-5 text-2xl" style={{ color: theme.accentColor }}>
                                ★
                              </div>
                            ))}
                          </div>
                          <span style={{ color: theme.textColor }}>5.0 rating</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <div
                            className="p-4 rounded-xl text-center shadow-lg"
                            style={{ backgroundColor: theme.navbarColor, color: "white" }}
                          >
                            <div className="text-sm font-medium">Navbar</div>
                          </div>
                          <div
                            className="p-4 rounded-xl text-center shadow-lg"
                            style={{ backgroundColor: theme.chatWidgetColor, color: "white" }}
                          >
                            <div className="text-sm font-medium">Chat Widget</div>
                          </div>
                          <div
                            className="p-4 rounded-xl text-center shadow-lg"
                            style={{ backgroundColor: theme.contactWidgetColor, color: "white" }}
                          >
                            <div className="text-sm font-medium">Contact Widget</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card className="bg-white/90 border border-slate-200/60 shadow-xl backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription style={{ color: theme.textColor }}>
                    Additional customization options and features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-6">
                    <h3
                      className="text-lg font-semibold border-b border-slate-200 pb-2"
                      style={{ color: theme.textColor }}
                    >
                      Features & Stats Section
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Features Title
                        </Label>
                        <Input
                          value={content.features.title}
                          onChange={(e) => updateContent("features", "title", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Features Subtitle
                        </Label>
                        <Input
                          value={content.features.subtitle}
                          onChange={(e) => updateContent("features", "subtitle", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Features Description
                      </Label>
                      <Textarea
                        value={content.features.description}
                        onChange={(e) => updateContent("features", "description", e.target.value)}
                        rows={2}
                        className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <h3
                      className="text-lg font-semibold border-b border-slate-200 pb-2"
                      style={{ color: theme.textColor }}
                    >
                      Statistics Section
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Stats Title
                        </Label>
                        <Input
                          value={content.stats.title}
                          onChange={(e) => updateContent("stats", "title", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Stats Description
                        </Label>
                        <Input
                          value={content.stats.description}
                          onChange={(e) => updateContent("stats", "description", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {content.stats.items.map((item, index) => (
                        <Card
                          key={index}
                          className="p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
                        >
                          <div className="space-y-3">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                              Stat {index + 1}
                            </Badge>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium" style={{ color: theme.textColor }}>
                                Value
                              </Label>
                              <Input
                                value={item.value}
                                onChange={(e) => {
                                  const newItems = [...content.stats.items]
                                  newItems[index].value = e.target.value
                                  updateContent("stats", "items", newItems)
                                }}
                                className="text-sm border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium" style={{ color: theme.textColor }}>
                                Label
                              </Label>
                              <Input
                                value={item.label}
                                onChange={(e) => {
                                  const newItems = [...content.stats.items]
                                  newItems[index].label = e.target.value
                                  updateContent("stats", "items", newItems)
                                }}
                                className="text-sm border border-slate-200 rounded-lg"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <h3
                      className="text-lg font-semibold border-b border-slate-200 pb-2"
                      style={{ color: theme.textColor }}
                    >
                      Testimonials Section
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Testimonials Title
                        </Label>
                        <Input
                          value={content.testimonials.title}
                          onChange={(e) => updateContent("testimonials", "title", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          Testimonials Subtitle
                        </Label>
                        <Input
                          value={content.testimonials.subtitle}
                          onChange={(e) => updateContent("testimonials", "subtitle", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        Testimonials Description
                      </Label>
                      <Textarea
                        value={content.testimonials.description}
                        onChange={(e) => updateContent("testimonials", "description", e.target.value)}
                        rows={2}
                        className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          CTA Title
                        </Label>
                        <Input
                          value={content.testimonials.ctaTitle}
                          onChange={(e) => updateContent("testimonials", "ctaTitle", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                          CTA Button Text
                        </Label>
                        <Input
                          value={content.testimonials.ctaButtonText}
                          onChange={(e) => updateContent("testimonials", "ctaButtonText", e.target.value)}
                          className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: theme.textColor }}>
                        CTA Description
                      </Label>
                      <Textarea
                        value={content.testimonials.ctaDescription}
                        onChange={(e) => updateContent("testimonials", "ctaDescription", e.target.value)}
                        rows={2}
                        className="border-2 border-slate-200 rounded-xl focus:border-indigo-400 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </SimpleAdminLayout>
  )
}

export default HomeSettings
