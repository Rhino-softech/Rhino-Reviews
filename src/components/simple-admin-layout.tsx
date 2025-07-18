"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import type React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  Users,
  Menu,
  LogOut,
  BarChart2,
  Settings,
  DollarSign,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/firebase/firebase"
import { doc, getDoc } from "firebase/firestore"

interface SimpleAdminLayoutProps {
  children: React.ReactNode
}

export function SimpleAdminLayout({ children }: SimpleAdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const [open, setOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists() && userDoc.data()?.role === "ADMIN") {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
            navigate("/login")
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          navigate("/login")
        }
      } else {
        setIsAdmin(false)
        navigate("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    // Auto-open dropdown if a sublink is active
    const activeSubLinkItem = navItems.find(item => 
      item.subLinks?.some(subLink => pathname === subLink.href)
    );

    if (activeSubLinkItem) {
      setOpenDropdown(activeSubLinkItem.label)
    }
  }, [pathname])

  const handleLogout = useCallback(() => {
    signOut(auth)
      .then(() => {
        navigate("/login")
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }, [navigate])

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Building2, label: "Businesses", href: "/admin/businesses" },
    { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: DollarSign, label: "Pricing Management", href: "/admin/pricing" },
    { icon: MessageCircle, label: "Demo Booking Chat", href: "/admin/demo-chat" },
    { 
      icon: Settings, 
      label: "Settings", 
      href: "/admin/settings",
      subLinks: [
        { label: "General Settings", href: "/admin/settings/general" },
        { label: "Home Settings", href: "/admin/settings/home" },
      ]
    },
  ]

  const isActiveLink = useCallback((href: string) => pathname === href, [pathname])
  const isSubLinkActive = useCallback((subLinkHref: string) => pathname === subLinkHref, [pathname])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-4 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-4 border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = isActiveLink(item.href) || 
                        (item.subLinks?.some(subLink => isSubLinkActive(subLink.href)) ?? false)
        const hasSubLinks = !!item.subLinks

        return (
          <div key={item.href} className="space-y-1">
            {!hasSubLinks ? (
              <Link
                to={item.href}
                className={cn(
                  "relative flex items-center gap-5 px-5 py-4 rounded-xl text-lg transition-all duration-300 group",
                  isActive
                    ? "text-orange-600 font-semibold bg-orange-50/80"
                    : "text-gray-600 hover:text-gray-900",
                )}
                onClick={() => {
                  setOpen(false)
                  // Scroll to top on navigation
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r from-orange-100/50 to-transparent rounded-xl -z-10 transition-all duration-500",
                    isActive ? "opacity-100" : "opacity-0",
                    hoveredItem === item.href && !isActive ? "opacity-50" : "",
                  )}
                />
                <div
                  className={cn(
                    "relative transition-all duration-300",
                    isActive ? "scale-110" : "group-hover:scale-105",
                  )}
                >
                  <item.icon size={24} className="shrink-0" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full -translate-x-1/2"></span>
                  )}
                </div>
                <span
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "translate-x-1" : "group-hover:translate-x-1",
                  )}
                >
                  {item.label}
                </span>
                {hoveredItem === item.href && (
                  <span className="absolute inset-0 rounded-xl shadow-[inset_0_0_12px_rgba(249,115,22,0.3)] pointer-events-none"></span>
                )}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className={cn(
                    "relative w-full flex items-center justify-between gap-5 px-5 py-4 rounded-xl text-lg transition-all duration-300 group",
                    isActive
                      ? "text-orange-600 font-semibold bg-orange-50/80"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                  onClick={() => {
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  }}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={cn(
                        "relative transition-all duration-300",
                        isActive ? "scale-110" : "group-hover:scale-105",
                      )}
                    >
                      <item.icon size={24} className="shrink-0" />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full -translate-x-1/2"></span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "transition-all duration-300",
                        isActive ? "translate-x-1" : "group-hover:translate-x-1",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {hasSubLinks && (
                    openDropdown === item.label ? (
                      <ChevronUp className="h-5 w-5 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                    )
                  )}
                </button>

                {hasSubLinks && openDropdown === item.label && (
                  <div className="ml-14 space-y-1">
                    {item.subLinks.map((subLink) => {
                      const isSubActive = isSubLinkActive(subLink.href)
                      return (
                        <Link
                          key={subLink.href}
                          to={subLink.href}
                          className={cn(
                            "relative flex items-center gap-5 px-5 py-3 rounded-xl text-lg transition-all duration-300 group",
                            isSubActive
                              ? "text-orange-600 font-semibold bg-orange-50/80"
                              : "text-gray-600 hover:text-gray-900",
                          )}
                          onClick={() => {
                            setOpen(false)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          onMouseEnter={() => setHoveredItem(subLink.href)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div
                            className={cn(
                              "absolute inset-0 bg-gradient-to-r from-orange-100/50 to-transparent rounded-xl -z-10 transition-all duration-500",
                              isSubActive ? "opacity-100" : "opacity-0",
                              hoveredItem === subLink.href && !isSubActive ? "opacity-50" : "",
                            )}
                          />
                          <span
                            className={cn(
                              "transition-all duration-300",
                              isSubActive ? "translate-x-1" : "group-hover:translate-x-1",
                            )}
                          >
                            {subLink.label}
                          </span>
                          {hoveredItem === subLink.href && (
                            <span className="absolute inset-0 rounded-xl shadow-[inset_0_0_12px_rgba(249,115,22,0.3)] pointer-events-none"></span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </>
  )

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-sm" ref={sidebarRef}>
      <div className="flex items-center justify-between p-5 border-b border-gray-200/80">
        <div className="flex items-center space-x-4">
          {/* Placeholder for logo */}
        </div>
      </div>
      <div className="flex-grow p-5 overflow-y-auto custom-scrollbar">
        <nav className="space-y-3">
          <NavLinks />
        </nav>
      </div>
      <div className="p-5 border-t border-gray-200/80 mt-6">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-4 justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-amber-500 px-5 py-4 transition-all duration-300 rounded-xl group shadow-sm text-lg"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut className="h-6 w-6 transition-all duration-300 group-hover:rotate-12" />
          <span className="font-medium transition-all duration-300 group-hover:translate-x-1">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="w-full flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 text-gray-700 bg-white rounded-full shadow-lg border border-gray-200"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/80 h-screen fixed left-0 top-0 p-6 transition-all duration-300 shadow-lg">
        <div className="flex items-center justify-center mb-12 pt-4">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 blur opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
          </div>
        </div>
        <nav className="space-y-3 flex-grow overflow-y-auto custom-scrollbar">
          <NavLinks />
        </nav>
        <div className="mt-8 mb-6">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-4 justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-amber-500 px-5 py-4 transition-all duration-300 rounded-xl group shadow-sm text-lg"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <div className="relative">
              <LogOut className="h-6 w-6 transition-all duration-300 group-hover:rotate-12" />
              <span className="absolute -inset-1 rounded-full bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
            </div>
            <span className="font-medium transition-all duration-300 group-hover:translate-x-1">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-80 overflow-y-auto h-screen scroll-smooth">
        <div className="md:p-10 p-5 pt-20 md:pt-10 transition-all duration-300">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </div>

      {/* Add this to your global CSS or in a style tag */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #f97316 transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #f97316;
          border-radius: 20px;
        }
      `}</style>
    </div>
  )
}