"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { Users, Target, Award, Heart } from "lucide-react"
import Navbar from "../Navbar"
import FooterSection from "../FooterSection"

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
      iconColor: "#3b82f6", // blue-500
    },
    {
      title: "Innovation",
      description: "We continuously innovate to provide the most advanced review management solutions.",
      iconColor: "#10b981", // green-500
    },
    {
      title: "Excellence",
      description: "We strive for excellence in everything we do, from product quality to customer service.",
      iconColor: "#8b5cf6", // purple-500
    },
    {
      title: "Integrity",
      description: "We operate with transparency, honesty, and ethical business practices in all our interactions.",
      iconColor: "#ef4444", // red-500
    },
  ],
  heads: [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      imageUrl: "Rhino-Reviews-main/src/components/assets/images.png",
      bio: "Former VP of Marketing at a Fortune 500 company with 15 years of experience in customer experience and reputation management.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      imageUrl: "Rhino-Reviews-main/src/components/assets/images.png",
      bio: "Ex-Google engineer with expertise in machine learning and large-scale data processing systems.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      imageUrl: "Rhino-Reviews-main/src/components/assets/images.png",
      bio: "Product leader with 10+ years building SaaS platforms for small and medium businesses.",
    },
  ],
  team: [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      imageUrl: "Rhino-Reviews-main/src/components/assets/images.png",
      bio: "Former VP of Marketing at a Fortune 500 company with 15 years of experience in customer experience and reputation management.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      imageUrl: "Rhino-Reviews-main/src/components/assets/images.png",
      bio: "Ex-Google engineer with expertise in machine learning and large-scale data processing systems.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      imageUrl: "Rhino-Reviews-main/src/components/assets/images.png",
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
  primaryColor: "#ea580c",
  secondaryColor: "#fed7aa",
  accentColor: "#fbbf24",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  borderColor: "#d1d5db",
  navbarColor: "#ea580c",
  chatWidgetColor: "#ea580c",
  contactWidgetColor: "#ea580c",
}

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent>(defaultAboutContent)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [aboutDoc, themeDoc] = await Promise.all([
        getDoc(doc(db, "settings", "aboutContent")),
        getDoc(doc(db, "settings", "homeTheme")),
      ])

      if (aboutDoc.exists()) {
        setAboutContent({ ...defaultAboutContent, ...aboutDoc.data() })
      }

      if (themeDoc.exists()) {
        setTheme({ ...defaultTheme, ...themeDoc.data() })
      }
    } catch (error) {
      console.error("Error loading about content:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (index: number) => {
    const iconProps = {
      className: "h-8 w-8",
      style: { color: aboutContent.values[index]?.iconColor || theme.primaryColor },
    }
    switch (index) {
      case 0:
        return <Users {...iconProps} />
      case 1:
        return <Target {...iconProps} />
      case 2:
        return <Award {...iconProps} />
      case 3:
        return <Heart {...iconProps} />
      default:
        return <Users {...iconProps} />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: theme.backgroundColor }}>
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: theme.primaryColor }}
        ></div>
      </div>
    )
  }

  return (
    <>
      <div>
        <Navbar />

        <div className="py-16" style={{ backgroundColor: "#f3f4f6" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold mb-4 text-center" style={{ color: theme.primaryColor }}>
              {aboutContent.hero.title}
            </h1>
            <div className="prose max-w-none">
              <p className="text-xl text-center mb-12" style={{ color: theme.textColor + "cc" }}>
                {aboutContent.hero.subtitle}
              </p>

              <div className="not-prose mb-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primaryColor }}>
                      {aboutContent.story.title}
                    </h2>
                    <div className="space-y-4" style={{ color: theme.textColor + "dd" }}>
                      {aboutContent.story.content.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-center">
                      <img
                        src={aboutContent.story.imageUrl || "Rhino-Reviews-main/src/components/assets/About.jpeg"}
                        alt={aboutContent.story.imageAlt}
                        width={600}
                        height={400}
                        className="rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="not-prose mb-16">
                <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.primaryColor }}>
                  Our Values
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {aboutContent.values.map((value, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-4 flex justify-center">{getIconComponent(index)}</div>
                      <h3 className="text-xl font-semibold mb-3" style={{ color: theme.textColor }}>
                        {value.title}
                      </h3>
                      <p style={{ color: theme.textColor + "dd" }}>{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="not-prose mb-16 mx-auto max-w-7xl px-4">
                <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.primaryColor }}>
                  Meet Our Heads
                </h2>
                <div className="flex flex-wrap justify-center gap-8">
                  {aboutContent.heads.map((member, index) => (
                    <div key={index} className="text-center w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4">
                      <img
                        src={member.imageUrl || "/placeholder.svg?height=300&width=300"}
                        alt={member.name}
                        width={300}
                        height={300}
                        className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
                        style={{ border: `3px solid ${theme.primaryColor}` }}
                      />
                      <h3 className="text-xl font-semibold mb-1" style={{ color: theme.textColor }}>
                        {member.name}
                      </h3>
                      <p className="font-medium mb-3" style={{ color: theme.primaryColor }}>
                        {member.role}
                      </p>
                      <p className="text-sm" style={{ color: theme.textColor + "dd" }}>
                        {member.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="not-prose mb-16">
                <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.primaryColor }}>
                  Meet Our Team
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {aboutContent.team.map((member, index) => (
                    <div key={index} className="text-center">
                      <img
                        src={member.imageUrl || "/placeholder.svg?height=300&width=300"}
                        alt={member.name}
                        width={300}
                        height={300}
                        className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
                        style={{ border: `3px solid ${theme.primaryColor}` }}
                      />
                      <h3 className="text-xl font-semibold mb-1" style={{ color: theme.textColor }}>
                        {member.name}
                      </h3>
                      <p className="font-medium mb-3" style={{ color: theme.primaryColor }}>
                        {member.role}
                      </p>
                      <p className="text-sm" style={{ color: theme.textColor + "dd" }}>
                        {member.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-lg not-prose" style={{ backgroundColor: "#f9fafb" }}>
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textColor }}>
                    {aboutContent.mission.title}
                  </h2>
                  <p className="text-xl mb-8" style={{ color: theme.textColor + "dd" }}>
                    {aboutContent.mission.description}
                  </p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <a
                      href={aboutContent.mission.primaryButtonLink}
                      className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                      style={{
                        backgroundColor: theme.primaryColor,
                        color: "white",
                      }}
                    >
                      {aboutContent.mission.primaryButtonText}
                    </a>
                    <a
                      href={aboutContent.mission.secondaryButtonLink}
                      className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                      style={{
                        backgroundColor: "#e5e7eb",
                        color: theme.textColor,
                      }}
                    >
                      {aboutContent.mission.secondaryButtonText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterSection />
      </div>
    </>
  )
}
