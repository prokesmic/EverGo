"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Search, Command } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#comparison", label: "Compare" },
  { href: "#testimonials", label: "Reviews" },
]

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 font-bold text-xl tracking-tight transition-colors",
              isScrolled ? "text-gray-900" : "text-white"
            )}
          >
            <span className="text-2xl">⚡</span>
            EverGo
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  isScrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Pill */}
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                isScrolled
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd className={cn(
                "hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded",
                isScrolled ? "bg-gray-200 text-gray-500" : "bg-white/20 text-white/70"
              )}>
                <Command className="w-3 h-3" />K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle
              className={cn(
                isScrolled
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            />

            <Link
              href="/login"
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                isScrolled
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-white hover:text-white/80"
              )}
            >
              Log in
            </Link>

            <Button
              asChild
              size="sm"
              className={cn(
                "font-semibold transition-all",
                isScrolled
                  ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                  : "bg-white text-brand-blue hover:bg-white/90"
              )}
            >
              <Link href="/register">Sign Up Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              isScrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen
              ? "max-h-[400px] opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <nav className={cn(
            "px-4 py-4 space-y-2",
            isScrolled ? "bg-white" : "bg-gray-900/95 backdrop-blur-lg"
          )}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg font-medium transition-colors",
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white/90 hover:bg-white/10"
                )}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200/20 space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-lg font-medium text-center transition-colors",
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white/90 hover:bg-white/10"
                )}
              >
                Log in
              </Link>
              <Button
                asChild
                className={cn(
                  "w-full font-semibold",
                  isScrolled
                    ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                    : "bg-white text-brand-blue hover:bg-white/90"
                )}
              >
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

    </>
  )
}
