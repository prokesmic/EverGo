import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ThrowGauntletWizard } from "@/components/gauntlet/ThrowGauntletWizard"

export const dynamic = "force-dynamic"

/**
 * V6 Throw Gauntlet Page
 *
 * Wizard to challenge an opponent
 */
export default async function NewGauntletPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Throw a Gauntlet</h1>
          <p className="text-slate-500">Challenge an athlete to compete</p>
        </div>

        <ThrowGauntletWizard userId={session.user.id} />
      </div>
    </main>
  )
}
