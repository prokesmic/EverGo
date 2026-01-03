import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

/**
 * Simple test home page to isolate auth issues
 */
export default async function HomeTestPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">No Session</h1>
                <p>getServerSession returned null</p>
            </div>
        )
    }

    if (!session.user?.email) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">No Email in Session</h1>
                <pre>{JSON.stringify(session, null, 2)}</pre>
            </div>
        )
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">User Not Found</h1>
                <p>Email: {session.user.email}</p>
                <p>No user found in database with this email</p>
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-green-600">Login Successful!</h1>
            <div className="mt-4 space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Display Name:</strong> {user.displayName}</p>
                <p><strong>Username:</strong> {user.username}</p>
            </div>
            <div className="mt-8">
                <a href="/home" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Go to Real Home Page
                </a>
            </div>
        </div>
    )
}
