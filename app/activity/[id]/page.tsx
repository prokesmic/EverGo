import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ActivityMap from "@/components/ui/map"
import { PageGrid } from "@/components/layout/page-grid"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { Metadata } from "next"

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

                        <div className="h-[400px] w-full bg-muted rounded-xl overflow-hidden relative z-0">
                            <ActivityMap
                                center={[50.0755, 14.4378]}
                                zoom={13}
                                path={[
                                    [50.0755, 14.4378],
                                    [50.0765, 14.4388],
                                    [50.0775, 14.4398],
                                    [50.0785, 14.4408],
                                    [50.0795, 14.4418]
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>
            </PageGrid>
        </div>
    )
}
