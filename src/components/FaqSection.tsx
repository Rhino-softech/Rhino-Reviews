"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqContent {
  title: string
  subtitle: string
  description: string
  contactText: string
  items: FaqItem[]
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

const defaultContent: FaqContent = {
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
    {
      question: "Can I use this for multiple business locations?",
      answer:
        "Yes, Rhino Review supports multi-location businesses. You can monitor all locations from a single dashboard with location-specific analytics.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Yes, we offer mobile apps for iOS and Android so you can monitor and respond to reviews on the go with real-time notifications.",
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

const FaqSection = () => {
  const [content, setContent] = useState<FaqContent>(defaultContent)
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
        if (data.faq) {
          setContent({ ...defaultContent, ...data.faq })
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
    <section id="faq" className="py-20 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <div className="text-left">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
              {content.title}
            </p>
            <h2 className="mt-2 text-4xl font-extrabold" style={{ color: theme.textColor }}>
              {content.subtitle}
            </h2>
            <p className="mt-4 text-lg max-w-md" style={{ color: theme.textColor }}>
              {content.description}
            </p>
          </div>

          {/* Right Column - Accordion */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {content.items.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-lg shadow-sm"
                >
                  <AccordionTrigger
                    className="flex justify-between items-center px-5 py-4 text-left w-full text-lg font-medium transition-colors duration-300 no-underline [&>svg]:hidden"
                    style={{
                      color: theme.textColor,
                      // Apply hover effect using inline style for dynamic color
                      // Note: For more complex hover states, consider a CSS-in-JS library or Tailwind JIT with dynamic properties
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = theme.primaryColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = theme.textColor)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className="ml-2 h-5 w-5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </AccordionTrigger>
                  <AccordionContent
                    className="px-5 pb-4 text-base transition-all duration-500 ease-in-out animate-fade-slide"
                    style={{ color: theme.textColor }}
                  >
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <p style={{ color: theme.textColor }}>{content.contactText}</p>
          <div className="mt-4">
            <button
              className="font-medium hover:opacity-80 flex items-center justify-center mx-auto transition duration-300"
              style={{ color: theme.primaryColor }}
            >
              Contact Support
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .animate-fade-slide {
          animation: fadeSlide 0.4s ease-in-out;
        }

        @keyframes fadeSlide {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}

export default FaqSection
