"use client"

import { useState, useEffect } from "react"
import { DollarSign, Save, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SimpleAdminLayout } from "@/components/simple-admin-layout"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

function PricingSettingsContent() {
  const [pricing, setPricing] = useState({
    starter: 49,
    professional: 99,
    custom: 299,
    buttonsDisabled: false,
  })
  const [addonPackages, setAddonPackages] = useState([
    {
      id: "basic",
      name: "Basic Package",
      replies: 50,
      price: 19,
      description: "Perfect for occasional use",
      icon: "📦",
      popular: false,
    },
    {
      id: "standard",
      name: "Standard Package",
      replies: 150,
      price: 49,
      description: "Most popular choice",
      icon: "🎯",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium Package",
      replies: 300,
      price: 89,
      description: "For heavy usage",
      icon: "💎",
      popular: false,
    },
  ])
  const [activeTab, setActiveTab] = useState("subscription")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPackage, setNewPackage] = useState({
    name: "",
    replies: 0,
    price: 0,
    description: "",
    icon: "📦",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pricing
        const pricingRef = doc(db, "admin", "pricing")
        const pricingDoc = await getDoc(pricingRef)
        if (pricingDoc.exists()) {
          const data = pricingDoc.data()
          setPricing({
            starter: data.starter || 49,
            professional: data.professional || 99,
            custom: data.custom || 299,
            buttonsDisabled: data.buttonsDisabled || false,
          })
        }

        // Fetch addon packages
        const addonRef = doc(db, "admin", "addonPackages")
        const addonDoc = await getDoc(addonRef)
        if (addonDoc.exists()) {
          const data = addonDoc.data()
          setAddonPackages(data.packages || addonPackages)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === "subscription") {
        const pricingRef = doc(db, "admin", "pricing")
        await setDoc(pricingRef, pricing, { merge: true })

        // Also save to public pricing collection for frontend access
        const publicPricingRef = doc(db, "settings", "pricing")
        await setDoc(publicPricingRef, pricing, { merge: true })
      } else {
        const addonRef = doc(db, "admin", "addonPackages")
        await setDoc(addonRef, { packages: addonPackages }, { merge: true })
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePriceChange = (plan: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setPricing((prev) => ({
      ...prev,
      [plan]: numValue,
    }))
  }

  const handleToggleButtons = async () => {
    const newState = !pricing.buttonsDisabled
    setPricing((prev) => ({
      ...prev,
      buttonsDisabled: newState,
    }))

    // Immediately save the button state to ensure it's reflected on the frontend
    try {
      const pricingRef = doc(db, "admin", "pricing")
      const publicPricingRef = doc(db, "settings", "pricing")

      const updatedPricing = { ...pricing, buttonsDisabled: newState }

      await Promise.all([
        setDoc(pricingRef, updatedPricing, { merge: true }),
        setDoc(publicPricingRef, updatedPricing, { merge: true }),
      ])

      toast({
        title: newState ? "Buttons Disabled" : "Buttons Enabled",
        description: newState
          ? "Pricing buttons are now disabled for all users"
          : "Pricing buttons are now active for all users",
      })
    } catch (error) {
      console.error("Error updating button state:", error)
      toast({
        title: "Error",
        description: "Failed to update button state",
        variant: "destructive",
      })
    }
  }

  const handleAddPackage = () => {
    if (newPackage.name && newPackage.replies && newPackage.price) {
      setAddonPackages((prev) => [
        ...prev,
        {
          ...newPackage,
          id: Date.now().toString(),
        },
      ])
      setNewPackage({
        name: "",
        replies: 0,
        price: 0,
        description: "",
        icon: "📦",
      })
    }
  }

  const handleDeletePackage = (id: string) => {
    setAddonPackages((prev) => prev.filter((pkg) => pkg.id !== id))
  }

  const handlePackageChange = (id: string, field: string, value: any) => {
    setAddonPackages((prev) => prev.map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg)))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading pricing settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pricing Management
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Configure subscription plans and add-on packages that automatically sync across your platform
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/90 border border-slate-200/60 rounded-2xl p-2 shadow-lg backdrop-blur-sm">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("subscription")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "subscription"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <DollarSign className="h-4 w-4" />
                Subscription Plans
              </button>
              <button
                onClick={() => setActiveTab("addon")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "addon"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Plus className="h-4 w-4" />
                Add-on Packages
              </button>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plans Tab */}
        {activeTab === "subscription" && (
          <motion.div
            className="bg-white/90 border border-slate-200/60 rounded-3xl p-8 shadow-xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Subscription Plans</h2>
                  <p className="text-slate-600 text-lg">Set competitive pricing for your subscription tiers</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Updates
                </div>
              </div>

              {/* Button Control Toggle */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-3xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Button Control</h3>
                    <p className="text-slate-600">
                      {pricing.buttonsDisabled
                        ? "Pricing buttons are currently disabled for all users"
                        : "Pricing buttons are active and users can upgrade their plans"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleButtons}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      pricing.buttonsDisabled
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {pricing.buttonsDisabled ? (
                      <>
                        <ToggleLeft className="h-5 w-5" />
                        Buttons Disabled
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-5 w-5" />
                        Buttons Enabled
                      </>
                    )}
                  </button>
                </div>
                {pricing.buttonsDisabled && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl">
                    <p className="text-red-700 text-sm">
                      <strong>⚠️ Warning:</strong> All pricing buttons are disabled. Users will see a maintenance message
                      and cannot upgrade their plans.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Starter Plan */}
                <div className="relative p-8 border-2 border-green-200 rounded-3xl bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all duration-300">
                  <div className="absolute -top-4 left-6">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">⚡</div>
                      Essential
                    </div>
                  </div>
                  <div className="text-center mt-6 mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Starter Plan</h3>
                    <p className="text-gray-600">Perfect for small businesses</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Monthly Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                          $
                        </span>
                        <Input
                          type="number"
                          value={pricing.starter}
                          onChange={(e) => handlePriceChange("starter", e.target.value)}
                          className="pl-10 text-center text-2xl font-bold h-14 border-2 border-gray-200 rounded-2xl focus:border-green-400"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>100 reviews/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Basic templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Email support</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Plan */}
                <div className="relative p-8 border-2 border-orange-200 rounded-3xl bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all duration-300 transform scale-105">
                  <div className="absolute -top-4 left-6">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">👑</div>
                      Most Popular
                    </div>
                  </div>
                  <div className="text-center mt-6 mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Professional Plan</h3>
                    <p className="text-gray-600">Ideal for growing businesses</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Monthly Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                          $
                        </span>
                        <Input
                          type="number"
                          value={pricing.professional}
                          onChange={(e) => handlePriceChange("professional", e.target.value)}
                          className="pl-10 text-center text-2xl font-bold h-14 border-2 border-gray-200 rounded-2xl focus:border-orange-400"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>500 reviews/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Advanced templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Priority support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Analytics dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="relative p-8 border-2 border-purple-200 rounded-3xl bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-all duration-300">
                  <div className="absolute -top-4 left-6">
                    <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">✨</div>
                      Premium
                    </div>
                  </div>
                  <div className="text-center mt-6 mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Enterprise Plan</h3>
                    <p className="text-gray-600">For large-scale operations</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Monthly Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                          $
                        </span>
                        <Input
                          type="number"
                          value={pricing.custom}
                          onChange={(e) => handlePriceChange("custom", e.target.value)}
                          className="pl-10 text-center text-2xl font-bold h-14 border-2 border-gray-200 rounded-2xl focus:border-purple-400"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Unlimited reviews</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Custom templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Dedicated support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>White-label options</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add-on Packages Tab */}
        {activeTab === "addon" && (
          <motion.div
            className="bg-white/90 border border-slate-200/60 rounded-3xl p-8 shadow-xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Add-on Packages</h2>
                  <p className="text-slate-600 text-lg">Manage reply credit packages for previous plan users</p>
                </div>
              </div>

              {/* Add New Package Form */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-6 mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Package Name</Label>
                    <Input
                      value={newPackage.name}
                      onChange={(e) => setNewPackage((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Basic Package"
                      className="border-2 border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Reply Credits</Label>
                    <Input
                      type="number"
                      value={newPackage.replies}
                      onChange={(e) =>
                        setNewPackage((prev) => ({ ...prev, replies: Number.parseInt(e.target.value) || 0 }))
                      }
                      placeholder="50"
                      className="border-2 border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Price (USD)</Label>
                    <Input
                      type="number"
                      value={newPackage.price}
                      onChange={(e) =>
                        setNewPackage((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="19"
                      className="border-2 border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Description</Label>
                    <Input
                      value={newPackage.description}
                      onChange={(e) => setNewPackage((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Perfect for..."
                      className="border-2 border-gray-200 rounded-xl"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddPackage}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </div>
                </div>
              </div>

              {/* Existing Packages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addonPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative p-6 border-2 rounded-3xl transition-all duration-300 hover:shadow-lg ${
                      pkg.popular
                        ? "border-orange-300 bg-gradient-to-br from-orange-50 to-white"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">POPULAR</div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">{pkg.icon}</div>
                      <Input
                        value={pkg.name}
                        onChange={(e) => handlePackageChange(pkg.id, "name", e.target.value)}
                        className="text-xl font-bold text-center border-none bg-transparent focus:bg-white focus:border-gray-300 mb-2"
                      />
                      <Input
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(pkg.id, "description", e.target.value)}
                        className="text-gray-600 text-center border-none bg-transparent focus:bg-white focus:border-gray-300"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Price (USD)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            value={pkg.price}
                            onChange={(e) =>
                              handlePackageChange(pkg.id, "price", Number.parseFloat(e.target.value) || 0)
                            }
                            className="pl-8 text-center font-bold text-lg border-2 border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Reply Credits</Label>
                        <Input
                          type="number"
                          value={pkg.replies}
                          onChange={(e) => handlePackageChange(pkg.id, "replies", Number.parseInt(e.target.value) || 0)}
                          className="text-center font-bold text-lg border-2 border-gray-200 rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={pkg.popular}
                            onChange={(e) => handlePackageChange(pkg.id, "popular", e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          Popular
                        </label>
                        <Button
                          onClick={() => handleDeletePackage(pkg.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-12 py-4 rounded-2xl font-bold text-lg"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save {activeTab === "subscription" ? "Pricing" : "Add-on Packages"}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function PricingSettings() {
  return (
    <SimpleAdminLayout>
      <PricingSettingsContent />
    </SimpleAdminLayout>
  )
}
