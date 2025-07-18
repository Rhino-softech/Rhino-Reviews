"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import logos from "./assets/Review Rhino.jpeg"

interface ThemeSettings {
  primaryColor: string
  navbarColor: string
  textColor: string
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#ea580c",
  navbarColor: "#ea580c", 
  textColor: "#111827"
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [hasFilledForm, setHasFilledForm] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === "/"
  const auth = getAuth()
  
  const isSimplifiedNavPage = 
    location.pathname.startsWith("/register") || 
    location.pathname.startsWith("/businessform")

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="animate-pulse bg-gray-200 h-6 w-40 rounded" />
            <div className="flex space-x-4">
              <div className="animate-pulse bg-gray-200 h-9 w-24 rounded" />
              <div className="animate-pulse bg-gray-200 h-9 w-24 rounded" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  if (isSimplifiedNavPage) {
    return (
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src={logos || "/placeholder.svg"} 
                  alt="Rhino Review Logo" 
                  className="h-8 object-contain"
                />
                <span className="font-extrabold text-xl" style={{ color: theme.navbarColor }}>
                  Rhino Review
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <Button 
                  variant="outline" 
                  className="transition-colors"
                  style={{ 
                    borderColor: theme.navbarColor, 
                    color: theme.navbarColor,
                    ':hover': { 
                      color: '#ffffff',
                      backgroundColor: theme.navbarColor 
                    }
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="transition-colors"
                    style={{ 
                      borderColor: theme.navbarColor, 
                      color: theme.navbarColor 
                    }}
                  >
                    Login
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logos || "/placeholder.svg"} 
                alt="Rhino Review Logo" 
                className="h-10 object-contain"
              />
              <span className="font-extrabold text-xl" style={{ color: theme.navbarColor }}>
                Rhino Review
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => handleNavClick("features")} 
              className="px-3 py-2 text-sm font-medium transition-colors duration-200"
              style={{ 
                color: theme.textColor,
                ':hover': { color: theme.navbarColor }
              }}
              onMouseEnter={(e) => e.target.style.color = theme.navbarColor}
              onMouseLeave={(e) => e.target.style.color = theme.textColor}
            >
              Features
            </button>
            <button 
              onClick={() => handleNavClick("how-it-works")} 
              className="px-3 py-2 text-sm font-medium transition-colors duration-200"
              style={{ 
                color: theme.textColor,
                ':hover': { color: theme.navbarColor }
              }}
              onMouseEnter={(e) => e.target.style.color = theme.navbarColor}
              onMouseLeave={(e) => e.target.style.color = theme.textColor}
            >
              How It Works
            </button>
            <button 
              onClick={() => handleNavClick("pricing")} 
              className="px-3 py-2 text-sm font-medium transition-colors duration-200"
              style={{ 
                color: theme.textColor,
                ':hover': { color: theme.navbarColor }
              }}
              onMouseEnter={(e) => e.target.style.color = theme.navbarColor}
              onMouseLeave={(e) => e.target.style.color = theme.textColor}
            >
              Pricing
            </button>
            <button 
              onClick={() => handleNavClick("testimonials")} 
              className="px-3 py-2 text-sm font-medium transition-colors duration-200"
              style={{ 
                color: theme.textColor,
                ':hover': { color: theme.navbarColor }
              }}
              onMouseEnter={(e) => e.target.style.color = theme.navbarColor}
              onMouseLeave={(e) => e.target.style.color = theme.textColor}
            >
              Testimonials
            </button>
            <button 
              onClick={() => handleNavClick("faq")} 
              className="px-3 py-2 text-sm font-medium transition-colors duration-200"
              style={{ 
                color: theme.textColor,
                ':hover': { color: theme.navbarColor }
              }}
              onMouseEnter={(e) => e.target.style.color = theme.navbarColor}
              onMouseLeave={(e) => e.target.style.color = theme.textColor}
            >
              FAQ
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {(hasFilledForm || isAdmin) && (
                  <Link to={isAdmin ? "/admin/dashboard" : "/components/business/dashboard"}>
                    <Button 
                      variant="ghost" 
                      className="transition-colors"
                      style={{ color: theme.navbarColor }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  className="transition-all duration-200 hover:text-white"
                  style={{ 
                    borderColor: theme.navbarColor, 
                    color: theme.navbarColor 
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.navbarColor
                    e.target.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = theme.navbarColor
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="transition-all duration-200 hover:text-white"
                    style={{ 
                      borderColor: theme.navbarColor, 
                      color: theme.navbarColor 
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.navbarColor
                      e.target.style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = theme.navbarColor
                    }}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className="transition-all duration-200"
                    style={{ backgroundColor: theme.navbarColor }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button 
            onClick={() => handleNavClick("features")} 
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
            style={{ 
              color: theme.textColor,
              ':hover': { 
                color: theme.navbarColor,
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Features
          </button>
          <button 
            onClick={() => handleNavClick("how-it-works")} 
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
            style={{ 
              color: theme.textColor,
              ':hover': { 
                color: theme.navbarColor,
                backgroundColor: '#f9fafb'
              }
            }}
          >
            How It Works
          </button>
          <button 
            onClick={() => handleNavClick("pricing")} 
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
            style={{ 
              color: theme.textColor,
              ':hover': { 
                color: theme.navbarColor,
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Pricing
          </button>
          <button 
            onClick={() => handleNavClick("testimonials")} 
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
            style={{ 
              color: theme.textColor,
              ':hover': { 
                color: theme.navbarColor,
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Testimonials
          </button>
          <button 
            onClick={() => handleNavClick("faq")} 
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
            style={{ 
              color: theme.textColor,
              ':hover': { 
                color: theme.navbarColor,
                backgroundColor: '#f9fafb'
              }
            }}
          >
            FAQ
          </button>
          <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                {(hasFilledForm || isAdmin) && (
                  <Link to={isAdmin ? "/admin/dashboard" : "/components/business/dashboard"}>
                    <Button 
                      variant="outline" 
                      className="w-full transition-colors"
                      style={{ 
                        borderColor: theme.navbarColor, 
                        color: theme.navbarColor 
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  className="w-full transition-colors"
                  style={{ 
                    borderColor: theme.navbarColor, 
                    color: theme.navbarColor 
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="w-full transition-colors"
                    style={{ 
                      borderColor: theme.navbarColor, 
                      color: theme.navbarColor 
                    }}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: theme.navbarColor }}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;