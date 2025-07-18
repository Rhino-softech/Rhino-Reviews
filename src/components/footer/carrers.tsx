"use client"

import { MapPin, Clock, Users, Briefcase, Star, Award, Heart, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navbar from "../Navbar"
import FooterSection from "../FooterSection"
import JobApplicationModal from "../JobApplicationModal"

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
}

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  isActive: boolean
  createdAt: any
}

interface CareerSettings {
  whatsappNumber: string
  companyName: string
  heroTitle: string
  heroDescription: string
  generalApplicationText: string
}

export default function CareersPage() {
  const [theme, setTheme] = useState<ThemeSettings>({
    primaryColor: "#ea580c",
    secondaryColor: "#fed7aa",
    accentColor: "#fbbf24",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderColor: "#d1d5db",
  })

  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([])
  const [careerSettings, setCareerSettings] = useState<CareerSettings>({
    whatsappNumber: "+1234567890",
    companyName: "Rhino Review",
    heroTitle: "Careers at Rhino Review",
    heroDescription:
      "Join our mission to help businesses build better relationships with their customers. We're looking for talented individuals who share our passion for innovation and customer success.",
    generalApplicationText:
      "We're always interested in hearing from talented individuals. Send us your resume via WhatsApp.",
  })

  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)

  useEffect(() => {
    const fetchThemeSettings = async () => {
      try {
        const themeDoc = await getDoc(doc(db, "settings", "homeTheme"))
        if (themeDoc.exists()) {
          setTheme((prev) => ({ ...prev, ...themeDoc.data() }))
        }
      } catch (error) {
        console.error("Error fetching theme settings:", error)
      }
    }

    const fetchCareerSettings = async () => {
      try {
        const docRef = doc(db, "adminSettings", "careerSettings")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setCareerSettings((prev) => ({ ...prev, ...docSnap.data() }))
        }
      } catch (error) {
        console.error("Error fetching career settings:", error)
      }
    }

    const fetchJobOpenings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "jobOpenings"))
        const jobs: JobOpening[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.isActive) {
            jobs.push({
              id: doc.id,
              ...data,
            } as JobOpening)
          }
        })
        setJobOpenings(jobs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds))
      } catch (error) {
        console.error("Error fetching job openings:", error)
      }
    }

    fetchThemeSettings()
    fetchCareerSettings()
    fetchJobOpenings()
  }, [])

  const handleApplyNow = (job: JobOpening) => {
    setSelectedJob(job)
    setIsApplicationModalOpen(true)
  }

  const benefits = [
    "Competitive salary and equity package",
    "Comprehensive health, dental, and vision insurance",
    "Flexible work arrangements and remote-friendly culture",
    "Unlimited PTO and flexible working hours",
    "Top-tier equipment and home office setup allowance",
    "Team retreats and company events",
    "Parental leave and family support benefits",
    "Professional development and learning opportunities",
  ]

  const perks = [
    {
      icon: <Users className="h-8 w-8" style={{ color: theme.primaryColor }} />,
      title: "Great Team",
      description: "Work with talented, passionate people who care about making a difference.",
    },
    {
      icon: <Briefcase className="h-8 w-8" style={{ color: theme.accentColor }} />,
      title: "Growth Opportunities",
      description: "Advance your career with mentorship, training, and leadership opportunities.",
    },
    {
      icon: <Clock className="h-8 w-8" style={{ color: theme.primaryColor }} />,
      title: "Work-Life Balance",
      description: "Flexible schedules and remote work options to fit your lifestyle.",
    },
    {
      icon: <MapPin className="h-8 w-8" style={{ color: theme.accentColor }} />,
      title: "Remote-First",
      description: "Work from anywhere with a distributed team across multiple time zones.",
    },
  ]

  const companyValues = [
    {
      icon: <Heart className="h-6 w-6" style={{ color: theme.primaryColor }} />,
      title: "Customer First",
      description: "Everything we do is focused on helping our customers succeed.",
    },
    {
      icon: <Star className="h-6 w-6" style={{ color: theme.accentColor }} />,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge solutions.",
    },
    {
      icon: <Award className="h-6 w-6" style={{ color: theme.primaryColor }} />,
      title: "Excellence",
      description: "We strive for excellence in everything we do.",
    },
    {
      icon: <Target className="h-6 w-6" style={{ color: theme.accentColor }} />,
      title: "Integrity",
      description: "We operate with transparency and ethical practices.",
    },
  ]

  return (
    <>
      <div style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        <Navbar />

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20, ${theme.accentColor}20)`,
            }}
          />
          <div className="relative py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto text-center">
              <h1
                className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                }}
              >
                {careerSettings.heroTitle}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
                {careerSettings.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor }}
                  onClick={() => document.getElementById("job-openings")?.scrollIntoView({ behavior: "smooth" })}
                >
                  View Open Positions
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-transparent"
                  style={{
                    borderColor: theme.primaryColor,
                    color: theme.primaryColor,
                    backgroundColor: "transparent",
                  }}
                  onClick={() => document.getElementById("general-application")?.scrollIntoView({ behavior: "smooth" })}
                >
                  General Application
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Why Work Here Section */}
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textColor }}>
                Why Work at {careerSettings.companyName}?
              </h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                Join a team that values innovation, growth, and making a real impact in the business world.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {perks.map((perk, index) => (
                <Card
                  key={index}
                  className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <CardContent className="p-8">
                    <div className="mb-6 flex justify-center">{perk.icon}</div>
                    <h3 className="text-xl font-semibold mb-4" style={{ color: theme.textColor }}>
                      {perk.title}
                    </h3>
                    <p className="opacity-80 leading-relaxed">{perk.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Company Values Section */}
        <div className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.secondaryColor + "20" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textColor }}>
                Our Values
              </h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                The principles that guide everything we do and shape our company culture.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {value.icon}
                      <h3 className="text-lg font-semibold" style={{ color: theme.textColor }}>
                        {value.title}
                      </h3>
                    </div>
                    <p className="opacity-80 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textColor }}>
                Benefits & Perks
              </h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                We believe in taking care of our team with comprehensive benefits and amazing perks.
              </p>
            </div>
            <Card className="shadow-xl border-0">
              <CardContent className="p-12">
                <div className="grid md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span className="text-lg leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Job Openings Section */}
        <div
          id="job-openings"
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: theme.secondaryColor + "10" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textColor }}>
                Current Openings
              </h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                Find your next career opportunity and join our growing team.
              </p>
            </div>

            {jobOpenings.length > 0 ? (
              <div className="space-y-8">
                {jobOpenings.map((job) => (
                  <Card
                    key={job.id}
                    className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <CardHeader>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-3" style={{ color: theme.textColor }}>
                            {job.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-4 mb-4">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-2 px-3 py-1 text-sm font-medium"
                              style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                            >
                              <Briefcase className="h-4 w-4" />
                              {job.department}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-2 px-3 py-1 text-sm font-medium"
                              style={{ borderColor: theme.accentColor, color: theme.accentColor }}
                            >
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-2 px-3 py-1 text-sm font-medium"
                              style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                            >
                              <Clock className="h-4 w-4" />
                              {job.type}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          onClick={() => handleApplyNow(job)}
                          className="text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg mb-6 leading-relaxed opacity-90">{job.description}</p>

                      <div>
                        <h4 className="text-lg font-semibold mb-4" style={{ color: theme.textColor }}>
                          Requirements:
                        </h4>
                        <ul className="space-y-3">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div
                                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: theme.primaryColor }}
                              />
                              <span className="leading-relaxed">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-xl border-0">
                <CardContent className="text-center py-16">
                  <Briefcase className="h-16 w-16 mx-auto mb-6 opacity-50" style={{ color: theme.primaryColor }} />
                  <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.textColor }}>
                    No Current Openings
                  </h3>
                  <p className="text-lg opacity-80 mb-8">
                    We don't have any open positions right now, but we're always growing!
                  </p>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-semibold px-8 py-3 rounded-xl bg-transparent"
                    style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                    onClick={() =>
                      document.getElementById("general-application")?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Submit General Application
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* General Application Section */}
        <div id="general-application" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card
              className="shadow-2xl border-0 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}20)` }}
            >
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl font-bold mb-6" style={{ color: theme.textColor }}>
                  Don't See a Perfect Fit?
                </h2>
                <p className="text-xl mb-8 leading-relaxed opacity-90 max-w-2xl mx-auto">
                  {careerSettings.generalApplicationText}
                </p>
                <Button
                  size="lg"
                  asChild
                  className="text-white font-semibold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <a
                    href={`https://wa.me/${careerSettings.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Send Us Your Resume
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <FooterSection />
      </div>

      <JobApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        job={selectedJob}
        whatsappNumber={careerSettings.whatsappNumber}
      />
    </>
  )
}
