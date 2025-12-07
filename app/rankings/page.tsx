import { prisma } from "@/lib/db"
import { RankingsClient } from "./rankings-client"

export const dynamic = 'force-dynamic'

export default async function RankingsPage() {
    // Fetch sports for filter
    const sports = await prisma.sport.findMany({
        orderBy: { name: "asc" },
    })

    return <RankingsClient sports={sports} />
}
