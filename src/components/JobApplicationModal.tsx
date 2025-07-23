"use client"

import { useState } from "react"
import { X, FileText, User, Briefcase, GraduationCap, Upload, LinkIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { toast } from "@/hooks/use-toast"

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
}

interface JobApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobOpening | null
  whatsappNumber: string
}

interface ApplicationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  currentJobTitle: string
  currentCompany: string
  totalExperience: string
  relevantExperience: string
  currentSalary: string
  expectedSalary: string
  noticePeriod: string
  highestEducation: string
  university: string
  graduationYear: string
  coverLetter: string
  portfolioUrl: string
  linkedinUrl: string
  githubUrl: string
  availability: string
  relocateWillingness: string
  resumeType: string // 'upload' or 'link'
  resumeFile: File | null
  resumeLink: string
}

export default function JobApplicationModal({ isOpen, onClose, job, whatsappNumber }: JobApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    currentJobTitle: "",
    currentCompany: "",
    totalExperience: "",
    relevantExperience: "",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "",
    highestEducation: "",
    university: "",
    graduationYear: "",
    coverLetter: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    availability: "",
    relocateWillingness: "",
    resumeType: "upload",
    resumeFile: null,
    resumeLink: "",
  })

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setApplicationData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (file: File | null) => {
    setApplicationData((prev) => ({
      ...prev,
      resumeFile: file,
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          applicationData.firstName.trim() &&
          applicationData.lastName.trim() &&
          applicationData.email.trim() &&
          applicationData.phone.trim()
        )
      case 2:
        return !!(
          applicationData.totalExperience &&
          applicationData.expectedSalary.trim() &&
          applicationData.noticePeriod
        )
      case 3:
        return !!(applicationData.highestEducation && applicationData.availability)
      case 4:
        if (applicationData.resumeType === "upload") {
          return !!applicationData.resumeFile
        } else {
          return !!applicationData.resumeLink.trim()
        }
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!job) return

    setIsSubmitting(true)
    try {
      // Prepare application data for Firebase
      const applicationSubmission = {
        jobId: job.id,
        jobTitle: job.title,
        applicantName: `${applicationData.firstName} ${applicationData.lastName}`,
        applicantEmail: applicationData.email,
        applicantPhone: applicationData.phone,
        applicationData: {
          ...applicationData,
          resumeFileName: applicationData.resumeFile?.name || null,
          resumeFileSize: applicationData.resumeFile?.size || null,
        },
        status: "pending",
        appliedAt: new Date(),
        notes: "",
      }

      // Save to Firebase
      await addDoc(collection(db, "jobApplications"), applicationSubmission)

      toast({
        title: "Application Submitted Successfully!",
        description: "Thank you for your application. We will review it and get back to you soon.",
      })

      onClose()
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please fill all required fields",
        description: "All required fields must be completed before proceeding to the next step.",
        variant: "destructive",
      })
      return
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
            <p className="text-gray-600">
              {job.department} • {job.location}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
              <span className="text-sm text-gray-500">
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Professional Details"}
                {currentStep === 3 && "Education & Availability"}
                {currentStep === 4 && "Resume & Final Details"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={applicationData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className={!applicationData.firstName.trim() ? "border-red-300" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={applicationData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className={!applicationData.lastName.trim() ? "border-red-300" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className={!applicationData.email.trim() ? "border-red-300" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={applicationData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    className={!applicationData.phone.trim() ? "border-red-300" : ""}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={applicationData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={applicationData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={applicationData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={applicationData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Professional Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentJobTitle">Current Job Title</Label>
                  <Input
                    id="currentJobTitle"
                    value={applicationData.currentJobTitle}
                    onChange={(e) => handleInputChange("currentJobTitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    value={applicationData.currentCompany}
                    onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalExperience">Total Experience *</Label>
                  <Select onValueChange={(value) => handleInputChange("totalExperience", value)}>
                    <SelectTrigger className={!applicationData.totalExperience ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-8">5-8 years</SelectItem>
                      <SelectItem value="8-12">8-12 years</SelectItem>
                      <SelectItem value="12+">12+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="relevantExperience">Relevant Experience</Label>
                  <Select onValueChange={(value) => handleInputChange("relevantExperience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relevant experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-8">5-8 years</SelectItem>
                      <SelectItem value="8+">8+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentSalary">Current Salary (Optional)</Label>
                  <Input
                    id="currentSalary"
                    value={applicationData.currentSalary}
                    onChange={(e) => handleInputChange("currentSalary", e.target.value)}
                    placeholder="e.g., $80,000"
                  />
                </div>
                <div>
                  <Label htmlFor="expectedSalary">Expected Salary *</Label>
                  <Input
                    id="expectedSalary"
                    value={applicationData.expectedSalary}
                    onChange={(e) => handleInputChange("expectedSalary", e.target.value)}
                    placeholder="e.g., $90,000"
                    required
                    className={!applicationData.expectedSalary.trim() ? "border-red-300" : ""}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="noticePeriod">Notice Period *</Label>
                <Select onValueChange={(value) => handleInputChange("noticePeriod", value)}>
                  <SelectTrigger className={!applicationData.noticePeriod ? "border-red-300" : ""}>
                    <SelectValue placeholder="Select notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-months">2 months</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Education & Links */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Education & Professional Links</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="highestEducation">Highest Education *</Label>
                  <Select onValueChange={(value) => handleInputChange("highestEducation", value)}>
                    <SelectTrigger className={!applicationData.highestEducation ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="associate">Associate Degree</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    value={applicationData.graduationYear}
                    onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  value={applicationData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  value={applicationData.portfolioUrl}
                  onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input
                    id="linkedinUrl"
                    value={applicationData.linkedinUrl}
                    onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label htmlFor="githubUrl">GitHub Profile</Label>
                  <Input
                    id="githubUrl"
                    value={applicationData.githubUrl}
                    onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability">When can you start? *</Label>
                  <Select onValueChange={(value) => handleInputChange("availability", value)}>
                    <SelectTrigger className={!applicationData.availability ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="2-weeks">In 2 weeks</SelectItem>
                      <SelectItem value="1-month">In 1 month</SelectItem>
                      <SelectItem value="2-months">In 2 months</SelectItem>
                      <SelectItem value="3-months">In 3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="relocateWillingness">Willing to Relocate?</Label>
                  <Select onValueChange={(value) => handleInputChange("relocateWillingness", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="depends">Depends on location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Resume & Final Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Resume & Final Details</h3>
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  className="min-h-[120px]"
                />
              </div>

              {/* Resume Upload/Link Section */}
              <div className="space-y-4">
                <Label>Resume *</Label>
                <RadioGroup
                  value={applicationData.resumeType}
                  onValueChange={(value) => handleInputChange("resumeType", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label htmlFor="upload" className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Upload Resume
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="link" id="link" />
                    <Label htmlFor="link" className="flex items-center gap-2 cursor-pointer">
                      <LinkIcon className="h-4 w-4" />
                      Share Drive Link
                    </Label>
                  </div>
                </RadioGroup>

                {applicationData.resumeType === "upload" ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {applicationData.resumeFile
                            ? `Selected: ${applicationData.resumeFile.name}`
                            : "Click to upload your resume (PDF, DOC, DOCX)"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>
                      </label>
                    </div>
                    {!applicationData.resumeFile && (
                      <p className="text-red-500 text-sm">Please upload your resume to continue</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="https://drive.google.com/file/d/your-resume-link"
                      value={applicationData.resumeLink}
                      onChange={(e) => handleInputChange("resumeLink", e.target.value)}
                      className={!applicationData.resumeLink.trim() ? "border-red-300" : ""}
                    />
                    <p className="text-xs text-gray-500">
                      Share a Google Drive, Dropbox, or OneDrive link to your resume. Make sure the link is publicly
                      accessible.
                    </p>
                    {!applicationData.resumeLink.trim() && (
                      <p className="text-red-500 text-sm">Please provide a link to your resume to continue</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📋 Application Review</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Please review your application before submitting. Once submitted, you will receive a confirmation and
                  our HR team will review your application.
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Your application will be reviewed within 3-5 business days</li>
                  <li>We will contact you via email for next steps</li>
                  <li>Keep your phone and email accessible for communication</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !validateStep(4)}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
