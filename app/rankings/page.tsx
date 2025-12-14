import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { RankingsClient } from "./rankings-client"
import { Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'

function RankingsLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="eg-icon-box-sky">
                    <Trophy className="w-6 h-6" />
                </div>
                <span className="text-slate-500">Loading rankings...</span>
            </div>
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
