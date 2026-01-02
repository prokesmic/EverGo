"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COUNTRIES } from "@/lib/location/countries"

interface CountrySelectProps {
  value: string
  onChange: (countryCode: string) => void
  disabled?: boolean
  placeholder?: string
}

export function CountrySelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Select country",
}: CountrySelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
