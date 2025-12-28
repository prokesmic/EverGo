"use client"

import { useState } from "react"
import { MySport } from "@/lib/mySports"
import { SportItem } from "@/lib/sports"
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
import { Check, ChevronsUpDown, Crown, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  activeSports: MySport[]
  allSports: SportItem[]
  selectedSportId: string | null
  onSelect: (sportId: string | null) => void
  showAllOption?: boolean
}

export function SportSelector({
  activeSports,
  allSports,
  selectedSportId,
  onSelect,
  showAllOption = true,
}: Props) {
  const [open, setOpen] = useState(false)

  const selectedSport = selectedSportId
    ? allSports.find((s) => s.id === selectedSportId)
    : null

  const isUserSport = (sportId: string) =>
    activeSports.some((s) => s.sportId === sportId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedSport ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedSport.icon}</span>
              <span className="truncate">{selectedSport.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              All Sports
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search sports..." />
          <CommandList>
            <CommandEmpty>No sport found.</CommandEmpty>

            {/* All Sports option */}
            {showAllOption && (
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onSelect(null)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedSportId === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Trophy className="w-4 h-4 mr-2" />
                  All Sports (Combined)
                </CommandItem>
              </CommandGroup>
            )}

            {/* User's active sports */}
            {activeSports.length > 0 && (
              <CommandGroup heading="Your Sports">
                {activeSports.map((sport, index) => (
                  <CommandItem
                    key={sport.id}
                    value={sport.sportName}
                    onSelect={() => {
                      onSelect(sport.sportId)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSportId === sport.sportId
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="text-lg mr-2">{sport.sportIcon}</span>
                    <span className="flex-1">{sport.sportName}</span>
                    {index === 0 && (
                      <Crown className="w-4 h-4 text-orange-500 ml-1" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* All other sports */}
            <CommandGroup heading="All Sports">
              {allSports
                .filter((sport) => !isUserSport(sport.id))
                .map((sport) => (
                  <CommandItem
                    key={sport.id}
                    value={sport.name}
                    onSelect={() => {
                      onSelect(sport.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSportId === sport.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="text-lg mr-2">{sport.icon}</span>
                    {sport.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
