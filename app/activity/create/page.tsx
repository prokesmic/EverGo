import { prisma } from "@/lib/db"
import { MissionControlForm } from "@/components/activity/mission-control-form"
import { Rocket } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const dynamic = 'force-dynamic'

export default async function CreateActivityPage() {
    const session = await getServerSession(authOptions)

    // Fetch all sports
    const allSports = await prisma.sport.findMany({
        include: {
            disciplines: true,
        },
        orderBy: {
            name: "asc",
        },
    })

    // Fetch user's active sports (if logged in)
    let activeSportIds: string[] = []
    let userBenchmarkBests: { benchmarkId: string; value: number; achievedAt: Date }[] = []

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                sports: {
                    where: { status: "ACTIVE" },
                    select: {
                        sportId: true
                    },
                    orderBy: { priority: "asc" }
                },
                benchmarkBests: {
                    select: {
                        benchmarkId: true,
                        value: true,
                        achievedAt: true
                    }
                }
            }
        })
        if (user) {
            activeSportIds = user.sports.map(s => s.sportId)
            userBenchmarkBests = user.benchmarkBests
        }
    }

    // Fetch benchmark definitions for PB display
    const benchmarkDefinitions = await prisma.benchmarkDefinition.findMany({
        where: { isActive: true },
        select: {
            id: true,
            sportId: true,
            slug: true,
            name: true,
            measurementType: true,
            unit: true,
            higherIsBetter: true,
        }
    })

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto py-8 px-4 md:px-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Mission Control</h1>
                    </div>
                    <p className="text-slate-500 text-lg">Log your latest performance</p>
                </div>

                {/* Form Container */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
                    <MissionControlForm
                        sports={allSports}
                        activeSportIds={activeSportIds}
                        benchmarkDefinitions={benchmarkDefinitions}
                        userBenchmarkBests={userBenchmarkBests}
                    />
                </div>
            </div>
        </div>
    )
}
