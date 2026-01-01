"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Loader2, Navigation, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Common countries list (you can expand this)
const COUNTRIES = [
  "Czech Republic",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Austria",
  "Switzerland",
  "Poland",
  "Slovakia",
  "Hungary",
  "Australia",
  "Canada",
  "Japan",
  "Brazil",
  "Mexico",
  "India",
  "Other",
]

interface LocationUnlockModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LocationUnlockModal({
  isOpen,
  onClose,
  onSuccess,
}: LocationUnlockModalProps) {
  const router = useRouter()
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setGeoLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding API (you may need to implement this endpoint)
          const res = await fetch(
            `/api/geo/reverse?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
          )
          if (res.ok) {
            const data = await res.json()
            if (data.country) setCountry(data.country)
            if (data.city) setCity(data.city)
          }
        } catch {
          // Silently fail - user can still enter manually
        } finally {
          setGeoLoading(false)
        }
      },
      () => {
        setError("Unable to get your location. Please enter manually.")
        setGeoLoading(false)
      }
    )
  }

  const handleSubmit = async () => {
    if (!country) {
      setError("Please select a country")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          city: city || null,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      onSuccess?.()
      onClose()
      router.refresh()
    } catch {
      setError("Failed to save location. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <Trophy className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Unlock Local Rankings
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                <p className="text-sm text-slate-600">
                  Set your country and city to find rivals near you and unlock
                  City Rankings.
                </p>

                {/* Geolocation button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeolocation}
                  disabled={geoLoading}
                  className="w-full justify-center gap-2"
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  Use my location
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">
                      or enter manually
                    </span>
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country" data-testid="location-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter your city"
                      className="pl-9"
                      data-testid="location-city"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !country}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  data-testid="location-save"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save & Unlock"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LocationUnlockModal
