"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { auth, db } from "../firebase/firebase"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RocketIcon } from "@radix-ui/react-icons"
import { Eye, EyeOff } from "lucide-react"
import Navbar from "./Navbar"

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
}

export default function RegistrationForm() {
  const [theme, setTheme] = useState<ThemeSettings>({
    primaryColor: "#ea580c",
    secondaryColor: "#fed7aa",
    accentColor: "#fbbf24",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    borderColor: "#d1d5db",
  })

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationLinkSent, setVerificationLinkSent] = useState(false)
  const [verificationChecked, setVerificationChecked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
  }, [])

  const checkEmailExists = async (email: string) => {
    const q = query(collection(db, "users"), where("email", "==", email))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  const checkUsernameExists = async (username: string) => {
    const q = query(collection(db, "users"), where("username", "==", username))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const usernameTaken = await checkUsernameExists(username)
      if (usernameTaken) throw new Error("Username already exists")

      const emailTaken = await checkEmailExists(email)
      if (emailTaken) throw new Error("Email already registered")

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const uid = user.uid

      await sendEmailVerification(user)
      setVerificationLinkSent(true)

      const checkVerification = setInterval(async () => {
        await user.reload()
        if (user.emailVerified) {
          clearInterval(checkVerification)
          setVerificationChecked(true)

          const now = new Date()
          const trialEndDate = new Date(now)
          trialEndDate.setDate(trialEndDate.getDate() + 14)

          await setDoc(doc(db, "users", uid), {
            uid,
            username,
            email,
            storedmail: email,
            registrationEmail: email,
            status: "Active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isProfileComplete: false,
            trialActive: true,
            trialEndDate: trialEndDate,
            subscriptionActive: false,
            businessFormFilled: false,
            hasActiveSubscription: false,
            emailVerified: true,
            role: "BUSER",
          })

          navigate("/businessform", { state: { uid, registrationEmail: email } })
        }
      }, 2000)

      setTimeout(() => {
        clearInterval(checkVerification)
        if (!user.emailVerified) {
          setError("Email verification timed out. Please try again.")
          setVerificationLinkSent(false)
        }
      }, 300000)
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError("")
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const emailExists = await checkEmailExists(user.email || "")
      if (emailExists) throw new Error("Email already registered")

      const now = new Date()
      const trialEndDate = new Date(now)
      trialEndDate.setDate(trialEndDate.getDate() + 14)

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        storedmail: user.email,
        registrationEmail: user.email,
        displayName: user.displayName || "",
        role: "BUSER",
        status: "Active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isProfileComplete: false,
        trialActive: true,
        trialEndDate: trialEndDate,
        subscriptionActive: false,
        businessFormFilled: false,
        hasActiveSubscription: false,
        emailVerified: true,
      })

      navigate("/businessform", { state: { uid: user.uid, registrationEmail: user.email } })
    } catch (err: any) {
      setError(err.message || "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  const AnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white"></div>

      {/* Floating Particles */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 3}px`,
            height: `${Math.random() * 8 + 3}px`,
            backgroundColor: i % 3 === 0 ? theme.primaryColor : i % 3 === 1 ? theme.accentColor : theme.secondaryColor,
            animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Large Floating Circles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`circle-${i}`}
          className="absolute rounded-full opacity-5"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${Math.random() * 120 - 10}%`,
            width: `${Math.random() * 250 + 80}px`,
            height: `${Math.random() * 250 + 80}px`,
            backgroundColor: i % 2 === 0 ? theme.primaryColor : theme.accentColor,
            animation: `slowFloat ${Math.random() * 10 + 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-24"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill={theme.primaryColor}
            style={{ animation: "wave 12s ease-in-out infinite" }}
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill={theme.accentColor}
            style={{ animation: "wave 8s ease-in-out infinite reverse" }}
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill={theme.secondaryColor}
            opacity=".8"
            style={{ animation: "wave 6s ease-in-out infinite" }}
          />
        </svg>
      </div>

      {/* Geometric Shapes */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className="absolute opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 50 + 15}px`,
            height: `${Math.random() * 50 + 15}px`,
            backgroundColor: theme.primaryColor,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "0%" : "25%",
            animation: `rotate ${Math.random() * 12 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Pulsing Dots */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`dot-${i}`}
          className="absolute rounded-full opacity-15"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 12 + 6}px`,
            height: `${Math.random() * 12 + 6}px`,
            backgroundColor: i % 2 === 0 ? theme.accentColor : theme.primaryColor,
            animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-25px) translateX(15px);
          }
        }

        @keyframes slowFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-40px) translateX(-25px) scale(1.1);
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
            transform: rotate(180deg) scale(1.3);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <Card className="w-full max-w-md shadow-2xl rounded-2xl p-8 bg-white/95 backdrop-blur-sm border-0 relative z-10">
          <CardContent>
            <h2 className="text-2xl font-semibold text-center mb-6" style={{ color: theme.primaryColor }}>
              Create your account
            </h2>

            <Alert
              className="mb-4 items-center"
              style={{ backgroundColor: theme.secondaryColor + "40", borderColor: theme.primaryColor }}
            >
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>14-Day Free Trial</AlertTitle>
              <AlertDescription>Every new account gets 14 days of free access to all features.</AlertDescription>
            </Alert>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl font-semibold bg-transparent hover:bg-gray-50"
              style={{
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              }}
              onClick={handleGoogleRegister}
            >
              <FcGoogle size={20} /> Continue with Google
            </Button>

            {!showEmailForm && (
              <Button
                variant="outline"
                className="w-full rounded-xl font-semibold bg-transparent hover:bg-gray-50"
                style={{
                  borderColor: theme.borderColor,
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
                  <hr className="flex-grow border-gray-300" />
                  <span className="mx-3 text-sm opacity-60">or</span>
                  <hr className="flex-grow border-gray-300" />
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                  <div>
                    <label className="text-sm block mb-1" style={{ color: theme.textColor }}>
                      Username
                    </label>
                    <Input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

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
                    {verificationLinkSent && (
                      <div className="mt-2 text-sm opacity-80">
                        <p>We've sent a verification link to your email.</p>
                        <p>Please click the link to verify your email address.</p>
                        {verificationChecked && (
                          <p style={{ color: theme.primaryColor }}>Email verified! Proceeding...</p>
                        )}
                      </div>
                    )}
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

                  <Button
                    type="submit"
                    className="w-full text-white font-semibold rounded-xl"
                    style={{ backgroundColor: theme.primaryColor }}
                    disabled={loading || verificationLinkSent}
                  >
                    {loading ? "Processing..." : "Start Free Trial"}
                  </Button>
                </form>
              </>
            )}

            <p className="text-xs text-center mt-4 opacity-70">
              By signing up, you agree to our{" "}
              <a href="#" className="hover:underline" style={{ color: theme.primaryColor }}>
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="hover:underline" style={{ color: theme.primaryColor }}>
                Privacy Policy
              </a>
              .
            </p>

            <p className="text-sm text-center mt-4 opacity-80">
              Already have an account?{" "}
              <a href="/login" className="hover:underline font-medium" style={{ color: theme.primaryColor }}>
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
