"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import img from "./assets/images.png"

interface TestimonialItem {
  name: string
  role: string
  content: string
  image: string
  stars: number
}

interface TestimonialsContent {
  title: string
  subtitle: string
  description: string
  ctaTitle: string
  ctaDescription: string
  ctaButtonText: string
  items: TestimonialItem[]
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

const defaultContent: TestimonialsContent = {
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
      image: img,
      stars: 5,
    },
    {
      name: "Michael Chen",
      role: "Director, Chen's Restaurant Group",
      content:
        "Managing reviews across our 5 restaurant locations used to be a nightmare. Now with Rhino Review, we can monitor and respond to all reviews from one dashboard. Our overall rating has increased from 3.8 to 4.6!",
      image: img,
      stars: 5,
    },
    {
      name: "Jennifer Williams",
      role: "Marketing Manager, City Dental",
      content:
        "The automated review collection campaigns have been a game-changer for us. We're now collecting 5x more reviews than before, and our new patients frequently mention they chose us because of our stellar online reviews.",
      image: img,
      stars: 5,
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

const TestimonialSection = () => {
  const [content, setContent] = useState<TestimonialsContent>(defaultContent)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [activeIndex, setActiveIndex] = useState(0)
  const [fadeSlide, setFadeSlide] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      goToIndex((activeIndex + 1) % content.items.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [activeIndex, content.items.length])

  const loadContent = async () => {
    try {
      const contentDoc = await getDoc(doc(db, "settings", "homeContent"))
      const themeDoc = await getDoc(doc(db, "settings", "homeTheme"))

      if (contentDoc.exists()) {
        const data = contentDoc.data()
        if (data.testimonials) {
          setContent({ ...defaultContent, ...data.testimonials })
        }
      }

      if (themeDoc.exists()) {
        setTheme({ ...defaultTheme, ...themeDoc.data() })
      }
    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const goToIndex = (index: number) => {
    setFadeSlide(false)
    setTimeout(() => {
      setActiveIndex(index)
      setFadeSlide(true)
    }, 300)
  }

  return (
    <section id="testimonials" className="py-20" style={{ backgroundColor: theme.backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <p className="text-base font-semibold tracking-wide uppercase" style={{ color: theme.primaryColor }}>
            {content.title}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: theme.textColor }}>
            {content.subtitle}
          </h2>
          <p className="mt-4 max-w-2xl text-xl lg:mx-auto" style={{ color: theme.textColor }}>
            {content.description}
          </p>
        </div>

        <div className="relative">
          <div
            className={`transition-all duration-700 transform ${
              fadeSlide ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}
          >
            <div
              className="rounded-lg shadow-xl p-8 border flex flex-col md:flex-row items-center"
              style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor + "20" }}
            >
              <div className="md:w-1/3 flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={content.items[activeIndex]?.name || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-2/3 mt-6 md:mt-0">
                <div className="flex mb-2">
                  {[...Array(content.items[activeIndex]?.stars || 5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style={{ color: theme.accentColor }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg italic mb-4" style={{ color: theme.textColor }}>
                  "{content.items[activeIndex]?.content || ""}"
                </blockquote>
                <div className="font-medium">
                  <div style={{ color: theme.primaryColor }}>{content.items[activeIndex]?.name || ""}</div>
                  <div style={{ color: theme.textColor }}>{content.items[activeIndex]?.role || ""}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6 space-x-3">
            {content.items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-3 w-3 rounded-full transition-colors duration-300`}
                style={{
                  backgroundColor: index === activeIndex ? theme.primaryColor : "#d1d5db",
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-lg p-8 shadow-inner" style={{ backgroundColor: theme.primaryColor + "10" }}>
          <div className="text-center">
            <h3 className="text-2xl font-bold" style={{ color: theme.textColor }}>
              {content.ctaTitle}
            </h3>
            <p className="mt-4 max-w-3xl mx-auto" style={{ color: theme.textColor }}>
              {content.ctaDescription}
            </p>
            <Link to="/register">
              <Button className="mt-8 px-8 py-3 text-lg" style={{ backgroundColor: theme.primaryColor }}>
                {content.ctaButtonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection
