"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { restartOnboarding } from "@/lib/onboarding/actions"
import { toast } from "sonner"
import { RefreshCw, Loader2 } from "lucide-react"

export function RestartOnboardingButton() {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)

  const handleRestartOnboarding = async () => {
    setLoading(true)

    try {
      const result = await restartOnboarding()

      if (result.ok) {
        // Update session to reflect the new onboardingCompleted status
        await updateSession()

        toast.success("Setup wizard restarted", {
          description: "Redirecting to setup wizard...",
        })

        // Navigate to onboarding
        router.push("/onboarding")
      }
    } catch (error) {
      console.error("Error restarting onboarding:", error)
      toast.error("Failed to restart setup wizard", {
        description: "Please try again.",
      })
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Wizard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Re-run the setup wizard to update your profile, sports, and benchmarks.
          Your existing data will be pre-filled.
        </p>
        <Button
          variant="outline"
          onClick={handleRestartOnboarding}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Restarting...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Restart Setup Wizard
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
