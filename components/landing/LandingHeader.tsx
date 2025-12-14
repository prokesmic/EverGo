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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled
            ? "bg-[#020617]/80 backdrop-blur-md border-white/10 py-4"
            : "bg-transparent border-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo with gradient */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              ⚡EverGo
            </span>
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-cyan-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors"
            >
              Log in
            </Link>

            {/* Primary CTA with gradient and glow */}
            <Button
              asChild
              size="sm"
              className="px-5 py-2.5 rounded-full text-white font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
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
                className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
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
