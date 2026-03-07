import { prisma } from "@/lib/db"
import { updateGauntletScores } from "@/lib/gauntlet"
import { updateSeasonScore } from "@/lib/season"
import { updateCrewWarScores } from "@/lib/crew-wars"
import type { DomainEvent } from "@/lib/events/types"

export async function processDomainEvent(event: DomainEvent) {
  switch (event.name) {
    case "activity.created":
      await handleActivityCreated(event)
      return { success: true, handled: event.name }
    case "search.queried":
      await handleSearchQueried(event)
      return { success: true, handled: event.name }
    default:
      await prisma.analyticsEvent.create({
        data: {
          eventName: `domain_event:${event.name}`,
          userId: event.userId ?? null,
          properties: event as unknown as object,
        },
      })
      return { success: true, handled: "default" }
  }
}

async function handleActivityCreated(event: DomainEvent) {
  const payload = event.payload as {
    activityId: string
    userId: string
    visibility: string
    power?: number
  }

  await prisma.analyticsEvent.create({
    data: {
      eventName: "activity_created",
      userId: payload.userId,
      properties: {
        activityId: payload.activityId,
        visibility: payload.visibility,
        power: payload.power ?? null,
      },
    },
  })

  if (payload.power && payload.power > 0) {
    await Promise.allSettled([
      updateGauntletScores(payload.userId, payload.power),
      updateSeasonScore(payload.userId, payload.power),
      updateCrewWarScores(payload.userId, payload.power),
    ])
  }
}

async function handleSearchQueried(event: DomainEvent) {
  const payload = event.payload as {
    query: string
    searchType: string
    resultCount: number
  }

  await prisma.analyticsEvent.create({
    data: {
      eventName: "search_query",
      userId: event.userId ?? null,
      properties: {
        query: payload.query,
        searchType: payload.searchType,
        resultCount: payload.resultCount,
      },
    },
  })
}
