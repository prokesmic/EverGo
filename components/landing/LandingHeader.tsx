"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
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
      setIsScrolled(window.scrollY > 20)
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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-slate-200 py-4 shadow-sm"
            : "bg-white/60 backdrop-blur-xl border-slate-200/50 py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo with gradient */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400">
              ⚡EverGo
            </span>
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-indigo-600 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Beta Badge */}
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
              New • Global beta
            </span>

            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
            >
              Log in
            </Link>

            {/* Primary CTA with Aurora gradient */}
            <Button
              asChild
              size="sm"
              className="px-5 py-2.5 rounded-full text-white font-bold text-sm bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 shadow-md shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:scale-105"
            >
              <Link href="/register">Sign Up Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
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
          <nav className="px-4 py-4 space-y-2 bg-white/95 backdrop-blur-xl border-t border-slate-200">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg font-medium text-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Log in
              </Link>
              <Button
                asChild
                className="w-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-white font-bold shadow-md shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
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
