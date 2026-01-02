import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
    try {
        // Get all cookies
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        const sessionCookies = allCookies.filter(c =>
            c.name.includes('next-auth') || c.name.includes('session')
        )

        // Try to get the session
        const session = await getServerSession(authOptions)

        // Check env vars (without exposing secrets)
        const envCheck = {
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
            nextAuthUrl: process.env.NEXTAUTH_URL || "NOT SET",
            vercelUrl: process.env.VERCEL_URL || "NOT SET",
            nodeEnv: process.env.NODE_ENV,
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            session: session ? {
                hasSession: true,
                userId: session.user?.id,
                email: session.user?.email,
                username: session.user?.username,
            } : {
                hasSession: false,
                session: null
            },
            cookies: {
                count: sessionCookies.length,
                names: sessionCookies.map(c => c.name),
                // Don't expose actual values for security
            },
            envCheck,
        })
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : null,
        }, { status: 500 })
    }
}
