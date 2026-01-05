"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

/**
 * Client component that refreshes the session and then redirects.
 * Used when the server detects onboardingCompleted=true in DB but the
 * JWT token has a stale value. This breaks the redirect loop by ensuring
 * the session is updated before navigating.
 */
export function SessionRefreshRedirect({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const { update: updateSession } = useSession()

  useEffect(() => {
    const refreshAndRedirect = async () => {
      // Update session to get fresh onboardingCompleted value from DB
      await updateSession()
      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100))
      // Now redirect with fresh token
      router.push(redirectTo)
    }

    refreshAndRedirect()
  }, [updateSession, router, redirectTo])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
      <p className="text-white/80">Redirecting...</p>
    </div>
  )
}
