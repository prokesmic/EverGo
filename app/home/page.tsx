import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { PageGrid } from "@/components/layout/page-grid"
import { RankingsWidget } from "@/components/widgets/rankings-widget"
import { ActivitiesSummaryWidget } from "@/components/widgets/activities-summary-widget"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { TeamsWidget } from "@/components/widgets/teams-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { ActivityCard } from "@/components/feed/activity-card"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Image, MapPin } from "lucide-react"

export default async function HomePage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const activities = await prisma.activity.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: true,
            discipline: {
                include: {
                    sport: true,
                },
            },
        },
        take: 20,
    })

    const leftSidebar = (
        <>
            <ActivitiesSummaryWidget />
            <RankingsWidget />
        </>
    )

    const rightSidebar = (
        <>
            <CalendarWidget />
            <TeamsWidget />
            <BrandsWidget />
        </>
    )

    return (
        <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
            {/* Create Post Input */}
            <Card className="mb-6 border-gray-100 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={session.user?.image || ""} />
                            <AvatarFallback className="bg-brand-blue text-white">{session.user?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                            <Input placeholder="What's new with your training?" className="bg-gray-50 border-gray-200 focus-visible:ring-brand-blue" />
                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-blue hover:bg-blue-50">
                                        <Image className="mr-2 h-4 w-4" />
                                        Photo
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-blue hover:bg-blue-50">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Location
                                    </Button>
                                </div>
                                <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-dark text-white font-medium px-6">Post</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Feed */}
            <div className="space-y-6">
                {activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                ))}
                {activities.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-100">
                        <p>No activities yet. Go log one!</p>
                    </div>
                )}
            </div>
        </PageGrid>
    )
}
