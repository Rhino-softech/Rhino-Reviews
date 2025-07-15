"use client"

import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"

interface ThemeSettings {
  primaryColor: string
  textColor: string
  secondaryColor: string
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  textColor: "#111827",
  secondaryColor: "#fed7aa",
}

const CtaSection = () => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const themeDoc = await getDoc(doc(db, "settings", "homeTheme"))
        if (themeDoc.exists()) {
          setTheme((prev) => ({ ...prev, ...themeDoc.data() }))
        }
      } catch (error) {
        console.error("Error loading theme for CTA section:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTheme()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: theme.primaryColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to boost your online reputation?</h2>
            <p className="mt-4 text-lg max-w-md" style={{ color: theme.secondaryColor }}>
              Join thousands of businesses that use Rhino Review to collect more positive reviews and improve their
              online reputation.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button
                  className="bg-white px-8 py-6 text-lg"
                  style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
                >
                  Get Started Free
                </Button>
              </Link>
              <Link to="/demo">
                <Button
                  variant="outline"
                  className="border-white px-8 py-6 text-lg bg-transparent"
                  style={{ color: "white", borderColor: "white", backgroundColor: "transparent" }}
                >
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-10 lg:mt-0">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4" style={{ color: theme.textColor }}>
                Sign up for our newsletter
              </h3>
              <p className="mb-6" style={{ color: theme.textColor }}>
                Get the latest tips, industry news, and updates from Rhino Review.
              </p>
              <form className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 border border-gray-300 shadow-sm placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 rounded-md"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Button type="submit" className="w-full py-3" style={{ backgroundColor: theme.primaryColor }}>
                    Subscribe
                  </Button>
                </div>
              </form>
              <p className="mt-3 text-sm text-gray-500" style={{ color: theme.textColor }}>
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
