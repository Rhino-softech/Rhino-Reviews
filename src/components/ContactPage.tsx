"use client"

import React ,{ useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase/firebase"
import ContactPanel from "./components/ContactPanel"
import { motion } from "framer-motion"
import Navbar from "./components/Navbar" // Corrected import path

interface ContactSettings {
  phoneNumber: string
  whatsappNumber: string
  enableDemo: boolean
}

interface ThemeSettings {
  primaryColor: string
  textColor: string
  accentColor: string
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  textColor: "#111827",
  accentColor: "#fbbf24",
}

const ContactPage = () => {
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [contactDoc, themeDoc] = await Promise.all([
          getDoc(doc(db, "settings", "contactSettings")),
          getDoc(doc(db, "settings", "homeTheme")),
        ])
        
        if (contactDoc.exists()) {
          setContactSettings(contactDoc.data() as ContactSettings)
        } else {
          setError("Contact settings not found")
        }

        if (themeDoc.exists()) {
          setTheme((prev) => ({ ...prev, ...themeDoc.data() }))
        }

      } catch (error) {
        console.error("Error fetching contact settings:", error)
        setError("Failed to load contact information")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleScheduleDemo = () => {
    navigate("/demo")
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background: `linear-gradient(to bottom right, ${theme.primaryColor}30, ${theme.accentColor}30)` }}
      >
        {/* Subtler background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-50">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-xl"></div>
        </div>

        <motion.h1
          className="text-4xl font-bold mb-8 text-center relative z-10"
          style={{ color: theme.textColor }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Contact Sales
        </motion.h1>

        {loading ? (
          <div className="text-center" style={{ color: theme.textColor }}>Loading contact information...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : contactSettings ? (
          <ContactPanel 
            contactSettings={contactSettings} 
            onScheduleDemo={handleScheduleDemo} 
            theme={theme}
          />
        ) : null}
      </div>
    </>
  )
}

export default ContactPage
