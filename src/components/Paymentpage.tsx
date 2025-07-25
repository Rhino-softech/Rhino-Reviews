"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Loader2, Landmark, Package, Crown } from "lucide-react"
import { db } from "../firebase/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"

type PaymentOption = {
  id: string
  name: string
  icon: React.ReactNode
}

type RazorpayResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance
    }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  image: string
  order_id?: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  modal?: {
    ondismiss: () => void
  }
}

interface RazorpayInstance {
  open: () => void
  close: () => void
}

// Accurate SVG icons for payment methods
const GooglePayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6">
    <path
      fill="#4285F4"
      d="M10.2 12v2.8h4.6c-.2 1.5-1.7 4.4-4.6 4.4-2.8 0-5-2.3-5-5s2.2-5 5-5c1.6 0 2.7.7 3.3 1.3l2.3-2.3C14.4 4.1 12.5 3.4 10.2 3.4c-4.8 0-8.6 3.9-8.6 8.6s3.9 8.6 8.6 8.6c5 0 8.3-3.5 8.3-8.4 0-.5-.1-1-.2-1.4H10.2z"
    />
  </svg>
)

const PhonePeIcon = () => (
  <svg viewBox="0 0 40 40" className="h-6 w-6">
    <path
      fill="#5F259F"
      d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm7.5 25.938c-2.5 0-3.75-1.25-3.75-3.75v-10h-2.5v11.25c0 3.75 2.5 6.25 6.25 6.25h2.5v-2.5h-2.5z"
    />
  </svg>
)

const PaytmIcon = () => (
  <svg viewBox="0 0 1024 1024" className="h-6 w-6">
    <path
      fill="#203F9E"
      d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm256 614.4c-40 0-60-20-60-60V358.4h-40v240c0 60 40 100 100 100h40v-40h-40z"
    />
    <path fill="#00BAF2" d="M708 358.4h40v240c0 40 20 60 60 60h40v-40h-40c-60 0-100-40-100-100V358.4z" />
  </svg>
)

const paymentOptions: PaymentOption[] = [
  {
    id: "gpay",
    name: "Google Pay",
    icon: <GooglePayIcon />,
  },
  {
    id: "phonepe",
    name: "PhonePe",
    icon: <PhonePeIcon />,
  },
  {
    id: "paytm",
    name: "Paytm",
    icon: <PaytmIcon />,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    icon: <Landmark className="h-6 w-6 text-blue-600" />,
  },
]

const PaymentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // EXTRACT ALL PAYMENT DATA INCLUDING ADD-ON FLAGS
  const {
    planName,
    price,
    planId,
    isAddon = false, // FLAG TO IDENTIFY ADD-ON PURCHASES
    addonReplies = 0, // NUMBER OF REPLY CREDITS FOR ADD-ONS
    features = [],
    reviews = 0,
    isFirstSubscription = false,
  } = location.state || {}

  const [selectedOption, setSelectedOption] = useState("gpay")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userId = localStorage.getItem("uid")

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise<void>((resolve) => {
        if (window.Razorpay) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => {
          setError("Failed to load payment system")
          resolve()
        }
        document.body.appendChild(script)
      })
    }

    loadRazorpay()
  }, [])

  // SUBSCRIPTION PLAN UPDATE - EXISTING LOGIC (UNCHANGED)
  const updateUserSubscription = async () => {
    if (!userId) return

    const userRef = doc(db, "users", userId)
    const now = new Date()
    const oneMonthLater = new Date()
    oneMonthLater.setMonth(now.getMonth() + 1)

    // GET CURRENT USER DATA TO PRESERVE EXISTING SUBSCRIPTION HISTORY
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()
    const existingHistory = userData?.subscriptionHistory || []

    // ADD CURRENT SUBSCRIPTION TO HISTORY IF IT EXISTS
    const updatedHistory = [...existingHistory]
    if (userData?.subscriptionPlan && userData?.subscriptionStartDate) {
      updatedHistory.push({
        plan: userData.subscriptionPlan,
        startDate: userData.subscriptionStartDate,
        endDate: userData.subscriptionEndDate || now,
        endedAt: now,
      })
    }

    await updateDoc(userRef, {
      subscriptionActive: true,
      subscriptionPlan: planId,
      subscriptionStartDate: now,
      subscriptionEndDate: oneMonthLater,
      lastPaymentDate: now,
      subscriptionHistory: updatedHistory,
      // PRESERVE EXISTING ADD-ON CREDITS (DON'T MODIFY THEM)
      // addonCredits and usedAddonCredits remain unchanged
    })
  }

  // ADD-ON CREDITS UPDATE - COMPLETELY SEPARATE FROM SUBSCRIPTION PLANS
  const updateAddonCredits = async () => {
    if (!userId || !addonReplies) return

    const userRef = doc(db, "users", userId)

    // GET CURRENT ADD-ON CREDITS
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()
    const currentAddonCredits = userData?.addonCredits || 0

    // ADD NEW CREDITS TO EXISTING CREDITS (ACCUMULATIVE)
    const newTotalCredits = currentAddonCredits + addonReplies

    await updateDoc(userRef, {
      addonCredits: newTotalCredits,
      lastAddonPurchase: new Date(),
      // DON'T MODIFY SUBSCRIPTION PLAN DATA
      // subscriptionPlan, subscriptionActive, etc. remain unchanged
    })
  }

  const handlePayment = async () => {
    if (!price || !planName || !userId) {
      setError("Plan information or user ID is missing")
      return
    }

    if (!window.Razorpay) {
      setError("Payment system is not available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const amountInPaise = Math.round(Number(price) * 100)

      const options: RazorpayOptions = {
        key: "rzp_test_5Liv4sRSmiSdzx",
        amount: amountInPaise,
        currency: "INR",
        name: "TripSync",
        description: isAddon
          ? `Add-on: ${planName} (${addonReplies} Reply Credits)`
          : `Subscription to ${planName} Plan`,
        image: "/logo192.png",
        handler: async (response: RazorpayResponse) => {
          try {
            // HANDLE ADD-ON PURCHASE VS SUBSCRIPTION PURCHASE SEPARATELY
            if (isAddon) {
              // ADD-ON PURCHASE - ONLY UPDATE ADD-ON CREDITS
              await updateAddonCredits()
              navigate("/components/business/reviews", {
                state: {
                  paymentId: response.razorpay_payment_id,
                  planName,
                  price,
                  isAddon: true,
                  addonReplies,
                  message: `Successfully purchased ${addonReplies} reply credits for previous plan reviews!`,
                },
              })
            } else {
              // SUBSCRIPTION PURCHASE - UPDATE SUBSCRIPTION DATA
              await updateUserSubscription()
              navigate("/components/business/dashboard", {
                state: {
                  paymentId: response.razorpay_payment_id,
                  planName,
                  price,
                  isAddon: false,
                },
              })
            }
          } catch (err) {
            console.error("Failed to update user data:", err)
            setError(
              isAddon
                ? "Payment successful but failed to add reply credits. Please contact support."
                : "Payment successful but failed to update your subscription. Please contact support.",
            )
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: isAddon ? "#f97316" : "#3b82f6", // Orange for add-ons, blue for subscriptions
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          },
        },
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.open()
    } catch (err) {
      console.error("Payment error:", err)
      setError("Failed to process payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!planName || !price) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Plan Information Missing</h2>
          <p className="text-gray-600 mb-6">Please select a plan before proceeding to payment.</p>
          <Button
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-4 text-lg"
            onClick={() => navigate("/#pricing")}
          >
            Back to Pricing
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      <div className="bg-white rounded-xl shadow-xl p-8 sm:p-10 w-full max-w-2xl">
        <div className="text-center mb-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isAddon ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
            }`}
          >
            {isAddon ? (
              <>
                <Package className="w-4 h-4 mr-1" />
                Add-on Purchase
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-1" />
                Step 2 of 2
              </>
            )}
          </span>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isAddon ? "Purchase Reply Credits" : "Complete Your Subscription"}
        </h2>

        <p className="text-center text-gray-600 mb-8">
          {isAddon ? (
            <>
              You're purchasing <span className="font-semibold text-orange-600">{addonReplies} reply credits</span> for
              previous plan reviews
            </>
          ) : (
            <>
              You're subscribing to the <span className="font-semibold text-blue-600">{planName}</span> plan
            </>
          )}
        </p>

        <div
          className={`${
            isAddon ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"
          } rounded-lg p-6 mb-8 border`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {isAddon ? (
                  <>
                    <Package className="w-5 h-5 text-orange-600" />
                    {planName}
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 text-blue-600" />
                    {planName} Plan
                  </>
                )}
              </h3>
              <p className="text-gray-600">
                {isAddon ? `${addonReplies} reply credits for previous plans` : "Billed monthly"}
              </p>
              {isFirstSubscription && !isAddon && (
                <p className="text-green-600 text-sm font-semibold mt-1">
                  🎁 Includes +25 bonus reviews for first-time subscribers!
                </p>
              )}
            </div>
            <div className={`text-3xl font-bold ${isAddon ? "text-orange-600" : "text-blue-600"}`}>${price}</div>
          </div>
        </div>

        {/* ADD-ON SPECIFIC INFORMATION */}
        {isAddon && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-semibold mb-1">Important: Add-on Credits</div>
                <ul className="space-y-1 text-xs">
                  <li>• These credits are separate from your subscription plan</li>
                  <li>• Only work for reviews from previous subscription periods</li>
                  <li>• Credits never expire and accumulate with existing credits</li>
                  <li>• Does not affect your current subscription plan or limits</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center border-2 rounded-xl p-6 transition-all hover:shadow-md focus:outline-none ${
                  selectedOption === option.id
                    ? isAddon
                      ? "border-orange-500 bg-orange-50"
                      : "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="mb-3 p-3 bg-white rounded-full shadow-sm">{option.icon}</div>
                <span className="text-gray-800 font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>}

        <Button
          className={`w-full ${
            isAddon
              ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          } py-6 text-lg font-semibold`}
          onClick={handlePayment}
          disabled={isLoading || !window.Razorpay}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              {isAddon ? (
                <>
                  <Package className="mr-2 h-5 w-5" />
                  Purchase {addonReplies} Credits for ${price}
                </>
              ) : (
                `Pay $${price} Now`
              )}
            </>
          )}
        </Button>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Secure payment powered by Razorpay</span>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => (isAddon ? navigate("/components/business/reviews") : navigate("/#pricing"))}
            className={`${
              isAddon ? "text-orange-600 hover:text-orange-700" : "text-blue-600 hover:text-blue-700"
            } font-medium`}
          >
            ← {isAddon ? "Back to Reviews" : "Back to plans"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
