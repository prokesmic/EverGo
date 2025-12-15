"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface GhostEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function GhostEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: GhostEmptyStateProps) {
  return (
    <div className={cn("vapor-ghost", className)}>
      <div className="vapor-ghost-text flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 mb-4"
        >
          <Icon className="w-8 h-8 text-slate-400" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-lg font-semibold text-slate-700 mb-2"
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-sm text-slate-500 max-w-xs mb-6"
        >
          {description}
        </motion.p>

        {(actionLabel && (actionHref || onAction)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {actionHref ? (
              <Link href={actionHref}>
                <Button className="vapor-btn-primary">
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button className="vapor-btn-primary" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
