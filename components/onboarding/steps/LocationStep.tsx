"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Globe } from "lucide-react"

interface LocationStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export function LocationStep({ formData, updateFormData }: LocationStepProps) {
  const [city, setCity] = useState(formData.city)
  const [country, setCountry] = useState(formData.country)

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value)
    updateFormData({ city: e.target.value })
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountry(e.target.value)
    updateFormData({ country: e.target.value })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Where are you based?
        </h2>
        <p className="text-gray-600">
          This helps us show you local rankings, events, and nearby athletes
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="city" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            City
          </Label>
          <Input
            id="city"
            placeholder="e.g., Prague"
            value={city}
            onChange={handleCityChange}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Country
          </Label>
          <Input
            id="country"
            placeholder="e.g., Czech Republic"
            value={country}
            onChange={handleCountryChange}
            className="text-lg"
          />
        </div>

        {city && country && (
          <div className="bg-gradient-to-r from-brand-blue/10 to-brand-green/10 rounded-xl p-6 border border-brand-blue/20">
            <h3 className="font-semibold text-gray-900 mb-3">Your local features:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-brand-blue">🏆</span>
                <span>City rankings for {city}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-blue">👥</span>
                <span>Connect with athletes in {city}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-blue">📍</span>
                <span>Discover local teams and events</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-blue">🌍</span>
                <span>Country rankings for {country}</span>
              </li>
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Your location is only used to enhance your experience. You can change your privacy settings anytime.
        </p>
      </div>
    </div>
  )
}
