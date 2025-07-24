"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"

interface FeatureItem {
  title: string
  description: string
}

interface FeaturesContent {
  title: string
  subtitle: string
  description: string
  items: FeatureItem[]
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

const defaultContent: FeaturesContent = {
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
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  secondaryColor: "#fed7aa",
  accentColor: "#fbbf24",
  backgroundColor: "#ffffff",
  textColor: "#111827",
}

const FeaturesSection = () => {
  const [content, setContent] = useState<FeaturesContent>(defaultContent)
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
        if (data.features) {
          setContent({ ...defaultContent, ...data.features })
        }
      }

      if (themeDoc.exists()) {
        setTheme({ ...defaultTheme, ...themeDoc.data() })
      }
    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const getIcon = (index: number) => {
    const icons = [
      <svg
        key="icon1"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 sm:h-10 sm:w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: theme.primaryColor }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>,
      <svg
        key="icon2"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 sm:h-10 sm:w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: theme.primaryColor }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>,
      <svg
        key="icon3"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 sm:h-10 sm:w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: theme.primaryColor }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>,
      <svg
        key="icon4"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 sm:h-10 sm:w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: theme.primaryColor }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>,
      <svg
        key="icon5"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 sm:h-10 sm:w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: theme.primaryColor }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>,
      <svg
        key="icon6"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 sm:h-10 sm:w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: theme.primaryColor }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>,
    ]
    return icons[index % icons.length]
  }

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20" style={{ backgroundColor: theme.backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center lg:text-center">
          <p
            className="text-sm sm:text-base font-semibold tracking-wide uppercase"
            style={{ color: theme.primaryColor }}
          >
            {content.title}
          </p>
          <h2
            className="mt-2 text-2xl sm:text-3xl lg:text-4xl leading-8 font-extrabold tracking-tight"
            style={{ color: theme.textColor }}
          >
            {content.subtitle}
          </h2>
          <p className="mt-4 max-w-2xl text-lg sm:text-xl lg:mx-auto px-4" style={{ color: theme.textColor }}>
            {content.description}
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.items.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col p-6 sm:p-8 rounded-lg border shadow-sm hover:shadow-lg transition-shadow duration-300"
                style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor + "20" }}
              >
                <div
                  className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full mb-4 sm:mb-5"
                  style={{ backgroundColor: theme.primaryColor + "20" }}
                >
                  {getIcon(index)}
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3" style={{ color: theme.textColor }}>
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base flex-grow leading-relaxed" style={{ color: theme.textColor }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
