import { Button } from "./button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon | string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    href: string
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl border border-border-light">
      {Icon && (
        <div className="mb-4">
          {typeof Icon === "string" ? (
            <div className="text-6xl">{Icon}</div>
          ) : (
            <Icon className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
      )}
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-md">{description}</p>
      <div className="flex gap-3">
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" size="lg" asChild>
            <a href={secondaryAction.href}>{secondaryAction.label}</a>
          </Button>
        )}
      </div>
    </div>
  )
}
