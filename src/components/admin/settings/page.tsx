"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Phone, MessageSquare, Calendar, Save, RefreshCw, Mail, Clock, Bell, Building, Settings } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { motion } from "framer-motion"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"

interface ContactSettings {
  phoneNumber: string
  whatsappNumber: string
  enableDemo: boolean
  reminderTime: number
  adminEmail: string
  adminPhone: string
  companyName: string
}

function GeneralSettingsContent() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    phoneNumber: "+1 234 567 8900",
    whatsappNumber: "+1234567890",
    enableDemo: true,
    reminderTime: 30,
    adminEmail: "admin@yourdomain.com",
    adminPhone: "+1234567890",
    companyName: "Your Company",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const docRef = doc(db, "adminSettings", "contactSettings")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as ContactSettings
        setContactSettings(data)
      } else {
        await setDoc(docRef, contactSettings)
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
      await setDoc(docRef, contactSettings)
      toast({
        title: "Settings Saved",
        description: "Contact settings have been updated successfully.",
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

  const handleInputChange = (field: keyof ContactSettings, value: string | boolean | number) => {
    setContactSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
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
      <div className="space-y-8 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              General Settings
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Configure your admin contact details and widget preferences</p>
          </div>
          <div className="flex space-x-3">
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
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Bell className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Admin Contact Information</CardTitle>
                  <CardDescription className="text-orange-100 text-lg mt-1">
                    Configure your admin contact details and preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-orange-600" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={contactSettings.companyName}
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
                    value={contactSettings.adminEmail}
                    onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                    placeholder="admin@yourdomain.com"
                    className="h-12 border-2 border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-xl shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="adminPhone" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-600" />
                    Admin Phone Number
                  </Label>
                  <Input
                    id="adminPhone"
                    type="tel"
                    value={contactSettings.adminPhone}
                    onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="h-12 border-2 border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-xl shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Widget Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Contact Widget Settings</CardTitle>
                  <CardDescription className="text-green-100 text-lg mt-1">
                    Configure the floating contact widget that appears on your website
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="phoneNumber" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    Customer Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={contactSettings.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="h-12 border-2 border-green-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 rounded-xl shadow-sm"
                  />
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    This number will be used for the "Call Us" button in your contact widget
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="whatsappNumber" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={contactSettings.whatsappNumber}
                    onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                    placeholder="+1234567890"
                    className="h-12 border-2 border-green-200 focus:ring-2 focus:ring-green-400 focus:border-green-400 rounded-xl shadow-sm"
                  />
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    WhatsApp number (without spaces or special characters)
                  </p>
                </div>
              </div>
              <Separator className="my-8" />
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-200 rounded-2xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="enableDemo" className="text-lg font-bold text-gray-700">
                      Enable Demo Scheduling
                    </Label>
                    <p className="text-sm text-gray-600">Show "Schedule a Demo" button in the contact widget</p>
                  </div>
                </div>
                <Switch
                  id="enableDemo"
                  checked={contactSettings.enableDemo}
                  onCheckedChange={(checked) => handleInputChange("enableDemo", checked)}
                  className="data-[state=checked]:bg-blue-600 scale-125"
                />
              </div>
              {contactSettings.enableDemo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 p-8 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200"
                >
                  <h3 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
                    <Calendar className="h-6 w-6" />
                    Demo Reminder Settings
                  </h3>
                  <div className="space-y-4">
                    <Label htmlFor="reminderTime" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Reminder Timing
                    </Label>
                    <p className="text-sm text-gray-600 bg-white p-4 rounded-xl">
                      How many minutes before the demo should the reminder be sent?
                    </p>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="reminderTime"
                        type="number"
                        min="5"
                        max="1440"
                        step="5"
                        value={contactSettings.reminderTime}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 30
                          if (value >= 5 && value <= 1440) {
                            handleInputChange("reminderTime", value)
                          }
                        }}
                        className="w-40 h-12 border-2 border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl shadow-sm text-center font-bold text-lg"
                      />
                      <span className="text-lg text-gray-700 font-semibold bg-white px-4 py-3 rounded-xl border border-gray-200">
                        minutes before demo
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 bg-white p-3 rounded-lg">
                      Range: 5 minutes to 24 hours (1440 minutes)
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Preview Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Settings className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Widget Preview</CardTitle>
                  <CardDescription className="text-gray-100 text-lg mt-1">
                    Live preview of how your contact widget will appear to users
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-12 relative min-h-[300px] border-2 border-orange-200">
                <div className="absolute bottom-8 right-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-6 w-96 mb-6"
                  >
                    <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-orange-600" />
                      Get in Touch
                    </h4>
                    <div className="space-y-4">
                      {contactSettings.enableDemo && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 py-4 px-5 rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                          <Calendar size={20} />
                          Schedule a Demo
                        </motion.div>
                      )}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-green-200 text-green-800 py-4 px-5 rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
                      >
                        <MessageSquare size={20} />
                        Chat on WhatsApp
                      </motion.div>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex items-center gap-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-5 rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
                      >
                        <Phone size={20} />
                        Call {contactSettings.phoneNumber}
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.1, type: "spring", stiffness: 300 }}
                    className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-200 cursor-pointer hover:scale-110"
                  >
                    <MessageSquare className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
                <div className="text-center max-w-2xl">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Live Widget Preview</h3>
                  <p className="text-gray-600 text-xl leading-relaxed">
                    Your contact widget will appear in the bottom-right corner of your website, providing visitors with
                    easy access to support and demo scheduling options.
                  </p>
                </div>
              </div>
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
