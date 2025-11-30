import { prisma } from "@/lib/db"
import { RankingsClient } from "./rankings-client"

export default async function RankingsPage() {
    // Fetch sports for filter
    const sports = await prisma.sport.findMany({
        orderBy: { name: "asc" },
    })

    return <RankingsClient sports={sports} />
}
