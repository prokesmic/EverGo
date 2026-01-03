import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ChallengeCreationForm } from "@/components/challenges/challenge-creation-form"
import { GradientHeader } from "@/components/ui/frosted-card"
import { Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CreateChallengePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        redirect("/login")
    }

    const sports = await prisma.sport.findMany({
        orderBy: { name: "asc" },
    })

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto py-8 px-4 md:px-6">
                <GradientHeader
                    icon={<Trophy className="w-6 h-6" />}
                    title="Create Challenge"
                    description="Challenge your friends and community to reach new goals"
                />

                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
                    <ChallengeCreationForm sports={sports} userId={user.id} />
                </div>
            </div>
        </div>
    )
}
