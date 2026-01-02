"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, MapPin, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnboardingStore } from "@/lib/onboarding/store"
import { COUNTRIES } from "@/lib/location/countries"
import { GENDER_OPTIONS } from "@/schemas/onboarding"

interface City {
  id: string
  name: string
  population: number | null
}

// Special marker for custom cities
const CUSTOM_CITY_PREFIX = "custom:"

export function Step1Identity() {
  const store = useOnboardingStore()
  const [cityOpen, setCityOpen] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [citySearch, setCitySearch] = useState("")
  const [loadingCities, setLoadingCities] = useState(false)
  const [showCustomCity, setShowCustomCity] = useState(false)
  const [customCityName, setCustomCityName] = useState("")

  // Check if current city is a custom one
  const isCustomCity = store.cityId.startsWith(CUSTOM_CITY_PREFIX)

  // Initialize custom city state from store
  useEffect(() => {
    if (isCustomCity) {
      setShowCustomCity(true)
      setCustomCityName(store.cityName)
    }
  }, [])

  // Fetch cities when country changes
  useEffect(() => {
    if (!store.countryCode) {
      setCities([])
      return
    }

    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const params = new URLSearchParams({ country: store.countryCode })
        if (citySearch.length >= 2) {
          params.set("q", citySearch)
        }
        const res = await fetch(`/api/location/cities?${params}`)
        const data = await res.json()
        setCities(data.cities || [])
      } catch (e) {
        console.error("Failed to fetch cities:", e)
        setCities([])
      } finally {
        setLoadingCities(false)
      }
    }

    fetchCities()
  }, [store.countryCode, citySearch])

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code)
    if (country) {
      store.setFields({
        countryCode: country.code,
        countryName: country.name,
        cityId: "",
        cityName: "",
      })
      setCities([])
      setCitySearch("")
      setShowCustomCity(false)
      setCustomCityName("")
    }
  }

  const handleCitySelect = (city: City) => {
    store.setFields({
      cityId: city.id,
      cityName: city.name,
    })
    setCityOpen(false)
    setShowCustomCity(false)
    setCustomCityName("")
  }

  const handleCustomCityToggle = () => {
    setShowCustomCity(true)
    setCityOpen(false)
    // Clear any existing city selection
    store.setFields({
      cityId: "",
      cityName: "",
    })
  }

  const handleCustomCityChange = (name: string) => {
    setCustomCityName(name)
    if (name.trim().length >= 2) {
      store.setFields({
        cityId: `${CUSTOM_CITY_PREFIX}${name.trim()}`,
        cityName: name.trim(),
      })
    } else {
      store.setFields({
        cityId: "",
        cityName: "",
      })
    }
  }

  const handleBackToSearch = () => {
    setShowCustomCity(false)
    setCustomCityName("")
    store.setFields({
      cityId: "",
      cityName: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-gray-600 mt-2">
          Your location unlocks City and Country rankings instantly
        </p>
      </div>

      <div className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name *</Label>
          <Input
            id="displayName"
            value={store.displayName}
            onChange={(e) => store.setField("displayName", e.target.value)}
            placeholder="Your name"
            className="text-lg"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio (optional)</Label>
          <Textarea
            id="bio"
            value={store.bio}
            onChange={(e) => store.setField("bio", e.target.value)}
            placeholder="A short bio about yourself..."
            maxLength={280}
            rows={2}
          />
          <p className="text-xs text-gray-500 text-right">
            {store.bio.length}/280
          </p>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender (optional)</Label>
          <Select
            value={store.gender || ""}
            onValueChange={(value) => store.setField("gender", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Section */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Your Location</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Country */}
            <div className="space-y-2">
              <Label>Country *</Label>
              <Select value={store.countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>City *</Label>
              {showCustomCity ? (
                <div className="space-y-2">
                  <Input
                    value={customCityName}
                    onChange={(e) => handleCustomCityChange(e.target.value)}
                    placeholder="Enter your city name"
                    className="w-full"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleBackToSearch}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Back to city search
                  </button>
                </div>
              ) : (
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={cityOpen}
                      className="w-full justify-between"
                      disabled={!store.countryCode}
                    >
                      {store.cityName || "Select city..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search city..."
                        value={citySearch}
                        onValueChange={setCitySearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingCities ? (
                            "Loading..."
                          ) : (
                            <div className="py-2 px-2">
                              <p className="text-sm text-gray-500 mb-2">No cities found.</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={handleCustomCityToggle}
                              >
                                <Plus className="h-4 w-4" />
                                Enter city manually
                              </Button>
                            </div>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={city.id}
                              onSelect={() => handleCitySelect(city)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  store.cityId === city.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {/* Always show option to enter custom city */}
                        {cities.length > 0 && (
                          <div className="p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full gap-2 text-gray-600"
                              onClick={handleCustomCityToggle}
                            >
                              <Plus className="h-4 w-4" />
                              My city is not listed
                            </Button>
                          </div>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Why location matters:</span> See how you rank in your city and country. Compete with locals and athletes worldwide.
        </p>
      </div>
    </div>
  )
}
