"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import ChatSupportWidget from "@/components/chat-support-widget"
import Navbar from "./Navbar"
import ContactPanel from "./ContactPanel"
import ContactWidget from "./ContactWidget"

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

export default function Demo2() {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThemeSettings()
  }, [])

  const loadThemeSettings = async () => {
    try {
      const themeDoc = await getDoc(doc(db, "settings", "homeTheme"))
      
      if (themeDoc.exists()) {
        setTheme({ ...defaultTheme, ...themeDoc.data() })
      }
    } catch (error) {
      console.error("Error loading theme settings:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to convert hex to RGB for gradients
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 234, g: 88, b: 12 } // fallback to orange
  }

  const primaryRgb = hexToRgb(theme.primaryColor)
  const secondaryRgb = hexToRgb(theme.secondaryColor)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${theme.secondaryColor}40 0%, ${theme.backgroundColor} 50%, ${theme.secondaryColor}60 100%)`,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, ${theme.primaryColor} 2px, transparent 0), radial-gradient(circle at 75px 75px, ${theme.primaryColor} 2px, transparent 0)`,
              backgroundSize: "100px 100px",
            }}
          ></div>
        </div>

        <div className="relative z-10 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1
                className="text-5xl font-bold bg-clip-text text-transparent mb-4"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                }}
              >
                Interactive Support Chat
              </h1>
            </div>

            <div
              className="backdrop-blur-sm rounded-2xl shadow-2xl p-8"
              style={{
                backgroundColor: `${theme.backgroundColor}cc`,
                border: `1px solid ${theme.secondaryColor}80`,
              }}
            >
              <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: theme.textColor }}>
                Get Help When You Need It
              </h2>
              <p className="mb-8 text-center text-lg" style={{ color: `${theme.textColor}cc` }}>
                Start a conversation with our support team. Share your questions or concerns, and help us improve by
                providing feedback on your experience.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${theme.secondaryColor}, ${theme.secondaryColor}cc)`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: theme.textColor }}>
                    Open Conversation
                  </h3>
                  <p className="text-sm" style={{ color: `${theme.textColor}dd` }}>
                    Start by telling us about your issue in your own words. No need to select categories first.
                  </p>
                </div>

                <div
                  className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${theme.secondaryColor}, ${theme.secondaryColor}cc)`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: theme.textColor }}>
                    Interactive Support
                  </h3>
                  <p className="text-sm" style={{ color: `${theme.textColor}dd` }}>
                    Engage in real-time conversation with our support system for personalized assistance.
                  </p>
                </div>

                <div
                  className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${theme.secondaryColor}, ${theme.secondaryColor}cc)`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: theme.textColor }}>
                    Share Feedback
                  </h3>
                  <p className="text-sm" style={{ color: `${theme.textColor}dd` }}>
                    After getting help, share your experience to help us continuously improve our support.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${theme.secondaryColor}80, ${theme.accentColor}40)`,
                    border: `1px solid ${theme.secondaryColor}`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    }}
                  ></div>
                  <span className="font-medium" style={{ color: theme.textColor }}>
                    Click the chat button to get started
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContactWidget />
      </div>
    </>
  )
}
