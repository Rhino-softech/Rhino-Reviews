import { MapPin, Clock, Users, Briefcase } from "lucide-react"
import Navbar from "../Navbar"
import FooterSection from "../FooterSection"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"

interface ContactSettings {
    whatsappNumber: string
    }

export default function CareersPage() {
    const [contactSettings, setContactSettings] = useState<ContactSettings>({
        whatsappNumber: "+1234567890", // Default value, will be updated from Firestore
    })

    useEffect(() => {
        const fetchContactSettings = async () => {
          try {
            const docRef = doc(db, "adminSettings", "contactSettings")
            const docSnap = await getDoc(docRef)
    
            if (docSnap.exists()) {
              setContactSettings(docSnap.data() as ContactSettings)
            }
          } catch (error) {
            console.error("Error fetching contact settings:", error)
          }
        }
    
        fetchContactSettings()
      }, [])
    
//   const openings = [
//     {
//       title: "Senior Full Stack Engineer",
//       department: "Engineering",
//       location: "San Francisco, CA / Remote",
//       type: "Full-time",
//       description:
//         "Join our engineering team to build scalable review management solutions using React, Node.js, and cloud technologies.",
//       requirements: [
//         "5+ years of full-stack development experience",
//         "Proficiency in React, Node.js, and TypeScript",
//         "Experience with cloud platforms (AWS/GCP)",
//         "Strong problem-solving and communication skills",
//       ],
//     },
//     {
//       title: "Product Marketing Manager",
//       department: "Marketing",
//       location: "San Francisco, CA / Remote",
//       type: "Full-time",
//       description: "Drive product marketing strategy and go-to-market execution for our review management platform.",
//       requirements: [
//         "3+ years of product marketing experience",
//         "B2B SaaS marketing background preferred",
//         "Strong analytical and writing skills",
//         "Experience with marketing automation tools",
//       ],
//     },
//     {
//       title: "Customer Success Manager",
//       department: "Customer Success",
//       location: "Remote",
//       type: "Full-time",
//       description: "Help our customers achieve success with Rhino Review and drive expansion within existing accounts.",
//       requirements: [
//         "2+ years of customer success experience",
//         "SaaS platform experience preferred",
//         "Excellent communication and relationship-building skills",
//         "Data-driven approach to customer success",
//       ],
//     },
//     {
//       title: "Sales Development Representative",
//       department: "Sales",
//       location: "San Francisco, CA / Remote",
//       type: "Full-time",
//       description: "Generate qualified leads and support our sales team in growing our customer base.",
//       requirements: [
//         "1+ years of sales or business development experience",
//         "Strong communication and interpersonal skills",
//         "Goal-oriented with a track record of meeting targets",
//         "Interest in SaaS and technology solutions",
//       ],
//     },
//   ]

  const benefits = [
    "Competitive salary and equity package",
    "Comprehensive health, dental, and vision insurance",
    "Flexible work arrangements and remote-friendly culture",
    "Unlimited PTO and flexible working hours",
    // "Professional development budget ($2,000/year)",
    "Top-tier equipment and home office setup allowance",
    "Team retreats and company events",
    "Parental leave and family support benefits",
  ]

  const perks = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Great Team",
      description: "Work with talented, passionate people who care about making a difference.",
    },
    {
      icon: <Briefcase className="h-8 w-8 text-green-500" />,
      title: "Growth Opportunities",
      description: "Advance your career with mentorship, training, and leadership opportunities.",
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      title: "Work-Life Balance",
      description: "Flexible schedules and remote work options to fit your lifestyle.",
    },
    {
      icon: <MapPin className="h-8 w-8 text-orange-500" />,
      title: "Remote-First",
      description: "Work from anywhere with a distributed team across multiple time zones.",
    },
  ]

  return (
    <>
    <div>
        <Navbar />
    
    <div className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">
          Careers at Rhino Review
        </h1>
      <div className="prose max-w-none">
        <p className="text-xl text-gray-600 mb-12">
          Join our mission to help businesses build better relationships with their customers. We're looking for
          talented individuals who share our passion for innovation and customer success.
        </p>

        <div className="not-prose mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Work at Rhino Review?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {perks.map((perk, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">{perk.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{perk.title}</h3>
                <p className="text-gray-600">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="not-prose mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits & Perks</h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-8 rounded-lg not-prose">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{"Don't see a perfect fit?"}</h2>
            <p className="text-xl text-gray-600 mb-8">
              We're always interested in hearing from talented individuals. Send us your resume via WhatsApp.
            </p>
            <a
              href={`https://wa.me/${contactSettings.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Send us your Resume
            </a>
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