import { NextRequest, NextResponse } from "next/server"
import { recalculateAllRankings } from "@/lib/rankings"
import { verifyCronRequest } from "@/lib/cron"

export async function GET(request: NextRequest) {
    // Verify cron authentication
    const authError = verifyCronRequest(request)
    if (authError) return authError

    try {
        await recalculateAllRankings()

        return NextResponse.json({ success: true, message: "Rankings recalculated successfully" })
    } catch (error) {
        console.error("Error recalculating rankings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
