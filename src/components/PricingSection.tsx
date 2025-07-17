"use client"

import { Button } from "@/components/ui/button"
import { CheckIcon, StarIcon, Clock, Crown, Zap, ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { auth, db } from "../firebase/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"

interface UserPlan {
  trialActive: boolean
  subscriptionActive: boolean
  subscriptionPlan?: string
  trialEndDate?: Date
  trialDaysLeft?: number
}

interface PricingConfig {
  starter: number
  professional: number
  custom: number
  buttonsDisabled: boolean
}

interface ThemeSettings {
  primaryColor: string
  textColor: string
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  textColor: "#111827",
}

const PricingSection = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [userCurrency, setUserCurrency] = useState<string>("USD")
  const [currencySymbol, setCurrencySymbol] = useState<string>("$")
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    starter: 49,
    professional: 99,
    custom: 299,
    buttonsDisabled: false,
  })

  // Map currency symbols to country codes
  const CURRENCY_SYMBOLS: Record<string, string> = {
    US: "$",
    IN: "₹",
    GB: "£",
    AU: "A$",
    CA: "C$",
    EU: "€",
    DEFAULT: "$",
  }

  useEffect(() => {
    // Load theme settings
    const loadTheme = async () => {
      try {
        const themeDoc = await getDoc(doc(db, "settings", "homeTheme"))
        if (themeDoc.exists()) {
          setTheme({ ...defaultTheme, ...themeDoc.data() })
        }
      } catch (error) {
        console.error("Error loading theme:", error)
      }
    }
    loadTheme()
  }, [])

  useEffect(() => {
    // Fetch admin pricing configuration
    const fetchPricingConfig = async () => {
      try {
        // Try both admin and settings collections for pricing config
        const [adminConfigRef, settingsConfigRef] = await Promise.all([
          getDoc(doc(db, "admin", "pricing")),
          getDoc(doc(db, "settings", "pricing")),
        ])

        let configData = null
        if (adminConfigRef.exists()) {
          configData = adminConfigRef.data()
        } else if (settingsConfigRef.exists()) {
          configData = settingsConfigRef.data()
        }

        if (configData) {
          setPricingConfig({
            starter: configData.starter || 49,
            professional: configData.professional || 99,
            custom: configData.custom || 299,
            buttonsDisabled: configData.buttonsDisabled || false,
          })
        }
      } catch (error) {
        console.error("Error fetching pricing config:", error)
      }
    }

    fetchPricingConfig()
  }, [])

  useEffect(() => {
    // Fetch user location and exchange rate
    const fetchUserCurrency = async () => {
      try {
        const ipResponse = await fetch("https://ipapi.co/json/")
        const ipData = await ipResponse.json()
        const countryCode = ipData.country || "US"

        const symbol = CURRENCY_SYMBOLS[countryCode] || CURRENCY_SYMBOLS.DEFAULT
        setCurrencySymbol(symbol)

        if (countryCode !== "US") {
          const currencyCode = getCurrencyCode(countryCode)
          if (currencyCode) {
            setUserCurrency(currencyCode)
            const rateResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
            const rateData = await rateResponse.json()
            setExchangeRate(rateData.rates[currencyCode])
          }
        }
      } catch (error) {
        console.error("Error fetching currency data:", error)
        setUserCurrency("USD")
        setCurrencySymbol("$")
      } finally {
        setLoading(false)
      }
    }

    const getCurrencyCode = (countryCode: string): string | null => {
      const currencyMap: Record<string, string> = {
        IN: "INR",
        GB: "GBP",
        AU: "AUD",
        CA: "CAD",
        EU: "EUR",
      }
      return currencyMap[countryCode] || null
    }

    fetchUserCurrency()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            const now = new Date()
            const trialEnd = userData.trialEndDate?.toDate()
            const trialDaysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

            const subscriptionActive = userData.subscriptionActive || false
            const trialActive = subscriptionActive ? false : userData.trialActive || false

            setUserPlan({
              trialActive,
              subscriptionActive,
              subscriptionPlan: userData.subscriptionPlan || userData.plan,
              trialEndDate: trialEnd,
              trialDaysLeft: trialDaysLeft > 0 ? trialDaysLeft : 0,
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const getConvertedPrice = (usdPrice: number): string => {
    if (userCurrency === "USD" || !exchangeRate) {
      return `${currencySymbol}${usdPrice}`
    }
    const convertedPrice = usdPrice * exchangeRate
    if (userCurrency === "INR") {
      return `${currencySymbol}${Math.round(convertedPrice)}`
    }
    return `${currencySymbol}${convertedPrice.toFixed(2)}`
  }

  const getCurrentUserPlan = () => {
    if (!userPlan) return null
    if (userPlan.subscriptionActive && userPlan.subscriptionPlan) {
      return userPlan.subscriptionPlan.toLowerCase()
    }
    return null
  }

  const isCurrentPlan = (planName: string) => {
    const currentPlan = getCurrentUserPlan()
    return (
      currentPlan === planName.toLowerCase() ||
      (currentPlan === "plan_pro" && planName.toLowerCase() === "professional") ||
      (currentPlan === "plan_basic" && planName.toLowerCase() === "starter") ||
      (currentPlan === "custom" && planName.toLowerCase() === "custom")
    )
  }

  const handlePlanUpgrade = (planName: string) => {
    if (pricingConfig.buttonsDisabled) {
      return // Don't navigate if buttons are disabled
    }

    // Navigate to Razorpay payment instead of contact
    navigate("/payment", {
      state: {
        planName: planName,
        price:
          planName.toLowerCase() === "starter"
            ? pricingConfig.starter
            : planName.toLowerCase() === "professional"
              ? pricingConfig.professional
              : pricingConfig.custom,
        planId: planName.toLowerCase(),
        monthlyLimit: planName.toLowerCase() === "starter" ? 100 : planName.toLowerCase() === "professional" ? 500 : 0,
      },
    })
  }

  const plans = [
    {
      name: "Starter",
      price: getConvertedPrice(pricingConfig.starter),
      basePrice: pricingConfig.starter,
      description: "Perfect for small businesses just getting started with review management.",
      features: [
        "3 Business Locations",
        "100 Review Requests/Month",
        "Email Support",
        "Chat Support",
        "Mobile responsive dashboard",
        "Basic Analytics",
        "Review Response Templates",
      ],
      cta: "Starter Plan",
      popular: false,
      monthlyLimit: 100,
      icon: <StarIcon className="h-6 w-6 text-orange-600" />,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      name: "Professional",
      price: getConvertedPrice(pricingConfig.professional),
      basePrice: pricingConfig.professional,
      description: "Ideal for growing businesses that need advanced features and analytics.",
      features: [
        "5 Business Locations",
        "500 Review Requests/Month",
        "Priority Email Support",
        "Priority Whatsapp Support",
        "Advanced Analytics Dashboard",
        "Location-based Filtering",
        "Sentiment Analysis",
        "Mobile responsive dashboard",
        "Performance Trends",
        "Team Management",
        "Custom Branding",
      ],
      cta: "Professional Plan",
      popular: true,
      monthlyLimit: 500,
      icon: <Crown className="h-6 w-6 text-orange-600" />,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
    },
    {
      name: "Custom",
      price: getConvertedPrice(pricingConfig.custom),
      basePrice: pricingConfig.custom,
      description: "Enterprise solution with unlimited everything and premium support.",
      features: [
        "Unlimited Business Locations",
        "Unlimited Review Requests",
        "Advanced Analytics & Insights",
        "Priority Chat Support",
        "Customized Templates",
        "QR Generator",
        "Location-based Filtering",
        "Sentiment Analysis",
        "Predicted Analysis",
        "Mobile responsive dashboard",
      ],
      cta: "Get Custom Plan",
      popular: false,
      monthlyLimit: 0,
      icon: <Zap className="h-6 w-6 text-orange-600" />,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: theme.primaryColor }}
        ></div>
      </div>
    )
  }

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button - Only shown when accessed via /pricing route */}
        {location.pathname === "/pricing" && (
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="mb-6 flex items-center gap-2"
            style={{ color: theme.primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        )}

        <div className="lg:text-center">
          <p
            className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase"
            style={{
              backgroundColor: theme.primaryColor + "20",
              color: theme.primaryColor,
            }}
          >
            <StarIcon className="mr-1 h-4 w-4" />
            Pricing Plans
          </p>
          <h2
            className="mt-4 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl"
            style={{ color: theme.textColor }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-4 max-w-2xl text-xl lg:mx-auto" style={{ color: theme.textColor }}>
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>

          {/* Back to Home Button (visible when user is logged in but has no active subscription or trial) */}
          {/* {auth.currentUser && (!userPlan || (!userPlan.subscriptionActive && !userPlan.trialActive)) && (
            <div className="mt-8 text-center">
              <Button
                variant="outline" 
                onClick={() => navigate("/")}
                className="px-6 py-3 text-lg font-semibold"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Back to Home
              </Button>
            </div>
          )} */}
        </div>

        {/* Buttons Disabled Warning */}
        {pricingConfig.buttonsDisabled && (
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-4xl mx-auto rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">Maintenance Mode:</span> Pricing upgrades are temporarily unavailable.
                  Please check back later or contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status Banner */}
        {userPlan?.subscriptionActive && (
          <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-4 max-w-4xl mx-auto rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Active Subscription:</span> You're currently on the{" "}
                  <span className="font-semibold capitalize">
                    {userPlan.subscriptionPlan?.replace("plan_", "").replace("_", " ") || "Custom"}
                  </span>{" "}
                  plan. You can upgrade or manage your subscription anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trial Status Banner */}
        {!userPlan?.subscriptionActive && userPlan?.trialActive && userPlan.trialDaysLeft > 0 && (
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 max-w-4xl mx-auto rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Free Trial Active:</span> You have{" "}
                  <span className="font-semibold">{userPlan.trialDaysLeft} days</span> remaining in your trial. Upgrade
                  now to continue uninterrupted service after your trial ends.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const isCurrentUserPlan = isCurrentPlan(plan.name)

            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl relative ${plan.popular
                    ? "ring-2 transform scale-105 shadow-2xl"
                    : isCurrentUserPlan
                      ? "ring-2 ring-green-500 shadow-xl"
                      : "hover:scale-105"
                  }`}
                style={{
                  ringColor: plan.popular ? theme.primaryColor : undefined,
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div
                    className="absolute top-0 right-0 text-white text-xs font-bold px-4 py-2 rounded-bl-xl shadow-lg"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <div className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentUserPlan && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-4 py-2 rounded-br-xl shadow-lg">
                    <div className="flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      CURRENT PLAN
                    </div>
                  </div>
                )}

                <div className="px-8 py-10">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl bg-gradient-to-r ${plan.bgGradient}`}>
                      <div className={`text-transparent bg-clip-text bg-gradient-to-r ${plan.gradient}`}>
                        {plan.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold" style={{ color: theme.textColor }}>
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold" style={{ color: theme.textColor }}>
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-2 text-lg">/month</span>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-gray-600 leading-relaxed">{plan.description}</p>

                  {/* CTA Button */}
                  <Button
                    className={`mt-8 w-full py-6 text-lg font-semibold transition-all duration-300 ${isCurrentUserPlan
                        ? "bg-green-500 hover:bg-green-600 cursor-default"
                        : pricingConfig.buttonsDisabled
                          ? "bg-gray-400 cursor-not-allowed opacity-50"
                          : plan.popular
                            ? "shadow-lg hover:shadow-xl"
                            : "hover:shadow-lg transform hover:scale-105"
                      }`}
                    style={{
                      backgroundColor: isCurrentUserPlan
                        ? "#10b981"
                        : pricingConfig.buttonsDisabled
                          ? "#9ca3af"
                          : theme.primaryColor,
                    }}
                    onClick={() => {
                      if (isCurrentUserPlan || pricingConfig.buttonsDisabled) return
                      handlePlanUpgrade(plan.name)
                    }}
                    disabled={isCurrentUserPlan || pricingConfig.buttonsDisabled}
                  >
                    {isCurrentUserPlan
                      ? "Current Plan"
                      : pricingConfig.buttonsDisabled
                        ? "Temporarily Unavailable"
                        : userPlan?.subscriptionActive
                          ? "Upgrade"
                          : plan.cta}
                  </Button>
                </div>

                {/* Features List */}
                <div
                  className={`px-8 pt-8 pb-10 border-t border-gray-200 ${plan.popular ? "bg-gradient-to-b from-orange-50/50 to-orange-100/50" : "bg-gray-50"
                    }`}
                >
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-6">What's included</h4>
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckIcon
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-orange-500" : "text-green-500"
                            }`}
                          style={{
                            color: plan.popular ? theme.primaryColor : "#10b981",
                          }}
                        />
                        <span className="ml-3 text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PricingSection