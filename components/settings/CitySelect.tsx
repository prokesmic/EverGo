"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface City {
  id: string
  name: string
}

interface CitySelectProps {
  countryCode: string
  value: City | null
  onChange: (city: City | null) => void
  disabled?: boolean
  placeholder?: string
}

export function CitySelect({
  countryCode,
  value,
  onChange,
  disabled = false,
  placeholder = "Select city",
}: CitySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchCities = useCallback(
    async (query: string) => {
      if (!countryCode) {
        setCities([])
        return
      }

      setLoading(true)
      try {
        const params = new URLSearchParams({ country: countryCode })
        if (query) {
          params.set("q", query)
        }

        const res = await fetch(`/api/location/cities?${params}`)
        if (res.ok) {
          const data = await res.json()
          setCities(data.cities || [])
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error)
        setCities([])
      } finally {
        setLoading(false)
      }
    },
    [countryCode]
  )

  // Fetch initial cities when country changes or popover opens
  useEffect(() => {
    if (countryCode && open) {
      fetchCities("")
    }
  }, [countryCode, open, fetchCities])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (search && countryCode) {
      debounceRef.current = setTimeout(() => {
        fetchCities(search)
      }, 300)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [search, countryCode, fetchCities])

  const handleSelect = (city: City) => {
    onChange(city)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-11 justify-between font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled || !countryCode}
        >
          {value?.name || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search city..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : cities.length === 0 ? (
              <CommandEmpty>
                {search ? "No cities found." : "Start typing to search..."}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={city.id}
                    onSelect={() => handleSelect(city)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === city.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {city.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
