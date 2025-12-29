import { cn } from "@/lib/utils"
import { SportGlyph } from "./SportGlyph"

type SportLike = {
  slug?: string
  category?: string
  name?: string
  icon?: string
}

interface SportChipProps {
  sport: SportLike
  label: string
  className?: string
  size?: "sm" | "md"
}

export function SportChip({ sport, label, className, size = "sm" }: SportChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-white/90 backdrop-blur-sm",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        className
      )}
    >
      <SportGlyph sport={sport} size="sm" className="border-0 shadow-none bg-transparent" />
      <span className="font-medium text-muted-foreground max-w-[100px] truncate">{label}</span>
    </div>
  )
}
