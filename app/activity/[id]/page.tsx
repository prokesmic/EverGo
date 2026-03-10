import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ActivityMap from "@/components/ui/map"
import { PageGrid } from "@/components/layout/page-grid"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { ActivityIntegrityPanel } from "@/components/activity/ActivityIntegrityPanel"
import { Metadata } from "next"
import {
    buildElevationProfile,
    buildEstimatedSplits,
    getMapCenter,
    parseGpsRoute,
    parseStartLocation,
    toLeafletPath,
} from "@/lib/activity/route"

export const dynamic = 'force-dynamic'

interface ActivityPageProps {
    params: Promise<{
        id: string
    }>
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
    const { id } = await params

    const activity = await prisma.activity.findUnique({
        where: { id },
        include: {
            user: true,
            sport: true,
            discipline: true
        }
    })

    if (!activity) {
        return {
            title: "Activity Not Found",
        }
    }

    const distanceKm = ((activity.distanceMeters || 0) / 1000).toFixed(2)
    const sportName = activity.sport?.name || "Activity"

    return {
        title: `${activity.title} - ${activity.user.displayName} | EverGo`,
        description: `${activity.user.displayName} completed a ${distanceKm}km ${sportName} on EverGo. Check out their activity and stats!`,
        openGraph: {
            title: activity.title,
            description: `${distanceKm}km ${sportName} • ${activity.user.displayName}`,
            type: "article",
            images: [
                {
                    url: activity.user.avatarUrl || "https://evergo.app/og-image.png",
                    width: 1200,
                    height: 630,
                    alt: `${activity.user.displayName}'s ${sportName}`,
                },
            ],
            siteName: "EverGo",
        },
        twitter: {
            card: "summary_large_image",
            title: activity.title,
            description: `${distanceKm}km ${sportName} • ${activity.user.displayName}`,
            images: [activity.user.avatarUrl || "https://evergo.app/og-image.png"],
        },
    }
}

export default async function ActivityPage({ params }: ActivityPageProps) {
    const { id } = await params

    const activity = await prisma.activity.findUnique({
        where: { id },
        include: {
            user: true,
            sport: true,
            discipline: true
        }
    })

    if (!activity) {
        notFound()
    }

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const routePoints = parseGpsRoute(activity.gpsRoute)
    const startLocation = parseStartLocation(activity.startLocation)
    const mapPath = toLeafletPath(routePoints)
    const mapCenter = getMapCenter(mapPath, startLocation)
    const elevationProfile = buildElevationProfile(routePoints)
    const splits = buildEstimatedSplits(activity.distanceMeters, activity.durationSeconds)

    const hasMapData = mapPath.length > 1 || !!startLocation
    const mapMarkers =
        mapPath.length > 1
            ? [
                { position: mapPath[0], title: "Start" },
                { position: mapPath[mapPath.length - 1], title: "Finish" },
            ]
            : startLocation
                ? [{ position: [startLocation.lat, startLocation.lng] as [number, number], title: "Start" }]
                : undefined
    const elevationMin = elevationProfile.length > 0 ? Math.min(...elevationProfile) : 0
    const elevationMax = elevationProfile.length > 0 ? Math.max(...elevationProfile) : 0
    const elevationRange = Math.max(1, elevationMax - elevationMin)
    const elevationPolyline = elevationProfile
        .map((value, index) => {
            const x = (index / Math.max(1, elevationProfile.length - 1)) * 100
            const y = 92 - ((value - elevationMin) / elevationRange) * 84
            return `${x},${y}`
        })
        .join(" ")

    return (
        <div className="min-h-screen bg-bg-page">
            <PageGrid
                rightSidebar={
                    <>
                        <CalendarWidget />
                        <BrandsWidget />
                    </>
                }
            >
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={activity.user.avatarUrl || undefined} />
                            <AvatarFallback>{activity.user.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{activity.title}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {activity.user.displayName} • {formatDistanceToNow(activity.activityDate, { addSuffix: true })}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold">Distance</div>
                                <div className="text-2xl font-bold">{((activity.distanceMeters || 0) / 1000).toFixed(2)} <span className="text-sm font-normal">km</span></div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold">Time</div>
                                <div className="text-2xl font-bold">{formatDuration(activity.durationSeconds || 0)}</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold">Elevation</div>
                                <div className="text-2xl font-bold">{activity.elevationGain || 0} <span className="text-sm font-normal">m</span></div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold">Calories</div>
                                <div className="text-2xl font-bold">{activity.caloriesBurned || 0}</div>
                            </div>
                        </div>

                        {hasMapData ? (
                            <div className="h-[400px] w-full bg-muted rounded-xl overflow-hidden relative z-0">
                                <ActivityMap
                                    center={mapCenter}
                                    zoom={13}
                                    path={mapPath.length > 1 ? mapPath : undefined}
                                    markers={mapMarkers}
                                />
                            </div>
                        ) : (
                            <div className="h-[220px] w-full bg-muted rounded-xl flex items-center justify-center text-sm text-muted-foreground">
                                Route data unavailable for this activity.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Elevation Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {elevationProfile.length > 1 ? (
                                <>
                                    <div className="h-44 w-full rounded-lg border border-border-light bg-gradient-to-b from-emerald-100/60 to-transparent p-3">
                                        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                                            <polyline
                                                fill="none"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth="2.5"
                                                strokeLinejoin="round"
                                                strokeLinecap="round"
                                                points={elevationPolyline}
                                            />
                                        </svg>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Min: {Math.round(elevationMin)} m</span>
                                        <span>Max: {Math.round(elevationMax)} m</span>
                                        <span>Range: {Math.round(elevationMax - elevationMin)} m</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No detailed elevation points found in GPS data.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Estimated Splits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {splits.length > 0 ? (
                                <div className="space-y-2">
                                    {splits.map((split) => (
                                        <div
                                            key={split.label}
                                            className="grid grid-cols-3 items-center rounded-lg border border-border-light px-3 py-2 text-sm"
                                        >
                                            <span className="font-medium text-foreground">{split.label}</span>
                                            <span className="text-center text-muted-foreground">
                                                {formatDuration(Math.round(split.splitSeconds))}
                                            </span>
                                            <span className="text-right text-muted-foreground">
                                                {formatDuration(Math.round(split.cumulativeSeconds))}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-3 px-1 text-xs text-muted-foreground">
                                        <span>Segment</span>
                                        <span className="text-center">Split</span>
                                        <span className="text-right">Cumulative</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Splits need both distance and duration values.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                  <ActivityIntegrityPanel activityId={activity.id} />
                </div>
            </PageGrid>
        </div>
    )
}
