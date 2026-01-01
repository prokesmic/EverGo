"use client"

import { useState, useCallback } from "react"
import { RankStrip } from "./RankStrip"
import { LocationUnlockModal } from "@/components/modals/LocationUnlockModal"

interface RankStripWithModalProps {
  className?: string
}

export function RankStripWithModal({ className }: RankStripWithModalProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const handleLocationSetup = useCallback(() => {
    setIsLocationModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsLocationModalOpen(false)
  }, [])

  const handleSuccess = useCallback(() => {
    // Force refresh of the page to update ranks
    window.location.reload()
  }, [])

  return (
    <>
      <RankStrip className={className} onLocationSetup={handleLocationSetup} />
      <LocationUnlockModal
        isOpen={isLocationModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default RankStripWithModal
