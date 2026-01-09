import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getGauntletById } from "@/lib/gauntlet"
import { GauntletDetail } from "@/components/gauntlet/GauntletDetail"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

/**
 * V6 Gauntlet Detail Page
 */
export default async function GauntletDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const gauntlet = await getGauntletById(id)

  if (!gauntlet) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <GauntletDetail gauntlet={gauntlet} currentUserId={session.user.id} />
      </div>
    </main>
  )
}
