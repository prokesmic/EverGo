import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getRouteSuggestions } from "@/lib/elite/route-intelligence"
import { Card, CardContent } from "@/components/ui/card"
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
          <h1 className="eg-display mt-1 text-3xl font-black text-foreground">Best local routes for your next session</h1>
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
            <Card key={route.id} className="eg-surface border-0">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-foreground">{route.title}</div>
                    <div className="text-xs text-muted-foreground">{route.sport}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="eg-pill">{route.surface}</span>
                    <span className="eg-pill eg-pill-good">{route.intent}</span>
                  </div>
                </div>

                <RoutePreview path={route.previewPath} />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Distance</div>
                    <div className="font-semibold">{route.distanceKm.toFixed(1)} km</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Elevation</div>
                    <div className="font-semibold">{route.elevationGain} m</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Terrain</div>
                    <div className="font-semibold capitalize">{route.terrain}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Safety</div>
                    <div className="font-semibold">{route.safetyScore}/100</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {route.conditions.map((condition) => (
                    <span key={condition} className="eg-pill eg-pill-soft">
                      {condition}
                    </span>
                  ))}
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

function RoutePreview({ path }: { path: string | null }) {
  return (
    <div className="rounded-xl border border-border-light bg-white/70 p-3">
      <svg viewBox="0 0 120 70" className="h-24 w-full">
        <rect x="0" y="0" width="120" height="70" rx="10" fill="url(#route-bg)" />
        {path ? (
          <path d={path} fill="none" stroke="url(#route-line)" strokeWidth="2.4" />
        ) : (
          <path d="M8 45 L30 30 L48 40 L72 20 L98 32 L112 24" fill="none" stroke="url(#route-line)" strokeWidth="2.4" />
        )}
        <defs>
          <linearGradient id="route-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="route-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
