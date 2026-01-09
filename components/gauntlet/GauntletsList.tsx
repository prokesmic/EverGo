"use client"

/**
 * V6 Gauntlets List
 *
 * Renders a list of gauntlet cards
 */

import { GauntletCard } from "./GauntletCard"

interface GauntletsListProps {
  gauntlets: any[]
  currentUserId: string
  isPublicView?: boolean
}

export function GauntletsList({
  gauntlets,
  currentUserId,
  isPublicView = false,
}: GauntletsListProps) {
  if (gauntlets.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {gauntlets.map((gauntlet) => (
        <GauntletCard
          key={gauntlet.id}
          gauntlet={gauntlet}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
