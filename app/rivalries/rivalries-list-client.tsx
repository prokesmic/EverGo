"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Filter, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RivalryCard } from "@/components/rivalry/RivalryCard"
import { StartRivalryDrawer } from "@/components/rivalry/StartRivalryDrawer"
import { acceptRivalry, declineRivalry } from "@/app/actions/rivalry"
import { RivalryStatus, RivalryMetric } from "@prisma/client"

interface Participant {
  id: string
  userId: string
  isCreator: boolean
  isAccepted: boolean
  scoreValue: number | null
  user: {
    id: string
    displayName: string
    username: string
    avatarUrl: string | null
  }
}

interface Rivalry {
  id: string
  status: RivalryStatus
  sportSlug: string
  metric: RivalryMetric
  windowStart: Date
  windowEnd: Date
  participants: Participant[]
}

interface Sport {
  id: string
  name: string
  slug: string
  icon: string
}

interface RivalriesListClientProps {
  rivalries: Rivalry[]
  currentUserId: string
  sports: Sport[]
  pendingCount: number
}

export function RivalriesListClient({
  rivalries,
  currentUserId,
  sports,
  pendingCount,
}: RivalriesListClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("active")

  const activeRivalries = rivalries.filter((r) => r.status === RivalryStatus.ACTIVE)
  const pendingRivalries = rivalries.filter((r) => r.status === RivalryStatus.PENDING)
  const completedRivalries = rivalries.filter(
    (r) =>
      r.status === RivalryStatus.COMPLETED ||
      r.status === RivalryStatus.EXPIRED ||
      r.status === RivalryStatus.CANCELLED
  )

  async function handleAccept(rivalryId: string) {
    startTransition(async () => {
      const result = await acceptRivalry(rivalryId)
      if (result.success) {
        router.refresh()
      }
    })
  }

  async function handleDecline(rivalryId: string) {
    startTransition(async () => {
      const result = await declineRivalry(rivalryId)
      if (result.success) {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <StartRivalryDrawer sports={sports}>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Start Rivalry
          </Button>
        </StartRivalryDrawer>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeRivalries.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending ({pendingRivalries.length})
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({completedRivalries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {activeRivalries.length === 0 ? (
            <EmptyState
              title="No active rivalries"
              description="Start a new rivalry to compete with friends"
              sports={sports}
            />
          ) : (
            activeRivalries.map((rivalry) => (
              <RivalryCard
                key={rivalry.id}
                id={rivalry.id}
                status={rivalry.status}
                sportSlug={rivalry.sportSlug}
                metric={rivalry.metric}
                windowStart={new Date(rivalry.windowStart)}
                windowEnd={new Date(rivalry.windowEnd)}
                participants={rivalry.participants}
                currentUserId={currentUserId}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingRivalries.length === 0 ? (
            <EmptyState
              title="No pending invites"
              description="Your rivalry invitations will appear here"
              sports={sports}
            />
          ) : (
            pendingRivalries.map((rivalry) => (
              <RivalryCard
                key={rivalry.id}
                id={rivalry.id}
                status={rivalry.status}
                sportSlug={rivalry.sportSlug}
                metric={rivalry.metric}
                windowStart={new Date(rivalry.windowStart)}
                windowEnd={new Date(rivalry.windowEnd)}
                participants={rivalry.participants}
                currentUserId={currentUserId}
                onAccept={() => handleAccept(rivalry.id)}
                onDecline={() => handleDecline(rivalry.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {completedRivalries.length === 0 ? (
            <EmptyState
              title="No rivalry history"
              description="Completed rivalries will appear here"
              sports={sports}
            />
          ) : (
            completedRivalries.map((rivalry) => (
              <RivalryCard
                key={rivalry.id}
                id={rivalry.id}
                status={rivalry.status}
                sportSlug={rivalry.sportSlug}
                metric={rivalry.metric}
                windowStart={new Date(rivalry.windowStart)}
                windowEnd={new Date(rivalry.windowEnd)}
                participants={rivalry.participants}
                currentUserId={currentUserId}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({
  title,
  description,
  sports,
}: {
  title: string
  description: string
  sports: Sport[]
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
        <Swords className="h-6 w-6 text-orange-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <StartRivalryDrawer sports={sports}>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Start a Rivalry
        </Button>
      </StartRivalryDrawer>
    </div>
  )
}
