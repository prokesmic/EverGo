import { prisma } from "@/lib/db"
import { GPSTrackerPage } from "@/components/activity/gps-tracker-page"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default async function TrackActivityPage() {
  const sports = await prisma.sport.findMany({
    include: {
      disciplines: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 md:px-6">
      <Card className="mb-6 border-brand-primary/20 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            Live GPS Tracking
          </CardTitle>
          <CardDescription>
            Record your activity with real-time GPS tracking. Your route, distance, and pace will be tracked automatically.
          </CardDescription>
        </CardHeader>
      </Card>

      <GPSTrackerPage sports={sports} />
    </div>
  )
}
