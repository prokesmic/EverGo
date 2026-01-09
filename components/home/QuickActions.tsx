"use client"

/**
 * V6 Quick Actions Widget
 *
 * Primary actions available from home page sidebar
 */

import { Button } from "@/components/ui/button"
import { Plus, Trophy, UserSearch, Swords } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>

      <div className="space-y-2">
        <Link href="/activity/create" className="block">
          <Button className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4" />
            Log Activity
          </Button>
        </Link>

        <Link href="/gauntlets/new" className="block">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Swords className="w-4 h-4" />
            Throw Gauntlet
          </Button>
        </Link>

        <Link href="/rankings" className="block">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Trophy className="w-4 h-4" />
            View Rankings
          </Button>
        </Link>

        <Link href="/gauntlets/opponents" className="block">
          <Button variant="outline" className="w-full justify-start gap-2">
            <UserSearch className="w-4 h-4" />
            Find Opponent
          </Button>
        </Link>
      </div>
    </div>
  )
}
