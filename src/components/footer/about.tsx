
import { Users, Target, Award, Heart } from "lucide-react"
import Navbar from "../Navbar"
import FooterSection from "../FooterSection"

export default function AboutPage() {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Former VP of Marketing at a Fortune 500 company with 15 years of experience in customer experience and reputation management.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Ex-Google engineer with expertise in machine learning and large-scale data processing systems.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Product leader with 10+ years building SaaS platforms for small and medium businesses.",
    },
    {
      name: "David Kim",
      role: "Head of Customer Success",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Customer success expert who has helped thousands of businesses improve their online reputation and customer relationships.",
    },
  ]

  const values = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Customer First",
      description: "Everything we do is focused on helping our customers succeed and grow their businesses.",
    },
    {
      icon: <Target className="h-8 w-8 text-green-500" />,
      title: "Innovation",
      description: "We continuously innovate to provide the most advanced review management solutions.",
    },
    {
      icon: <Award className="h-8 w-8 text-purple-500" />,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from product quality to customer service.",
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Integrity",
      description: "We operate with transparency, honesty, and ethical business practices in all our interactions.",
    },
  ]

  return (
    <>
    <div>
        <Navbar />
    
    <div className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">
          About Rhino Review
        </h1>   
      <div className="prose max-w-none">
        <p className="text-xl text-gray-600 mb-12">
          We're on a mission to help businesses build stronger relationships with their customers through better review
          management.
        </p>

        <div className="not-prose mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2020, Rhino Review was born out of frustration with existing review management tools that
                  were either too complex or too limited for growing businesses.
                </p>
                <p>
                  Our founders, having experienced the challenges of managing online reputation firsthand, set out to
                  create a platform that would be powerful enough for enterprises yet simple enough for small
                  businesses.
                </p>
                <p>
                  Today, we serve thousands of businesses worldwide, helping them collect, manage, and leverage customer
                  reviews to drive growth and improve customer satisfaction.
                </p>
              </div>
            </div>
            <div>
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Rhino Review team working together"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        <div className="not-prose mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="not-prose mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg not-prose">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
            <p className="text-xl text-gray-600 mb-8">
              We're always looking for talented individuals who share our passion for helping businesses succeed.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/careers" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View Open Positions
              </a>
              <a href="/demo2" className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Contact us
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
