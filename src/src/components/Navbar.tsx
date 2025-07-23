"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import logos from "./assets/Review Rhino.jpeg"
import {
  Star,
  Cog,
  DollarSign,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react"

interface ThemeSettings {
  primaryColor: string
  navbarColor: string
  textColor: string
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  navbarColor: "#ea580c",
  textColor: "#111827",
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [hasFilledForm, setHasFilledForm] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === "/"
  const auth = getAuth()

  const isSimplifiedNavPage = location.pathname.startsWith("/register") || location.pathname.startsWith("/businessform")

  // Navigation items with icons
  const navItems = [
    {
      id: "features",
      label: "Features",
      icon: Star,
      mobileLabel: "Features",
    },
    {
      id: "how-it-works",
      label: "How It Works",
      icon: Cog,
      mobileLabel: "How It Works",
    },
    {
      id: "pricing",
      label: "Pricing",
      icon: DollarSign,
      mobileLabel: "Pricing",
    },
    {
      id: "testimonials",
      label: "Testimonials",
      icon: MessageSquare,
      mobileLabel: "Reviews",
    },
    {
      id: "faq",
      label: "FAQ",
      icon: HelpCircle,
      mobileLabel: "FAQ",
    },
  ]

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true)
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            setIsAdmin(userData?.role === "ADMIN")
            setHasFilledForm(userData?.businessFormFilled || false)
          } else {
            console.log("User document not found")
            setIsAdmin(false)
            setHasFilledForm(false)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setIsAdmin(false)
          setHasFilledForm(false)
        }
      } else {
        setIsLoggedIn(false)
        setIsAdmin(false)
        setHasFilledForm(false)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [auth, location])

  const handleNavClick = (hash: string) => {
    if (isHomePage) {
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      navigate(`/#${hash}`)
    }
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsLoggedIn(false)
      setIsAdmin(false)
      setHasFilledForm(false)
      navigate("/")
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="animate-pulse bg-gray-200 h-6 w-32 sm:w-40 rounded" />
            <div className="flex space-x-2 sm:space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-16 sm:h-9 sm:w-24 rounded" />
              <div className="animate-pulse bg-gray-200 h-8 w-16 sm:h-9 sm:w-24 rounded" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  if (isSimplifiedNavPage) {
    return (
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
                <img src={logos || "/placeholder.svg"} alt="Rhino Review Logo" className="h-6 sm:h-8 object-contain" />
                <span className="font-extrabold text-base sm:text-xl" style={{ color: theme.navbarColor }}>
                  Rhino Review
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-colors text-xs sm:text-sm px-2 sm:px-4 bg-transparent"
                  style={{
                    borderColor: theme.navbarColor,
                    color: theme.navbarColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.navbarColor
                    e.currentTarget.style.color = "#ffffff"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = theme.navbarColor
                  }}
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="transition-colors text-xs sm:text-sm px-2 sm:px-4 bg-transparent"
                    style={{
                      borderColor: theme.navbarColor,
                      color: theme.navbarColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.navbarColor
                      e.currentTarget.style.color = "#ffffff"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.color = theme.navbarColor
                    }}
                  >
                    <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          {/* Logo - Fixed to always show "Rhino Review" with proper responsive sizing */}
          <div className="flex-shrink-0 flex items-center min-w-0">
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <img
                src={logos || "/placeholder.svg"}
                alt="Rhino Review Logo"
                className="h-5 sm:h-6 md:h-8 lg:h-10 object-contain flex-shrink-0"
              />
              <span
                className="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl whitespace-nowrap"
                style={{ color: theme.navbarColor }}
              >
                Rhino Review
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="px-2 xl:px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-50 rounded-md"
                style={{
                  color: theme.textColor,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme.navbarColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = theme.textColor)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Navigation Icons - Show only icons with hover labels */}
          <div className="flex lg:hidden items-center justify-center flex-1 max-w-xs mx-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 relative"
                      style={{ color: theme.textColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.navbarColor
                        setHoveredItem(item.id)
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme.textColor
                        setHoveredItem(null)
                      }}
                      onTouchStart={() => setHoveredItem(item.id)}
                      onTouchEnd={() => setTimeout(() => setHoveredItem(null), 1500)}
                    >
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    {/* Hover tooltip */}
                    {hoveredItem === item.id && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
                        {item.mobileLabel}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {isLoggedIn ? (
              <>
                {(hasFilledForm || isAdmin) && (
                  <Link to={isAdmin ? "/admin/dashboard" : "/components/business/dashboard"}>
                    <Button variant="ghost" className="transition-colors text-sm" style={{ color: theme.navbarColor }}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="transition-all duration-200 hover:text-white text-sm bg-transparent"
                  style={{
                    borderColor: theme.navbarColor,
                    color: theme.navbarColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.navbarColor
                    e.currentTarget.style.color = "#ffffff"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = theme.navbarColor
                  }}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="transition-all duration-200 hover:text-white text-sm bg-transparent"
                    style={{
                      borderColor: theme.navbarColor,
                      color: theme.navbarColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.navbarColor
                      e.currentTarget.style.color = "#ffffff"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.color = theme.navbarColor
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    className="transition-all duration-200 text-sm"
                    style={{ backgroundColor: theme.navbarColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile User Menu Button */}
          <div className="flex lg:hidden flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 hover:bg-gray-100 focus:outline-none"
              style={{ color: theme.navbarColor }}
              aria-expanded="false"
            >
              <span className="sr-only">Open user menu</span>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile User Menu Dropdown */}
      <div className={`${isMenuOpen ? "block" : "hidden"} lg:hidden bg-white border-t border-gray-200 shadow-lg`}>
        <div className="px-3 py-3 space-y-2">
          {isLoggedIn ? (
            <>
              {(hasFilledForm || isAdmin) && (
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/components/business/dashboard"}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start transition-colors text-sm bg-transparent"
                    style={{
                      borderColor: theme.navbarColor,
                      color: theme.navbarColor,
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="w-full justify-start transition-colors text-sm bg-transparent"
                style={{
                  borderColor: theme.navbarColor,
                  color: theme.navbarColor,
                }}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-start transition-colors text-sm bg-transparent"
                  style={{
                    borderColor: theme.navbarColor,
                    color: theme.navbarColor,
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full justify-start text-sm" style={{ backgroundColor: theme.navbarColor }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
