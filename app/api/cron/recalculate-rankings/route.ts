import { NextResponse } from "next/server"
import { recalculateAllRankings } from "@/lib/rankings"

export async function GET(request: Request) {
    try {
        // In a real production app, verify a secret token here to prevent unauthorized access
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return new Response('Unauthorized', { status: 401 });
        // }

        await recalculateAllRankings()

        return NextResponse.json({ success: true, message: "Rankings recalculated successfully" })
    } catch (error) {
        console.error("Error recalculating rankings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
