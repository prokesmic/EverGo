"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone, Zap, Share, PlusSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Detect iOS Safari
const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

const isInStandaloneMode = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia("(display-mode: standalone)").matches ||
         (window.navigator as any).standalone === true
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (isInStandaloneMode()) {
      return
    }

    // Check if user has dismissed the prompt before
    const hasDeclined = localStorage.getItem("pwa-install-declined")
    const declinedTime = localStorage.getItem("pwa-install-declined-time")

    // Allow showing again after 7 days
    if (hasDeclined && declinedTime) {
      const daysSinceDeclined = (Date.now() - parseInt(declinedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDeclined < 7) {
        return
      }
    }

    // iOS Safari handling
    if (isIOS()) {
      setTimeout(() => {
        setShowIOSPrompt(true)
      }, 5000)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Show our custom install prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
      localStorage.setItem("pwa-install-declined", "true")
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIOSPrompt(false)
    localStorage.setItem("pwa-install-declined", "true")
    localStorage.setItem("pwa-install-declined-time", Date.now().toString())
  }

  // iOS-specific install instructions
  if (showIOSPrompt) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp pb-safe">
        <div className="mx-4 mb-4 bg-white rounded-2xl shadow-2xl border border-border-light overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-brand-blue to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Install EverGo</h3>
                  <p className="text-white/80 text-sm">Add to your home screen</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-text-secondary text-center">
              Get the full app experience with offline access and push notifications
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-surface-secondary rounded-xl">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="font-bold text-brand-blue">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">
                    Tap the <Share className="w-4 h-4 inline text-brand-blue" /> Share button in Safari
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-surface-secondary rounded-xl">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="font-bold text-brand-blue">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">
                    Scroll and tap <PlusSquare className="w-4 h-4 inline text-brand-blue" /> Add to Home Screen
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp pb-safe lg:inset-x-auto lg:right-8 lg:bottom-8 lg:w-96">
      <div className="mx-4 mb-4 lg:mx-0 bg-white rounded-2xl shadow-2xl border border-border-light overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Install EverGo</h3>
                <p className="text-white/80 text-sm">Get the full experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2">
              <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-1">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-text-muted">Offline Access</p>
            </div>
            <div className="text-center p-2">
              <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-1">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-text-muted">Faster Loading</p>
            </div>
            <div className="text-center p-2">
              <div className="w-10 h-10 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-1">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-text-muted">Quick Access</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-brand-blue hover:bg-brand-blue-dark"
            >
              <Download className="w-4 h-4 mr-2" />
              Install Now
            </Button>
            <Button onClick={handleDismiss} variant="ghost">
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
