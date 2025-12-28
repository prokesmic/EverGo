"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFiltersSheetProps {
  children: React.ReactNode
  title?: string
  description?: string
  triggerLabel?: string
  className?: string
  onApply?: () => void
  onClear?: () => void
}

export function MobileFiltersSheet({
  children,
  title = "Filters",
  description = "Refine your results",
  triggerLabel = "Filters",
  className,
  onApply,
  onClear,
}: MobileFiltersSheetProps) {
  const [open, setOpen] = useState(false)

  const handleApply = () => {
    onApply?.()
    setOpen(false)
  }

  const handleClear = () => {
    onClear?.()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-testid="mobile-filters-open"
          className={cn("lg:hidden gap-2", className)}
        >
          <Filter className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        data-testid="mobile-filters-sheet"
        className="h-[85vh] rounded-t-2xl"
      >
        <SheetHeader className="text-left pb-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {children}
        </div>

        <SheetFooter className="flex-row gap-3 border-t pt-4">
          {onClear && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleApply}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
