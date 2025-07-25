"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FcGoogle } from "react-icons/fc"
import { auth, db, signInWithGoogle } from "../firebase/firebase"
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RocketIcon } from "@radix-ui/react-icons"
import { Eye, EyeOff } from 'lucide-react'
import Navbar from "./Navbar"
import { LocationPermissionDialog } from "./LocationPermissionDialog"
import { 
  getDeviceInfo, 
  getLocationInfo, 
  generateSessionId, 
  checkLocationPermission,
  requestLocationPermission 
} from "../lib/deviceInfo"

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

interface LoginDetails {
  sessionId: string
  timestamp: Date
  device: {
    type: string
    os: string
    browser: string
    model: string
    userAgent: string
  }
  location: {
    ip: string
    city: string
    region: string
    country: string
    timezone: string
    accuracy: 'high' | 'medium' | 'low'
    source: string
  }
  loginMethod: "email" | "google"
  isActive: boolean
}

export default function LoginForm() {
  const [theme, setTheme] = useState<ThemeSettings>({
    primaryColor: "#ea580c",
    secondaryColor: "#fed7aa", 
    accentColor: "#fbbf24",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  })

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [trialExpired, setTrialExpired] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [accountInactive, setAccountInactive] = useState(false)
  const [externalError, setExternalError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [subscriptionExpired, setSubscriptionExpired] = useState(false)
  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false)
  const navigate = useNavigate()

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

    fetchThemeSettings()
    localStorage.removeItem("uid")
    localStorage.removeItem("role")
    localStorage.removeItem("email")
    signOut(auth).catch(console.error)
  }, [])

  // Check location permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      const permissionStatus = await checkLocationPermission()
      if (!permissionStatus.granted && permissionStatus.canRequest) {
        setShowLocationDialog(true)
      }
      setLocationPermissionChecked(true)
    }

    checkPermission()
  }, [])

  const checkAccountStatus = async (uid: string) => {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return false
    return userSnap.data().status === "Active"
  }

  const checkTrialStatus = async (uid: string) => {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const now = new Date()
      const trialEnd = new Date(now)
      trialEnd.setDate(trialEnd.getDate() + 14)

      await setDoc(userRef, {
        trialActive: true,
        trialEndDate: trialEnd,
        status: "Active",
        createdAt: now,
        updatedAt: now,
        email: auth.currentUser?.email || "",
        role: "BUSER",
      })

      return true
    }

    const userData = userSnap.data()
    const now = new Date()

    if (userData.role === "ADMIN") return true
    if (userData.subscriptionActive) return true

    if (userData.trialActive && userData.trialEndDate && userData.trialEndDate.toDate() > now) {
      return true
    }

    if (!userData.trialEndDate && !userData.subscriptionPlan && userData.role === "BUSER") {
      const trialEnd = new Date(now)
      trialEnd.setDate(trialEnd.getDate() + 14)

      await updateDoc(userRef, {
        trialActive: true,
        trialEndDate: trialEnd,
        subscriptionActive: false,
        updatedAt: now,
      })

      return true
    }

    if (userData.subscriptionPlan && !userData.subscriptionActive) {
      setSubscriptionExpired(true)
      return false
    }

    return false
  }

  const createLoginDetails = async (method: "email" | "google"): Promise<LoginDetails> => {
    const deviceInfo = getDeviceInfo()
    const locationInfo = await getLocationInfo()
    const sessionId = generateSessionId()

    console.log("Creating login details with enhanced device detection:", deviceInfo)
    console.log("Location info with accuracy:", locationInfo)

    return {
      sessionId,
      timestamp: new Date(),
      device: {
        type: deviceInfo.deviceType,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        model: deviceInfo.deviceModel,
        userAgent: deviceInfo.userAgent,
      },
      location: locationInfo,
      loginMethod: method,
      isActive: true,
    }
  }

  const updateLoginHistory = async (uid: string, newLoginDetails: LoginDetails) => {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const existingHistory = userSnap.data()?.loginHistory || []

      // Mark all previous sessions as inactive
      const updatedHistory = existingHistory.map((login: LoginDetails) => ({
        ...login,
        isActive: false,
      }))

      // Add new login session
      const newHistory = [...updatedHistory, newLoginDetails]

      // Keep last 50 login sessions for better tracking
      const trimmedHistory = newHistory.slice(-50)

      await updateDoc(userRef, {
        lastLogin: newLoginDetails,
        loginHistory: trimmedHistory,
        updatedAt: new Date(),
      })

      console.log("Updated login history with enhanced tracking:", newLoginDetails.sessionId)
      console.log("Device detected:", newLoginDetails.device)
      console.log("Location detected:", newLoginDetails.location)
    }
  }

  const redirectUser = async (uid: string) => {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) throw new Error("User data not found.")
    const userData = userSnap.data()

    if (userData.role === "ADMIN") {
      navigate("/admin/dashboard")
      return
    }

    const hasActiveAccess = await checkTrialStatus(uid)
    if (!hasActiveAccess) {
      if (subscriptionExpired) {
        setTrialExpired(true)
        navigate("/pricing")
        return
      }
      setTrialExpired(true)
      navigate("/pricing")
      return
    }

    if (userData.businessFormFilled === true) {
      navigate("/components/business/dashboard")
    } else {
      navigate("/businessform")
    }
  }

  const handleLocationPermissionResult = (granted: boolean) => {
    if (granted) {
      console.log("Location permission granted")
    } else {
      console.log("Location permission denied, will use IP-based location")
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setExternalError("")
    setTrialExpired(false)
    setAccountInactive(false)
    setSubscriptionExpired(false)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      const isActive = await checkAccountStatus(uid)
      if (!isActive) {
        await signOut(auth)
        setAccountInactive(true)
        return
      }

      const loginDetails = await createLoginDetails("email")
      console.log("Email login details created with enhanced tracking:", loginDetails)

      const userRef = doc(db, "users", uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        const now = new Date()
        const trialEnd = new Date(now)
        trialEnd.setDate(trialEnd.getDate() + 14)

        await setDoc(userRef, {
          displayName: userCredential.user.displayName || "",
          email: userCredential.user.email || "",
          role: "BUSER",
          status: "Active",
          trialActive: true,
          trialEndDate: trialEnd,
          createdAt: now,
          updatedAt: now,
          lastLogin: loginDetails,
          loginHistory: [loginDetails],
        })
      } else {
        await updateLoginHistory(uid, loginDetails)
      }

      const userData = userSnap.exists()
        ? userSnap.data()
        : {
            role: "BUSER",
            email: userCredential.user.email || "",
          }

      localStorage.setItem("role", userData.role)
      localStorage.setItem("email", userData.email)
      localStorage.setItem("uid", uid)
      localStorage.setItem("sessionId", loginDetails.sessionId)

      await redirectUser(uid)
    } catch (err: any) {
      let message = "Login failed. Please try again."
      if (err.code === "auth/user-not-found") message = "User not found. Please register first."
      else if (err.code === "auth/wrong-password") message = "Incorrect password. Please try again."
      else if (err.code === "auth/invalid-email") message = "Invalid email format."
      else if (err.code === "auth/too-many-requests") message = "Too many attempts. Try again later."
      else if (err.code === "auth/invalid-credential")
        message = "Invalid email or password. Please check your credentials."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")
    setExternalError("")
    setTrialExpired(false)
    setAccountInactive(false)
    setSubscriptionExpired(false)

    try {
      await signInWithGoogle()
      const currentUser = auth.currentUser
      const uid = currentUser?.uid
      if (!uid) throw new Error("User not authenticated")

      const isActive = await checkAccountStatus(uid)
      if (!isActive) {
        await signOut(auth)
        setAccountInactive(true)
        return
      }

      const loginDetails = await createLoginDetails("google")
      console.log("Google login details created with enhanced tracking:", loginDetails)

      const userRef = doc(db, "users", uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        const now = new Date()
        const trialEnd = new Date(now)
        trialEnd.setDate(trialEnd.getDate() + 14)

        await setDoc(userRef, {
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
          role: "BUSER",
          status: "Active",
          trialActive: true,
          trialEndDate: trialEnd,
          createdAt: now,
          updatedAt: now,
          lastLogin: loginDetails,
          loginHistory: [loginDetails],
        })
      } else {
        await updateLoginHistory(uid, loginDetails)
      }

      const userData = userSnap.exists()
        ? userSnap.data()
        : {
            role: "BUSER",
            email: currentUser.email || "",
          }

      localStorage.setItem("role", userData.role)
      localStorage.setItem("email", userData.email || "")
      localStorage.setItem("uid", uid)
      localStorage.setItem("sessionId", loginDetails.sessionId)

      await redirectUser(uid)
    } catch (err: any) {
      setExternalError(err.message || "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")
    setExternalError("")

    try {
      await sendPasswordResetEmail(auth, email)
      setResetEmailSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  const AnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white"></div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 6 + 4}px`,
            height: `${Math.random() * 6 + 4}px`,
            backgroundColor: i % 3 === 0 ? theme.primaryColor : i % 3 === 1 ? theme.accentColor : theme.secondaryColor,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Large Floating Circles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`circle-${i}`}
          className="absolute rounded-full opacity-5"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${Math.random() * 120 - 10}%`,
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 200 + 100}px`,
            backgroundColor: i % 2 === 0 ? theme.primaryColor : theme.accentColor,
            animation: `slowFloat ${Math.random() * 8 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill={theme.primaryColor}
            style={{ animation: "wave 10s ease-in-out infinite" }}
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill={theme.accentColor}
            style={{ animation: "wave 7s ease-in-out infinite reverse" }}
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill={theme.secondaryColor}
            opacity=".8"
            style={{ animation: "wave 5s ease-in-out infinite" }}
          />
        </svg>
      </div>

      {/* Geometric Shapes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className="absolute opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 40 + 20}px`,
            height: `${Math.random() * 40 + 20}px`,
            backgroundColor: theme.primaryColor,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: i % 2 === 0 ? "50%" : "0%",
            animation: `rotate ${Math.random() * 10 + 15}s linear infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes slowFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) translateX(-20px) scale(1.1);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(-25%);
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
      `}</style>
    </div>
  )

  if (accountInactive) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <AnimatedBackground />
          <Card className="w-full max-w-md shadow-2xl rounded-2xl p-6 bg-white/95 backdrop-blur-sm border-0 relative z-10">
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <RocketIcon className="h-4 w-4" />
                <AlertTitle>Account Inactive</AlertTitle>
                <AlertDescription>
                  Your account is not active. Please contact support to reactivate your account.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setAccountInactive(false)
                  setShowEmailForm(false)
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (trialExpired || subscriptionExpired) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <AnimatedBackground />
          <Card className="w-full max-w-md shadow-2xl rounded-2xl p-6 bg-white/95 backdrop-blur-sm border-0 relative z-10">
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <RocketIcon className="h-4 w-4" />
                <AlertTitle>{subscriptionExpired ? "Subscription Expired" : "Trial Expired"}</AlertTitle>
                <AlertDescription>
                  {subscriptionExpired
                    ? "Your subscription has ended. Please renew to continue using our services."
                    : "Your 14-day free trial has ended. Upgrade to a paid plan to continue using our services."}
                </AlertDescription>
              </Alert>
              <Button
                className="w-full text-white font-semibold"
                style={{ backgroundColor: theme.primaryColor }}
                onClick={() => navigate("/pricing")}
              >
                Choose a Plan
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setTrialExpired(false)
                  setSubscriptionExpired(false)
                  setShowEmailForm(false)
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (resetEmailSent) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <AnimatedBackground />
          <Card className="w-full max-w-md shadow-2xl rounded-2xl p-6 bg-white/95 backdrop-blur-sm border-0 relative z-10">
            <CardContent className="space-y-4">
              <Alert>
                <RocketIcon className="h-4 w-4" />
                <AlertTitle>Password Reset Email Sent</AlertTitle>
                <AlertDescription>
                  We've sent a password reset link to {email}. Please check your inbox.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full text-white font-semibold"
                style={{ backgroundColor: theme.primaryColor }}
                onClick={() => {
                  setResetEmailSent(false)
                  setShowForgotPassword(false)
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (showForgotPassword) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <AnimatedBackground />
          <Card className="w-full max-w-md shadow-2xl rounded-2xl p-6 bg-white/95 backdrop-blur-sm border-0 relative z-10">
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.textColor }}>
                Reset Password
              </h2>

              <div>
                <label className="text-sm block mb-1" style={{ color: theme.textColor }}>
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="rounded-xl"
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <Button
                className="w-full text-white font-semibold rounded-xl"
                style={{ backgroundColor: theme.primaryColor }}
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Button
                variant="outline"
                className="w-full bg-transparent rounded-xl"
                onClick={() => {
                  setShowForgotPassword(false)
                  setError("")
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <Card className="w-full max-w-md shadow-2xl rounded-2xl p-6 bg-white/95 backdrop-blur-sm border-0 relative z-10">
          <CardContent>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.textColor }}>
              Sign In to Your Account
            </h2>

            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl font-semibold bg-transparent hover:bg-gray-50"
              style={{
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              }}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle size={20} /> Continue with Google
            </Button>

            {externalError && (
              <div className="mb-4">
                <Alert variant="destructive" className="w-full">
                  <RocketIcon className="h-4 w-4" />
                  <AlertDescription>{externalError}</AlertDescription>
                </Alert>
              </div>
            )}

            {!showEmailForm && (
              <Button
                variant="outline"
                className="w-full mb-4 rounded-xl font-semibold bg-transparent hover:bg-gray-50"
                style={{
                  borderColor: theme.borderColor || "#d1d5db",
                  color: theme.textColor,
                }}
                onClick={() => setShowEmailForm(true)}
              >
                Continue with Email
              </Button>
            )}

            {showEmailForm && (
              <>
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="mx-4 text-sm opacity-60">or</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                <form className="space-y-4" onSubmit={handleEmailLogin}>
                  <div>
                    <label className="text-sm block mb-1" style={{ color: theme.textColor }}>
                      Email
                    </label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm block mb-1" style={{ color: theme.textColor }}>
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-60 hover:opacity-80"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm hover:underline font-medium"
                      style={{ color: theme.primaryColor }}
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full text-white font-semibold rounded-xl"
                    style={{ backgroundColor: theme.primaryColor }}
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </>
            )}

            <div className="mt-6 text-sm text-center opacity-80">
              <p>
                Don't have an account?{" "}
                <a href="/register" className="font-medium hover:underline" style={{ color: theme.primaryColor }}>
                  Register now
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location Permission Dialog */}
        <LocationPermissionDialog
          open={showLocationDialog}
          onOpenChange={setShowLocationDialog}
          onPermissionResult={handleLocationPermissionResult}
        />
      </div>
    </>
  )
}
