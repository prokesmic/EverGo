import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { RankingsClient } from "./rankings-client"

export const dynamic = 'force-dynamic'

function RankingsLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading rankings...</div>
        </div>
    )
}

export default async function RankingsPage() {
    // Fetch sports for filter
    const sports = await prisma.sport.findMany({
        orderBy: { name: "asc" },
    })

    return (
        <Suspense fallback={<RankingsLoading />}>
            <RankingsClient sports={sports} />
        </Suspense>
    )
}
