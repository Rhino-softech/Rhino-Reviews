"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"

interface HowItWorksStep {
  number: string
  title: string
  description: string
}

interface HowItWorksContent {
  title: string
  subtitle: string
  description: string
  demoTitle: string
  demoDescription: string
  demoButtonText: string
  steps: HowItWorksStep[]
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

const defaultContent: HowItWorksContent = {
  title: "How It Works",
  subtitle: "Simple steps to improve your online reputation",
  description: "Our platform makes it easy to collect, manage, and leverage customer reviews to grow your business.",
  demoTitle: "See Rhino Review in action",
  demoDescription: "Schedule a personalized demo to see how Rhino Review can help your business collect more reviews and improve your online reputation.",
  demoButtonText: "Schedule Demo",
  steps: [
    {
      number: "01",
      title: "Connect Your Profiles",
      description: "Connect your business profiles from Google, Facebook, Yelp and 100+ review sites to monitor all reviews in one place."
    },
    {
      number: "02",
      title: "Collect New Reviews",
      description: "Send automated email and SMS campaigns to your customers to collect more positive reviews on sites that matter most to your business."
    },
    {
      number: "03",
      title: "Respond & Manage",
      description: "Respond to all reviews from one dashboard with AI-powered response suggestions to save time and improve customer satisfaction."
    },
    {
      number: "04",
      title: "Showcase & Promote",
      description: "Display your best reviews on your website with customizable widgets and use them in your marketing materials to build trust."
    }
  ]
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  secondaryColor: "#fed7aa",
  accentColor: "#fbbf24",
  backgroundColor: "#ffffff",
  textColor: "#111827"
}

const HowItWorksSection = () => {
  const [content, setContent] = useState<HowItWorksContent>(defaultContent)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const contentDoc = await getDoc(doc(db, "settings", "homeContent"))
      const themeDoc = await getDoc(doc(db, "settings", "homeTheme"))

      if (contentDoc.exists()) {
        const data = contentDoc.data()
        if (data.howItWorks) {
          setContent({ ...defaultContent, ...data.howItWorks })
        }
      }

      if (themeDoc.exists()) {
        setTheme({ ...defaultTheme, ...themeDoc.data() })
      }
    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  return (
    <section id="how-it-works" className="py-20" style={{ backgroundColor: "#f9fafb" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <p className="text-base font-semibold tracking-wide uppercase" style={{ color: theme.primaryColor }}>
            {content.title}
          </p>
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl" style={{ color: theme.textColor }}>
            {content.subtitle}
          </h2>
          <p className="mt-4 max-w-2xl text-xl lg:mx-auto" style={{ color: theme.textColor }}>
            {content.description}
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-x-8">
            {content.steps.map((step) => (
              <div key={step.number} className="relative">
                <div 
                  className="absolute flex items-center justify-center h-16 w-16 rounded-md text-white text-2xl font-bold"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {step.number}
                </div>
                <div className="ml-20">
                  <h3 className="text-lg leading-6 font-medium" style={{ color: theme.textColor }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base" style={{ color: theme.textColor }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 flex justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 pr-0 md:pr-8">
                <h3 className="text-2xl font-bold mb-4" style={{ color: theme.textColor }}>
                  {content.demoTitle}
                </h3>
                <p className="mb-6" style={{ color: theme.textColor }}>
                  {content.demoDescription}
                </p>
                <Link to="/demo">
                  <button 
                    className="text-white font-bold py-3 px-6 rounded-md transition duration-300 hover:opacity-90"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {content.demoButtonText}
                  </button>
                </Link>
              </div>
              <div className="w-full md:w-1/2 mt-8 md:mt-0">
                <div className="p-6 rounded-lg border relative" style={{ backgroundColor: theme.secondaryColor, borderColor: theme.primaryColor + "20" }}>
                  <div 
                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    1
                  </div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>
                    Personal Tour
                  </h4>
                  <p className="text-sm" style={{ color: theme.textColor }}>
                    See all features and learn how they can be customized for your business
                  </p>
                </div>
                <div className="p-6 rounded-lg border mt-4 relative" style={{ backgroundColor: theme.secondaryColor, borderColor: theme.primaryColor + "20" }}>
                  <div 
                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    2
                  </div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>
                    Implementation Plan
                  </h4>
                  <p className="text-sm" style={{ color: theme.textColor }}>
                    Get a custom implementation plan tailored to your business needs
                  </p>
                </div>
                <div className="p-6 rounded-lg border mt-4 relative" style={{ backgroundColor: theme.secondaryColor, borderColor: theme.primaryColor + "20" }}>
                  <div 
                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    3
                  </div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>
                    ROI Calculation
                  </h4>
                  <p className="text-sm" style={{ color: theme.textColor }}>
                    See how much you can increase your business with more positive reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
