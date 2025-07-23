"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"

interface StatItem {
  value: string
  label: string
}

interface StatsContent {
  title: string
  description: string
  items: StatItem[]
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

const defaultContent: StatsContent = {
  title: "Trusted by businesses worldwide",
  description: "Join thousands of businesses that use Rhino Review to manage their online reputation",
  items: [
    { value: "2M+", label: "Reviews Collected" },
    { value: "10k+", label: "Happy Customers" },
    { value: "34%", label: "Star Rating Increase" },
  ],
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  secondaryColor: "#fed7aa",
  accentColor: "#fbbf24",
  backgroundColor: "#ffffff",
  textColor: "#111827",
}

const StatsSection = () => {
  const [content, setContent] = useState<StatsContent>(defaultContent)
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
        if (data.stats) {
          setContent({ ...defaultContent, ...data.stats })
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
    <div style={{ backgroundColor: theme.primaryColor }}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{content.title}</h2>
          <p className="mt-3 text-xl sm:mt-4" style={{ color: theme.secondaryColor }}>
            {content.description}
          </p>
        </div>
        <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
          {content.items.map((item, index) => (
            <div key={index} className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium" style={{ color: theme.secondaryColor }}>
                {item.label}
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default StatsSection
