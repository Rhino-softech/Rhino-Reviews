"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Save, RefreshCw, Mail, Building, Shield, Eye, EyeOff } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db, auth } from "@/firebase/firebase"
import { updatePassword, onAuthStateChanged } from "firebase/auth"
import { motion } from "framer-motion"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"

interface AdminSettings {
  adminEmail: string
  adminPhone: string
  companyName: string
}

function GeneralSettingsContent() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    adminEmail: "admin@yourdomain.com",
    adminPhone: "+1234567890",
    companyName: "Your Company",
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
        fetchSettings()
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const docRef = doc(db, "adminSettings", "contactSettings")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as AdminSettings
        setAdminSettings(data)
      } else {
        await setDoc(docRef, adminSettings)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const docRef = doc(db, "adminSettings", "contactSettings")
      await setDoc(docRef, adminSettings)
      toast({
        title: "Settings Saved",
        description: "Admin settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof AdminSettings, value: string) => {
    setAdminSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Password change handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validatePasswords = () => {
    let isValid = true
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
      isValid = false
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
      isValid = false
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setPasswordErrors(newErrors)
    return isValid
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswords()) {
      return
    }

    setIsUpdatingPassword(true)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User not authenticated")
      }

      await updatePassword(user, passwordData.newPassword)

      toast({
        title: "Success",
        description: "Password updated successfully",
      })

      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)
      let errorMessage = "Failed to update password"
      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please login again to change your password"
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              General Settings
            </h1>
            <p className="text-gray-600 mt-2 text-base md:text-lg">Configure your admin account and preferences</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={fetchSettings}
              disabled={loading}
              className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-lg bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Admin Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-sm">
                  <Building className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-3xl font-bold">Admin Information</CardTitle>
                  <CardDescription className="text-orange-100 text-base md:text-lg mt-1">
                    Configure your admin contact details and company information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-orange-600" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={adminSettings.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Your Company Name"
                    className="h-12 border-2 border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-xl shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="adminEmail" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-600" />
                    Admin Email Address
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminSettings.adminEmail}
                    onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                    placeholder="admin@yourdomain.com"
                    className="h-12 border-2 border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-xl shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="adminPhone" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-600" />
                    Admin Phone Number
                  </Label>
                  <Input
                    id="adminPhone"
                    type="tel"
                    value={adminSettings.adminPhone}
                    onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="h-12 border-2 border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-xl shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-sm">
                  <Shield className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-3xl font-bold">Change Password</CardTitle>
                  <CardDescription className="text-red-100 text-base md:text-lg mt-1">
                    Update your admin account password for enhanced security
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                      New Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="h-12 pr-12 border-2 border-red-200 focus:ring-2 focus:ring-red-300 focus:border-red-400 rounded-xl shadow-sm transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <motion.p
                        className="text-sm text-red-500 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {passwordErrors.newPassword}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="h-12 pr-12 border-2 border-red-200 focus:ring-2 focus:ring-red-300 focus:border-red-400 rounded-xl shadow-sm transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <motion.p
                        className="text-sm text-red-500 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {passwordErrors.confirmPassword}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    className="flex justify-end pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 md:px-8 py-2 md:py-2.5 rounded-xl font-semibold text-sm md:text-base w-full sm:w-auto"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="mr-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </motion.div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function GeneralSettings() {
  return (
    <SimpleAdminLayout>
      <GeneralSettingsContent />
    </SimpleAdminLayout>
  )
}
