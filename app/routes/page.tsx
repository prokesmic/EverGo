import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getRouteSuggestions } from "@/lib/elite/route-intelligence"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function RoutesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  if (!user) {
    redirect("/login")
  }

  const suggestions = await getRouteSuggestions({ userId: user.id, limit: 16 })

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="eg-mode-shell eg-mode-social rounded-2xl border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Route Intelligence
          </p>
          <h1 className="mt-1 text-3xl font-black text-foreground">Best local routes for your next session</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Suggestions rank by popularity, safety confidence, terrain fit, and training window.
          </p>
          <div className="mt-4">
            <Button asChild className="rounded-full">
              <Link href="/activity/track">Start GPS Session</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((route) => (
            <Card key={route.id}>
              <CardHeader>
                <CardTitle className="text-lg">{route.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sport</span>
                  <span className="font-semibold">{route.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-semibold">{route.distanceKm.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terrain</span>
                  <span className="font-semibold capitalize">{route.terrain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crowd Heat</span>
                  <span className="font-semibold">{route.crowdHeat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Safety Score</span>
                  <span className="font-semibold">{route.safetyScore}/100</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Best windows:{" "}
                  <span className="font-medium text-foreground">
                    {route.recommendedWindows.join(", ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
