"use client"

import { useState, useEffect } from "react"
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // Added DialogDescription
import {
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  Users,
  Eye,
  MessageCircle,
  Download,
  ExternalLink,
  Filter,
  Briefcase,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Mail,
  Reply,
  Send,
  FileText,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"

interface CareerSettings {
  whatsappNumber: string
  companyName: string
  heroTitle: string
  heroDescription: string
  generalApplicationText: string
  companyEmail: string
  hrEmail: string
  companyAddress: string
  benefits: string[]
  companyValues: Array<{
    title: string
    description: string
    icon: string
  }>
  perks: Array<{
    title: string
    description: string
    icon: string
  }>
  aboutCompany: string
  workCulture: string
  careerGrowth: string
  socialLinks: {
    linkedin: string
    twitter: string
    facebook: string
    instagram: string
  }
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

interface JobApplication {
  id: string
  jobId: string
  jobTitle: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  applicationData: any
  status: string
  appliedAt: any
  notes: string
}

interface EmailTemplate {
  subject: string
  body: string
}

interface EmailReply {
  id: string
  applicationId: string
  applicantEmail: string
  applicantName: string
  subject: string
  message: string
  receivedAt: any
  isRead: boolean
  originalEmailType: string
  isFromAdmin?: boolean
}

interface EmailDraft {
  subject: string
  body: string
  applicantEmail: string
  applicantName: string
  applicationId: string
  newStatus: string
  emailType: "shortlisted" | "rejected"
}

export default function CareerSettingsPage() {
  const [careerSettings, setCareerSettings] = useState<CareerSettings>({
    whatsappNumber: "+1234567890",
    companyName: "Rhino Review",
    heroTitle: "Careers at Rhino Review",
    heroDescription:
      "Join our mission to help businesses build better relationships with their customers. We're looking for talented individuals who share our passion for innovation and customer success.",
    generalApplicationText:
      "We're always interested in hearing from talented individuals. Send us your resume via WhatsApp.",
    companyEmail: "careers@rhinoreview.com",
    hrEmail: "hr@rhinoreview.com",
    companyAddress: "123 Business St, City, State 12345",
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "Flexible work arrangements and remote-friendly culture",
      "Unlimited PTO and flexible working hours",
    ],
    companyValues: [
      {
        title: "Customer First",
        description: "Everything we do is focused on helping our customers succeed.",
        icon: "heart",
      },
      { title: "Innovation", description: "We continuously innovate to provide cutting-edge solutions.", icon: "star" },
      { title: "Excellence", description: "We strive for excellence in everything we do.", icon: "award" },
      { title: "Integrity", description: "We operate with transparency and ethical practices.", icon: "target" },
    ],
    perks: [
      {
        title: "Great Team",
        description: "Work with talented, passionate people who care about making a difference.",
        icon: "users",
      },
      {
        title: "Growth Opportunities",
        description: "Advance your career with mentorship, training, and leadership opportunities.",
        icon: "briefcase",
      },
      {
        title: "Work-Life Balance",
        description: "Flexible schedules and remote work options to fit your lifestyle.",
        icon: "clock",
      },
      {
        title: "Remote-First",
        description: "Work from anywhere with a distributed team across multiple time zones.",
        icon: "map-pin",
      },
    ],
    aboutCompany:
      "We are a leading technology company focused on innovation and customer success. Our mission is to transform how businesses interact with their customers through cutting-edge solutions.",
    workCulture:
      "Our culture is built on collaboration, innovation, and respect. We believe in empowering our team members to do their best work while maintaining a healthy work-life balance.",
    careerGrowth:
      "We invest in our people's growth through mentorship programs, training opportunities, and clear career progression paths. Your success is our success.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/rhinoreview",
      twitter: "https://twitter.com/rhinoreview",
      facebook: "https://facebook.com/rhinoreview",
      instagram: "https://instagram.com/rhinoreview",
    },
  })

  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([])
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [emailReplies, setEmailReplies] = useState<EmailReply[]>([])
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([])
  const [isEditingJob, setIsEditingJob] = useState<string | null>(null)
  const [isAddingJob, setIsAddingJob] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all")
  const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null)
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [activeContentTab, setActiveContentTab] = useState("about")

  // New state for email preview modal
  const [isEmailPreviewModalOpen, setIsEmailPreviewModalOpen] = useState(false)
  const [currentEmailDraft, setCurrentEmailDraft] = useState<EmailDraft | null>(null)

  const [newJob, setNewJob] = useState<Partial<JobOpening>>({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: [""],
    isActive: true,
  })

  const emailTemplates = {
    shortlisted: {
      subject: "🎉 Great News! You've Been Shortlisted - {jobTitle} at {companyName}",
      body: `Dear {applicantName},

We hope this email finds you well!

We are thrilled to inform you that after reviewing your application for the {jobTitle} position at {companyName}, you have been shortlisted for the next round of our selection process.

Your qualifications and experience have impressed our hiring team, and we believe you could be a great fit for our organization.

Next Steps:
• Our HR team will contact you within 2-3 business days
• Please keep your phone and email accessible
• We may schedule a preliminary interview or assessment

We're excited about the possibility of having you join our team and look forward to getting to know you better.

If you have any questions in the meantime, please don't hesitate to reach out to us by replying to this email.

Best regards,
HR Team
{companyName}

---
You can reply to this email for any questions or concerns.`,
    },
    rejected: {
      subject: "Thank You for Your Interest - {jobTitle} Application Update",
      body: `Dear {applicantName},

Thank you for taking the time to apply for the {jobTitle} position at {companyName} and for your interest in joining our team.

After careful consideration of all applications, we have decided to move forward with other candidates whose qualifications more closely match our current requirements for this specific role.

Please know that this decision was not easy, as we received many strong applications. We were impressed by your background and encourage you to apply for future opportunities that may be a better fit for your skills and experience.

We will keep your resume on file and will reach out if a suitable position becomes available in the future.

Thank you again for considering {companyName} as a potential employer. We wish you the very best in your job search and future career endeavors.

If you have any questions, feel free to reply to this email.

Best regards,
HR Team
{companyName}

---
You can reply to this email for any questions or feedback.`,
    },
  }

  useEffect(() => {
    fetchCareerSettings()
    fetchJobOpenings()
    fetchJobApplications()
    fetchEmailReplies()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [jobApplications, selectedJobFilter, selectedStatusFilter])

  const filterApplications = () => {
    let filtered = [...jobApplications]
    if (selectedJobFilter !== "all") {
      filtered = filtered.filter((app) => app.jobId === selectedJobFilter)
    }
    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === selectedStatusFilter)
    }
    setFilteredApplications(filtered)
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
      toast({
        title: "Error",
        description: "Failed to fetch career settings",
        variant: "destructive",
      })
    }
  }

  const fetchJobOpenings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "jobOpenings"))
      const jobs: JobOpening[] = []
      querySnapshot.forEach((doc) => {
        jobs.push({
          id: doc.id,
          ...doc.data(),
        } as JobOpening)
      })
      setJobOpenings(jobs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds))
    } catch (error) {
      console.error("Error fetching job openings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch job openings",
        variant: "destructive",
      })
    }
  }

  const fetchJobApplications = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "jobApplications"))
      const applications: JobApplication[] = []
      querySnapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data(),
        } as JobApplication)
      })
      setJobApplications(applications.sort((a, b) => b.appliedAt?.seconds - a.appliedAt?.seconds))
    } catch (error) {
      console.error("Error fetching job applications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch job applications",
        variant: "destructive",
      })
    }
  }

  const fetchEmailReplies = async () => {
    try {
      const q = query(collection(db, "emailReplies"), orderBy("receivedAt", "desc"))
      const querySnapshot = await getDocs(q)
      const replies: EmailReply[] = []
      querySnapshot.forEach((doc) => {
        replies.push({
          id: doc.id,
          ...doc.data(),
        } as EmailReply)
      })
      setEmailReplies(replies)
    } catch (error) {
      console.error("Error fetching email replies:", error)
      toast({
        title: "Error",
        description: "Failed to fetch email replies",
        variant: "destructive",
      })
    }
  }

  const saveCareerSettings = async () => {
    try {
      await setDoc(doc(db, "adminSettings", "careerSettings"), careerSettings)
      toast({
        title: "✅ Success",
        description: "Career settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving career settings:", error)
      toast({
        title: "Error",
        description: "Failed to save career settings",
        variant: "destructive",
      })
    }
  }

  const addJobOpening = async () => {
    try {
      const jobData = {
        ...newJob,
        createdAt: new Date(),
        requirements: newJob.requirements?.filter((req) => req.trim() !== "") || [],
      }
      await addDoc(collection(db, "jobOpenings"), jobData)
      setNewJob({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: [""],
        isActive: true,
      })
      setIsAddingJob(false)
      fetchJobOpenings()
      toast({
        title: "✅ Success",
        description: "Job opening added successfully",
      })
    } catch (error) {
      console.error("Error adding job opening:", error)
      toast({
        title: "Error",
        description: "Failed to add job opening",
        variant: "destructive",
      })
    }
  }

  const updateJobOpening = async (jobId: string, updatedJob: Partial<JobOpening>) => {
    try {
      await updateDoc(doc(db, "jobOpenings", jobId), {
        ...updatedJob,
        requirements: updatedJob.requirements?.filter((req) => req.trim() !== "") || [],
      })
      setIsEditingJob(null)
      fetchJobOpenings()
      toast({
        title: "✅ Success",
        description: "Job opening updated successfully",
      })
    } catch (error) {
      console.error("Error updating job opening:", error)
      toast({
        title: "Error",
        description: "Failed to update job opening",
        variant: "destructive",
      })
    }
  }

  const deleteJobOpening = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job opening?")) return
    try {
      await deleteDoc(doc(db, "jobOpenings", jobId))
      fetchJobOpenings()
      toast({
        title: "✅ Success",
        description: "Job opening deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting job opening:", error)
      toast({
        title: "Error",
        description: "Failed to delete job opening",
        variant: "destructive",
      })
    }
  }

  const toggleJobStatus = async (jobId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "jobOpenings", jobId), { isActive })
      fetchJobOpenings()
      toast({
        title: "✅ Success",
        description: `Job opening ${isActive ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating job status:", error)
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      })
    }
  }

  const openEmailPreviewModal = (application: JobApplication, newStatus: "shortlisted" | "rejected") => {
    const template = emailTemplates[newStatus]
    if (!template) {
      toast({
        title: "Error",
        description: "Email template not found.",
        variant: "destructive",
      })
      return
    }

    const personalizedSubject = template.subject
      .replace("{jobTitle}", application.jobTitle)
      .replace("{companyName}", careerSettings.companyName)
      .replace("{applicantName}", application.applicantName)

    const personalizedBody = template.body
      .replace(/{jobTitle}/g, application.jobTitle)
      .replace(/{companyName}/g, careerSettings.companyName)
      .replace(/{applicantName}/g, application.applicantName)

    setCurrentEmailDraft({
      subject: personalizedSubject,
      body: personalizedBody,
      applicantEmail: application.applicantEmail,
      applicantName: application.applicantName,
      applicationId: application.id,
      newStatus: newStatus,
      emailType: newStatus,
    })
    setIsEmailPreviewModalOpen(true)
  }

  const confirmSendEmailAndUpdateStatus = async () => {
    if (!currentEmailDraft) return

    const { subject, body, applicantEmail, applicantName, applicationId, newStatus, emailType } = currentEmailDraft

    try {
      // 1. Update application status in Firebase
      await updateDoc(doc(db, "jobApplications", applicationId), { status: newStatus })

      // 2. Store email record in Firebase
      await addDoc(collection(db, "sentEmails"), {
        applicationId: applicationId,
        applicantEmail: applicantEmail,
        applicantName: applicantName,
        subject: subject,
        body: body,
        emailType: emailType,
        sentAt: new Date(),
        replyEnabled: true,
      })

      // 3. Open Outlook Mailto link
      const mailtoLink = `mailto:${applicantEmail}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`
      window.open(mailtoLink, "_blank")

      toast({
        title: "📧 Email Sent & Status Updated",
        description: `${emailType === "shortlisted" ? "Shortlist" : "Rejection"} email prepared and status updated for ${applicantName}`,
      })

      // Refresh data
      fetchJobApplications()
      setIsEmailPreviewModalOpen(false)
      setCurrentEmailDraft(null)
      setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null)) // Update selected application status in modal if open
    } catch (error) {
      console.error("Error sending email and updating status:", error)
      toast({
        title: "Error",
        description: "Failed to send email and update status",
        variant: "destructive",
      })
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    const application = jobApplications.find((app) => app.id === applicationId)
    if (!application) return

    if (status === "shortlisted" || status === "rejected") {
      openEmailPreviewModal(application, status)
    } else {
      try {
        await updateDoc(doc(db, "jobApplications", applicationId), { status })
        fetchJobApplications()
        toast({
          title: "✅ Success",
          description: "Application status updated successfully",
        })
      } catch (error) {
        console.error("Error updating application status:", error)
        toast({
          title: "Error",
          description: "Failed to update application status",
          variant: "destructive",
        })
      }
    }
  }

  const markReplyAsRead = async (replyId: string) => {
    try {
      await updateDoc(doc(db, "emailReplies", replyId), { isRead: true })
      fetchEmailReplies()
    } catch (error) {
      console.error("Error marking reply as read:", error)
    }
  }

  const sendReplyToApplicant = async () => {
    if (!selectedReply || !replyMessage.trim()) return

    try {
      // Store the reply in database
      await addDoc(collection(db, "emailReplies"), {
        applicationId: selectedReply.applicationId,
        applicantEmail: selectedReply.applicantEmail,
        applicantName: selectedReply.applicantName,
        subject: `Re: ${selectedReply.subject}`,
        message: replyMessage,
        receivedAt: new Date(),
        isRead: true,
        originalEmailType: "admin_reply",
        isFromAdmin: true,
      })

      // Here you would send the actual email
      // For Outlook, you could open a mailto link here as well if desired
      const mailtoLink = `mailto:${selectedReply.applicantEmail}?subject=${encodeURIComponent(`Re: ${selectedReply.subject}`)}&body=${encodeURIComponent(replyMessage)}`
      window.open(mailtoLink, "_blank")

      toast({
        title: "✅ Reply Sent",
        description: `Reply sent to ${selectedReply.applicantName}`,
      })

      setIsReplyModalOpen(false)
      setReplyMessage("")
      setSelectedReply(null)
      fetchEmailReplies()
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
    }
  }

  const addRequirement = (requirements: string[], setRequirements: (reqs: string[]) => void) => {
    setRequirements([...requirements, ""])
  }

  const updateRequirement = (
    index: number,
    value: string,
    requirements: string[],
    setRequirements: (reqs: string[]) => void,
  ) => {
    const updated = [...requirements]
    updated[index] = value
    setRequirements(updated)
  }

  const removeRequirement = (index: number, requirements: string[], setRequirements: (reqs: string[]) => void) => {
    const updated = requirements.filter((_, i) => i !== index)
    setRequirements(updated)
  }

  const addBenefit = () => {
    setCareerSettings((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }))
  }

  const updateBenefit = (index: number, value: string) => {
    setCareerSettings((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => (i === index ? value : benefit)),
    }))
  }

  const removeBenefit = (index: number) => {
    setCareerSettings((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  const addCompanyValue = () => {
    setCareerSettings((prev) => ({
      ...prev,
      companyValues: [...prev.companyValues, { title: "", description: "", icon: "star" }],
    }))
  }

  const updateCompanyValue = (index: number, field: string, value: string) => {
    setCareerSettings((prev) => ({
      ...prev,
      companyValues: prev.companyValues.map((val, i) => (i === index ? { ...val, [field]: value } : val)),
    }))
  }

  const removeCompanyValue = (index: number) => {
    setCareerSettings((prev) => ({
      ...prev,
      companyValues: prev.companyValues.filter((_, i) => i !== index),
    }))
  }

  const addPerk = () => {
    setCareerSettings((prev) => ({
      ...prev,
      perks: [...prev.perks, { title: "", description: "", icon: "star" }],
    }))
  }

  const updatePerk = (index: number, field: string, value: string) => {
    setCareerSettings((prev) => ({
      ...prev,
      perks: prev.perks.map((perk, i) => (i === index ? { ...perk, [field]: value } : perk)),
    }))
  }

  const removePerk = (index: number) => {
    setCareerSettings((prev) => ({
      ...prev,
      perks: prev.perks.filter((_, i) => i !== index),
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shortlisted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-3 w-3" />
      case "reviewed":
        return <Eye className="h-3 w-3" />
      case "shortlisted":
        return <CheckCircle className="h-3 w-3" />
      case "rejected":
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const handleResumeDownload = (application: JobApplication) => {
    const data = application.applicationData

    if (data?.resumeType === "link" && data?.resumeLink) {
      window.open(data.resumeLink, "_blank")
    } else if (data?.resumeType === "upload" && data?.resumeUrl) {
      window.open(data.resumeUrl, "_blank")
    } else {
      toast({
        title: "Resume not available",
        description: "This applicant has not uploaded or linked a resume.",
        variant: "destructive",
      })
    }
  }

  const getApplicationStats = () => {
    const total = jobApplications.length
    const pending = jobApplications.filter((app) => app.status === "pending").length
    const reviewed = jobApplications.filter((app) => app.status === "reviewed").length
    const shortlisted = jobApplications.filter((app) => app.status === "shortlisted").length
    const rejected = jobApplications.filter((app) => app.status === "rejected").length
    return { total, pending, reviewed, shortlisted, rejected }
  }

  const getUnreadRepliesCount = () => {
    return emailReplies.filter((reply) => !reply.isRead && !reply.isFromAdmin).length
  }

  const stats = getApplicationStats()
  const unreadReplies = getUnreadRepliesCount()

  return (
    <SimpleAdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Career Management Hub
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Manage your careers page, job openings, candidate applications, and email communications
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="settings" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-1">
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-300"
              >
                <Settings className="h-4 w-4 mr-2" />
                Career Settings
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-300"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Job Openings ({jobOpenings.length})
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Applications ({stats.total})
                {stats.pending > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                    {stats.pending} new
                  </Badge>
                )}
              </TabsTrigger>
              {/* <TabsTrigger
                value="emails"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-300"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Replies
                {unreadReplies > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                    {unreadReplies} new
                  </Badge>
                )}
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Basic Settings */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Settings className="h-6 w-6" />
                      Basic Company Information
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Configure the basic information and contact details for your careers page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          value={careerSettings.companyName}
                          onChange={(e) => setCareerSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsappNumber" className="text-sm font-semibold text-gray-700">
                          WhatsApp Number
                        </Label>
                        <Input
                          id="whatsappNumber"
                          value={careerSettings.whatsappNumber}
                          onChange={(e) => setCareerSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                          placeholder="+1234567890"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail" className="text-sm font-semibold text-gray-700">
                          Company Email
                        </Label>
                        <Input
                          id="companyEmail"
                          value={careerSettings.companyEmail}
                          onChange={(e) => setCareerSettings((prev) => ({ ...prev, companyEmail: e.target.value }))}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hrEmail" className="text-sm font-semibold text-gray-700">
                          HR Email
                        </Label>
                        <Input
                          id="hrEmail"
                          value={careerSettings.hrEmail}
                          onChange={(e) => setCareerSettings((prev) => ({ ...prev, hrEmail: e.target.value }))}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress" className="text-sm font-semibold text-gray-700">
                        Company Address
                      </Label>
                      <Textarea
                        id="companyAddress"
                        value={careerSettings.companyAddress}
                        onChange={(e) => setCareerSettings((prev) => ({ ...prev, companyAddress: e.target.value }))}
                        className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroTitle" className="text-sm font-semibold text-gray-700">
                        Hero Title
                      </Label>
                      <Input
                        id="heroTitle"
                        value={careerSettings.heroTitle}
                        onChange={(e) => setCareerSettings((prev) => ({ ...prev, heroTitle: e.target.value }))}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroDescription" className="text-sm font-semibold text-gray-700">
                        Hero Description
                      </Label>
                      <Textarea
                        id="heroDescription"
                        value={careerSettings.heroDescription}
                        onChange={(e) => setCareerSettings((prev) => ({ ...prev, heroDescription: e.target.value }))}
                        className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="generalApplicationText" className="text-sm font-semibold text-gray-700">
                        General Application Text
                      </Label>
                      <Textarea
                        id="generalApplicationText"
                        value={careerSettings.generalApplicationText}
                        onChange={(e) =>
                          setCareerSettings((prev) => ({ ...prev, generalApplicationText: e.target.value }))
                        }
                        className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Content Management */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <FileText className="h-6 w-6" />
                      Career Page Content
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      Manage detailed content for your careers page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="about">About Company</TabsTrigger>
                        <TabsTrigger value="culture">Work Culture</TabsTrigger>
                        <TabsTrigger value="growth">Career Growth</TabsTrigger>
                        <TabsTrigger value="benefits">Benefits</TabsTrigger>
                        <TabsTrigger value="social">Social Links</TabsTrigger>
                      </TabsList>

                      <TabsContent value="about" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="aboutCompany" className="text-sm font-semibold text-gray-700">
                            About Company
                          </Label>
                          <Textarea
                            id="aboutCompany"
                            value={careerSettings.aboutCompany}
                            onChange={(e) => setCareerSettings((prev) => ({ ...prev, aboutCompany: e.target.value }))}
                            className="min-h-[150px] border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            placeholder="Tell candidates about your company, mission, and values..."
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="culture" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="workCulture" className="text-sm font-semibold text-gray-700">
                            Work Culture
                          </Label>
                          <Textarea
                            id="workCulture"
                            value={careerSettings.workCulture}
                            onChange={(e) => setCareerSettings((prev) => ({ ...prev, workCulture: e.target.value }))}
                            className="min-h-[150px] border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            placeholder="Describe your company culture, work environment, and team dynamics..."
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="growth" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="careerGrowth" className="text-sm font-semibold text-gray-700">
                            Career Growth Opportunities
                          </Label>
                          <Textarea
                            id="careerGrowth"
                            value={careerSettings.careerGrowth}
                            onChange={(e) => setCareerSettings((prev) => ({ ...prev, careerGrowth: e.target.value }))}
                            className="min-h-[150px] border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            placeholder="Explain career advancement opportunities, training programs, mentorship..."
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="benefits" className="space-y-4">
                        <div className="space-y-4">
                          <Label className="text-sm font-semibold text-gray-700">Employee Benefits</Label>
                          {careerSettings.benefits.map((benefit, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={benefit}
                                onChange={(e) => updateBenefit(index, e.target.value)}
                                placeholder="Enter benefit"
                                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeBenefit(index)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addBenefit}
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Benefit
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="social" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-700">
                              LinkedIn URL
                            </Label>
                            <Input
                              id="linkedin"
                              value={careerSettings.socialLinks.linkedin}
                              onChange={(e) =>
                                setCareerSettings((prev) => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                                }))
                              }
                              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="twitter" className="text-sm font-semibold text-gray-700">
                              Twitter URL
                            </Label>
                            <Input
                              id="twitter"
                              value={careerSettings.socialLinks.twitter}
                              onChange={(e) =>
                                setCareerSettings((prev) => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                                }))
                              }
                              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="facebook" className="text-sm font-semibold text-gray-700">
                              Facebook URL
                            </Label>
                            <Input
                              id="facebook"
                              value={careerSettings.socialLinks.facebook}
                              onChange={(e) =>
                                setCareerSettings((prev) => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                                }))
                              }
                              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instagram" className="text-sm font-semibold text-gray-700">
                              Instagram URL
                            </Label>
                            <Input
                              id="instagram"
                              value={careerSettings.socialLinks.instagram}
                              onChange={(e) =>
                                setCareerSettings((prev) => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                                }))
                              }
                              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Button
                  onClick={saveCareerSettings}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save All Career Settings
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="jobs">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Job Openings Management
                  </h2>
                  <Button
                    onClick={() => setIsAddingJob(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Job Opening
                  </Button>
                </div>

                {/* Add New Job Form */}
                {isAddingJob && (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-3">
                        <Plus className="h-5 w-5" />
                        Add New Job Opening
                      </CardTitle>
                      <CardDescription className="text-emerald-100">
                        Create a new job opening for your careers page
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newJobTitle" className="text-sm font-semibold text-gray-700">
                            Job Title
                          </Label>
                          <Input
                            id="newJobTitle"
                            value={newJob.title}
                            onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))}
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newJobDepartment" className="text-sm font-semibold text-gray-700">
                            Department
                          </Label>
                          <Input
                            id="newJobDepartment"
                            value={newJob.department}
                            onChange={(e) => setNewJob((prev) => ({ ...prev, department: e.target.value }))}
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newJobLocation" className="text-sm font-semibold text-gray-700">
                            Location
                          </Label>
                          <Input
                            id="newJobLocation"
                            value={newJob.location}
                            onChange={(e) => setNewJob((prev) => ({ ...prev, location: e.target.value }))}
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newJobType" className="text-sm font-semibold text-gray-700">
                            Job Type
                          </Label>
                          <Input
                            id="newJobType"
                            value={newJob.type}
                            onChange={(e) => setNewJob((prev) => ({ ...prev, type: e.target.value }))}
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newJobDescription" className="text-sm font-semibold text-gray-700">
                          Job Description
                        </Label>
                        <Textarea
                          id="newJobDescription"
                          value={newJob.description}
                          onChange={(e) => setNewJob((prev) => ({ ...prev, description: e.target.value }))}
                          className="min-h-[120px] border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Requirements</Label>
                        {newJob.requirements?.map((req, index) => (
                          <div key={index} className="flex gap-2 mt-2">
                            <Input
                              value={req}
                              onChange={(e) =>
                                updateRequirement(index, e.target.value, newJob.requirements || [], (reqs) =>
                                  setNewJob((prev) => ({ ...prev, requirements: reqs })),
                                )
                              }
                              placeholder="Enter requirement"
                              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeRequirement(index, newJob.requirements || [], (reqs) =>
                                  setNewJob((prev) => ({ ...prev, requirements: reqs })),
                                )
                              }
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addRequirement(newJob.requirements || [], (reqs) =>
                              setNewJob((prev) => ({ ...prev, requirements: reqs })),
                            )
                          }
                          className="mt-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Requirement
                        </Button>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingJob(false)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addJobOpening}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        >
                          Add Job Opening
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Job Openings List */}
                <div className="grid gap-6">
                  {jobOpenings.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                <Briefcase className="h-5 w-5 text-white" />
                              </div>
                              {job.title}
                              <Badge
                                variant={job.isActive ? "default" : "secondary"}
                                className={`${
                                  job.isActive
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                } border`}
                              >
                                {job.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2 text-base">
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {job.department}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.type}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={job.isActive}
                              onCheckedChange={(checked) => toggleJobStatus(job.id, checked)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingJob(job.id)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteJobOpening(job.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {isEditingJob === job.id ? (
                        <CardContent className="space-y-4 border-t bg-gray-50/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Job Title</Label>
                              <Input
                                value={job.title}
                                onChange={(e) =>
                                  setJobOpenings((prev) =>
                                    prev.map((j) => (j.id === job.id ? { ...j, title: e.target.value } : j)),
                                  )
                                }
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Department</Label>
                              <Input
                                value={job.department}
                                onChange={(e) =>
                                  setJobOpenings((prev) =>
                                    prev.map((j) => (j.id === job.id ? { ...j, department: e.target.value } : j)),
                                  )
                                }
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Location</Label>
                              <Input
                                value={job.location}
                                onChange={(e) =>
                                  setJobOpenings((prev) =>
                                    prev.map((j) => (j.id === job.id ? { ...j, location: e.target.value } : j)),
                                  )
                                }
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Job Type</Label>
                              <Input
                                value={job.type}
                                onChange={(e) =>
                                  setJobOpenings((prev) =>
                                    prev.map((j) => (j.id === job.id ? { ...j, type: e.target.value } : j)),
                                  )
                                }
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Description</Label>
                            <Textarea
                              value={job.description}
                              onChange={(e) =>
                                setJobOpenings((prev) =>
                                  prev.map((j) => (j.id === job.id ? { ...j, description: e.target.value } : j)),
                                )
                              }
                              className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Requirements</Label>
                            {job.requirements.map((req, index) => (
                              <div key={index} className="flex gap-2 mt-2">
                                <Input
                                  value={req}
                                  onChange={(e) => {
                                    const updatedReqs = [...job.requirements]
                                    updatedReqs[index] = e.target.value
                                    setJobOpenings((prev) =>
                                      prev.map((j) => (j.id === job.id ? { ...j, requirements: updatedReqs } : j)),
                                    )
                                  }}
                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedReqs = job.requirements.filter((_, i) => i !== index)
                                    setJobOpenings((prev) =>
                                      prev.map((j) => (j.id === job.id ? { ...j, requirements: updatedReqs } : j)),
                                    )
                                  }}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedReqs = [...job.requirements, ""]
                                setJobOpenings((prev) =>
                                  prev.map((j) => (j.id === job.id ? { ...j, requirements: updatedReqs } : j)),
                                )
                              }}
                              className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Requirement
                            </Button>
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setIsEditingJob(null)}
                              className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => updateJobOpening(job.id, job)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </CardContent>
                      ) : (
                        <CardContent>
                          <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>
                          <div>
                            <h4 className="font-semibold mb-3 text-gray-900">Requirements:</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-600">
                              {job.requirements.map((req, index) => (
                                <li key={index} className="leading-relaxed">
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>

                {jobOpenings.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="text-center py-12">
                      <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        No job openings created yet. Add your first job opening to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applications">
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total</p>
                          <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm">Pending</p>
                          <p className="text-2xl font-bold">{stats.pending}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-amber-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Reviewed</p>
                          <p className="text-2xl font-bold">{stats.reviewed}</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm">Shortlisted</p>
                          <p className="text-2xl font-bold">{stats.shortlisted}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-emerald-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm">Rejected</p>
                          <p className="text-2xl font-bold">{stats.rejected}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Filter className="h-5 w-5 text-gray-600" />
                      <div className="flex gap-4 flex-1">
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-gray-700">Filter by Job</Label>
                          <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                              <SelectValue placeholder="All Jobs" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Jobs</SelectItem>
                              {jobOpenings.map((job) => (
                                <SelectItem key={job.id} value={job.id}>
                                  {job.title} - {job.department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-gray-700">Filter by Status</Label>
                          <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                              <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications List */}
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              {application.applicantName}
                              <Badge className={`${getStatusColor(application.status)} border font-medium`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1">{application.status || "pending"}</span>
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                              Applied for: <span className="font-semibold text-gray-700">{application.jobTitle}</span> •{" "}
                              {application.appliedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResumeDownload(application)}
                              className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                              {application.applicationData?.resumeType === "link" ? (
                                <>
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View Resume
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-1" />
                                  Resume
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const whatsappUrl = `https://wa.me/${application.applicantPhone?.replace(/\D/g, "")}`
                                window.open(whatsappUrl, "_blank")
                              }}
                              className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">Email:</span>
                            <p className="text-gray-900 mt-1">{application.applicantEmail}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">Phone:</span>
                            <p className="text-gray-900 mt-1">{application.applicantPhone}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">Experience:</span>
                            <p className="text-gray-900 mt-1">
                              {application.applicationData?.totalExperience || "Not specified"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">Expected Salary:</span>
                            <p className="text-gray-900 mt-1">
                              {application.applicationData?.expectedSalary || "Not specified"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">Resume Type:</span>
                            <p className="text-gray-900 mt-1">
                              {application.applicationData?.resumeType === "upload" ? "File Upload" : "Drive Link"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">Availability:</span>
                            <p className="text-gray-900 mt-1">
                              {application.applicationData?.availability || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, "reviewed")}
                            disabled={application.status === "reviewed"}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Mark as Reviewed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, "shortlisted")}
                            disabled={application.status === "shortlisted"}
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Shortlist & Auto Email
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, "rejected")}
                            disabled={application.status === "rejected"}
                            className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredApplications.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {jobApplications.length === 0
                          ? "No job applications received yet."
                          : "No applications match your current filters."}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {jobApplications.length === 0
                          ? "Applications will appear here when candidates apply for your job openings."
                          : "Try adjusting your filters to see more results."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="emails">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Email Replies Management
                  </h2>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {emailReplies.length} Total Replies
                  </Badge>
                </div>

                {/* Email Replies List */}
                <div className="space-y-4">
                  {emailReplies.map((reply) => (
                    <Card
                      key={reply.id}
                      className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        !reply.isRead && !reply.isFromAdmin ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                                <Mail className="h-5 w-5 text-white" />
                              </div>
                              {reply.applicantName}
                              {!reply.isRead && !reply.isFromAdmin && (
                                <Badge className="bg-red-100 text-red-800 border-red-200">New Reply</Badge>
                              )}
                              {reply.isFromAdmin && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">Admin Reply</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                              Subject: <span className="font-semibold text-gray-700">{reply.subject}</span> •{" "}
                              {reply.receivedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReply(reply)
                                if (!reply.isRead && !reply.isFromAdmin) {
                                  markReplyAsRead(reply.id)
                                }
                              }}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Full Message
                            </Button>
                            {!reply.isFromAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedReply(reply)
                                  setIsReplyModalOpen(true)
                                  if (!reply.isRead) {
                                    markReplyAsRead(reply.id)
                                  }
                                }}
                                className="border-green-300 text-green-600 hover:bg-green-50"
                              >
                                <Reply className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>From:</strong> {reply.applicantEmail}
                          </p>
                          <p className="text-gray-900 line-clamp-3">{reply.message}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {emailReplies.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="text-center py-12">
                      <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No email replies received yet.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Email replies from candidates will appear here when they respond to your emails.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Reply Modal */}
          {isReplyModalOpen && selectedReply && (
            <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Reply className="h-5 w-5" />
                    Reply to {selectedReply.applicantName}
                  </DialogTitle>
                  <DialogDescription>Review the original message and compose your reply.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Original Message:</strong>
                    </p>
                    <p className="text-gray-900">{selectedReply.message}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyMessage" className="text-sm font-semibold">
                      Your Reply
                    </Label>
                    <Textarea
                      id="replyMessage"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      className="min-h-[150px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsReplyModalOpen(false)
                        setReplyMessage("")
                        setSelectedReply(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={sendReplyToApplicant}
                      disabled={!replyMessage.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Email Preview and Send Modal */}
          {isEmailPreviewModalOpen && currentEmailDraft && (
            <Dialog open={isEmailPreviewModalOpen} onOpenChange={setIsEmailPreviewModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Prepare Email for {currentEmailDraft.applicantName}
                  </DialogTitle>
                  <DialogDescription>Review and edit the email content before sending.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailSubject" className="text-sm font-semibold">
                      Subject
                    </Label>
                    <Input
                      id="emailSubject"
                      value={currentEmailDraft.subject}
                      onChange={(e) =>
                        setCurrentEmailDraft((prev) => (prev ? { ...prev, subject: e.target.value } : null))
                      }
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailBody" className="text-sm font-semibold">
                      Body
                    </Label>
                    <Textarea
                      id="emailBody"
                      value={currentEmailDraft.body}
                      onChange={(e) =>
                        setCurrentEmailDraft((prev) => (prev ? { ...prev, body: e.target.value } : null))
                      }
                      placeholder="Type your email message here..."
                      className="min-h-[200px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEmailPreviewModalOpen(false)
                        setCurrentEmailDraft(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmSendEmailAndUpdateStatus}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Email & Update
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* View Reply Modal */}
          {selectedReply && !isReplyModalOpen && (
            <Dialog open={!!selectedReply} onOpenChange={() => setSelectedReply(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email from {selectedReply.applicantName}
                  </DialogTitle>
                  <DialogDescription>View the full message from the applicant.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-600">From:</span>
                      <p className="text-gray-900 mt-1">{selectedReply.applicantEmail}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-600">Received:</span>
                      <p className="text-gray-900 mt-1">
                        {selectedReply.receivedAt?.toDate?.()?.toLocaleString() || "Recently"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Subject</Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-900">{selectedReply.subject}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Message</Label>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedReply.message}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelectedReply(null)}>
                      Close
                    </Button>
                    {!selectedReply.isFromAdmin && (
                      <Button
                        onClick={() => {
                          setIsReplyModalOpen(true)
                        }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Application Details Modal */}
          {selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedApplication.applicantName}</h2>
                      <p className="text-purple-100 mt-1">Application for {selectedApplication.jobTitle}</p>
                    </div>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="text-purple-100 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Name:</span>
                        <p className="text-gray-900 mt-1">{selectedApplication.applicantName}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900 mt-1">{selectedApplication.applicantEmail}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Phone:</span>
                        <p className="text-gray-900 mt-1">{selectedApplication.applicantPhone}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Location:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.city}, {selectedApplication.applicationData?.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Current Role:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.currentJobTitle || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Current Company:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.currentCompany || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Total Experience:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.totalExperience || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Relevant Experience:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.relevantExperience || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Expected Salary:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.expectedSalary || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Notice Period:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.noticePeriod || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-5 w-5 text-blue-600" />
                      Education
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Highest Education:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.highestEducation || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">University:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.university || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Graduation Year:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.graduationYear || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Download className="h-5 w-5 text-blue-600" />
                      Resume
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      {selectedApplication.applicationData?.resumeType === "link" ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Resume Link:</p>
                            <p className="text-sm text-gray-600 break-all mt-1">
                              {selectedApplication.applicationData?.resumeLink}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedApplication.applicationData?.resumeLink, "_blank")}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open Link
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Resume File:</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedApplication.applicationData?.resumeFileName || "resume.pdf"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeDownload(selectedApplication)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  {(selectedApplication.applicationData?.portfolioUrl ||
                    selectedApplication.applicationData?.linkedinUrl ||
                    selectedApplication.applicationData?.githubUrl) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-blue-600" />
                        Professional Links
                      </h3>
                      <div className="space-y-3">
                        {selectedApplication.applicationData?.portfolioUrl && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">Portfolio:</span>
                            <a
                              href={selectedApplication.applicationData.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block mt-1 break-all"
                            >
                              {selectedApplication.applicationData.portfolioUrl}
                            </a>
                          </div>
                        )}
                        {selectedApplication.applicationData?.linkedinUrl && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">LinkedIn:</span>
                            <a
                              href={selectedApplication.applicationData.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block mt-1 break-all"
                            >
                              {selectedApplication.applicationData.linkedinUrl}
                            </a>
                          </div>
                        )}
                        {selectedApplication.applicationData?.githubUrl && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-600">GitHub:</span>
                            <a
                              href={selectedApplication.applicationData.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block mt-1 break-all"
                            >
                              {selectedApplication.applicationData.githubUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {selectedApplication.applicationData?.coverLetter && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        Cover Letter
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <p className="text-sm whitespace-pre-wrap text-gray-900 leading-relaxed">
                          {selectedApplication.applicationData.coverLetter}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Availability:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.availability || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Willing to Relocate:</span>
                        <p className="text-gray-900 mt-1">
                          {selectedApplication.applicationData?.relocateWillingness || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      Update Application Status
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        variant={selectedApplication.status === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          updateApplicationStatus(selectedApplication.id, "pending")
                          setSelectedApplication({ ...selectedApplication, status: "pending" })
                        }}
                        className={
                          selectedApplication.status === "pending"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "border-amber-300 text-amber-600 hover:bg-amber-50"
                        }
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Pending
                      </Button>
                      <Button
                        variant={selectedApplication.status === "reviewed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          updateApplicationStatus(selectedApplication.id, "reviewed")
                          setSelectedApplication({ ...selectedApplication, status: "reviewed" })
                        }}
                        className={
                          selectedApplication.status === "reviewed"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "border-blue-300 text-blue-600 hover:bg-blue-50"
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Reviewed
                      </Button>
                      <Button
                        variant={selectedApplication.status === "shortlisted" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          updateApplicationStatus(selectedApplication.id, "shortlisted")
                          // Status update and email sending will be handled by the modal confirmation
                        }}
                        className={
                          selectedApplication.status === "shortlisted"
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Shortlist & Auto Email
                      </Button>
                      <Button
                        variant={selectedApplication.status === "rejected" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          updateApplicationStatus(selectedApplication.id, "rejected")
                          // Status update and email sending will be handled by the modal confirmation
                        }}
                        className={
                          selectedApplication.status === "rejected"
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "border-red-300 text-red-600 hover:bg-red-50"
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleAdminLayout>
  )
}
