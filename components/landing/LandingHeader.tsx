"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Search, Command } from "lucide-react"
import { cn } from "@/lib/utils"

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
            ? "bg-[#020617]/80 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/10"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo with gradient */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <span className="text-2xl">⚡</span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              EverGo
            </span>
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Pill with kbd */}
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded bg-white/10 text-slate-400">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>

            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </Link>

            {/* Primary CTA with gradient and glow */}
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40"
            >
              <Link href="/register">Sign Up Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
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
          <nav className="px-4 py-4 space-y-2 bg-[#020617]/95 backdrop-blur-lg border-t border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg font-medium text-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Log in
              </Link>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold hover:opacity-90 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
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
