import { prisma } from "@/lib/db"
import { MissionControlForm } from "@/components/activity/mission-control-form"
import { Rocket } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CreateActivityPage() {
    const sports = await prisma.sport.findMany({
        include: {
            disciplines: true,
        },
        orderBy: {
            name: "asc",
        },
    })

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container max-w-6xl py-8 px-4 md:px-6">
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
                    <MissionControlForm sports={sports} />
                </div>
            </div>
        </div>
    )
}
