import { prisma } from "@/lib/db"
import { SportIndexEventType, EntityType, Prisma } from "@prisma/client"

export type EmitIndexEventInput = {
  userId: string
  sportSlug: string
  type: SportIndexEventType
  prevValue?: number | null
  newValue?: number | null
  prevRankCity?: number | null
  newRankCity?: number | null
  prevRankCountry?: number | null
  newRankCountry?: number | null
  prevRankGlobal?: number | null
  newRankGlobal?: number | null
  entityType?: EntityType | null
  entityId?: string | null
  title: string
  detailJson?: Prisma.JsonValue
  requestId?: string | null
}

/**
 * Emit a Sport Index event for explainability/audit trail.
 * Called after activity CRUD, rivalry changes, decay jobs, etc.
 *
 * This function:
 * 1. Computes delta values automatically
 * 2. Upserts the snapshot for the user+sport
 * 3. Creates the event record
 */
export async function emitIndexEvent(input: EmitIndexEventInput) {
  const deltaValue =
    input.prevValue != null && input.newValue != null
      ? input.newValue - input.prevValue
      : null

  const deltaRankCity =
    input.prevRankCity != null && input.newRankCity != null
      ? input.newRankCity - input.prevRankCity
      : null

  const deltaRankCountry =
    input.prevRankCountry != null && input.newRankCountry != null
      ? input.newRankCountry - input.prevRankCountry
      : null

  const deltaRankGlobal =
    input.prevRankGlobal != null && input.newRankGlobal != null
      ? input.newRankGlobal - input.prevRankGlobal
      : null

  // Use a transaction for atomicity
  return await prisma.$transaction(async (tx) => {
    // 1) Upsert snapshot if newValue provided
    if (input.newValue != null) {
      await tx.sportIndexSnapshot.upsert({
        where: {
          userId_sportSlug: {
            userId: input.userId,
            sportSlug: input.sportSlug,
          },
        },
        create: {
          userId: input.userId,
          sportSlug: input.sportSlug,
          value: input.newValue,
        },
        update: {
          value: input.newValue,
        },
      })
    }

    // 2) Create the event (store deltas in detailJson since schema only has prev/new)
    const eventDetail = {
      ...(input.detailJson as object || {}),
      deltaValue,
      deltaRankCity,
      deltaRankCountry,
      deltaRankGlobal,
    }

    const event = await tx.sportIndexEvent.create({
      data: {
        userId: input.userId,
        sportSlug: input.sportSlug,
        type: input.type,
        prevValue: input.prevValue,
        newValue: input.newValue,
        deltaValue,
        prevRankCity: input.prevRankCity,
        newRankCity: input.newRankCity,
        prevRankCountry: input.prevRankCountry,
        newRankCountry: input.newRankCountry,
        prevRankGlobal: input.prevRankGlobal,
        newRankGlobal: input.newRankGlobal,
        entityType: input.entityType,
        entityId: input.entityId,
        title: input.title,
        detailJson: eventDetail,
        requestId: input.requestId,
      },
    })

    return event
  })
}

/**
 * Get recent index events for a user, optionally filtered by sport
 */
export async function getIndexEvents(
  userId: string,
  options: {
    sportSlug?: string
    limit?: number
    offset?: number
  } = {}
) {
  const { sportSlug, limit = 20, offset = 0 } = options

  return await prisma.sportIndexEvent.findMany({
    where: {
      userId,
      ...(sportSlug ? { sportSlug } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
}

/**
 * Get the current snapshot for a user's sport index
 */
export async function getIndexSnapshot(userId: string, sportSlug: string) {
  return await prisma.sportIndexSnapshot.findUnique({
    where: {
      userId_sportSlug: {
        userId,
        sportSlug,
      },
    },
  })
}

/**
 * Build a human-readable title for common event types
 */
export function buildEventTitle(
  type: SportIndexEventType,
  context: {
    activityTitle?: string
    sportName?: string
    rivalryName?: string
    delta?: number
  }
): string {
  const { activityTitle, sportName, rivalryName, delta } = context
  const sport = sportName ?? "Sport"
  const sign = delta && delta > 0 ? "+" : ""

  switch (type) {
    case "ACTIVITY_ADDED":
      return activityTitle
        ? `Logged: ${activityTitle}`
        : `New ${sport} activity logged`

    case "ACTIVITY_EDITED":
      return activityTitle
        ? `Edited: ${activityTitle}`
        : `${sport} activity updated`

    case "ACTIVITY_DELETED":
      return activityTitle
        ? `Deleted: ${activityTitle}`
        : `${sport} activity removed`

    case "ACTIVITY_IMPORTED":
      return activityTitle
        ? `Imported: ${activityTitle}`
        : `${sport} activity synced`

    case "PERSONAL_BEST_ADDED":
      return `New personal best in ${sport}!`

    case "PERSONAL_BEST_UPDATED":
      return `Personal best improved in ${sport}!`

    case "RIVALRY_SCORE_CHANGED":
      return rivalryName
        ? `Rivalry update: ${rivalryName}`
        : `Rivalry score changed`

    case "RIVALRY_COMPLETED":
      return rivalryName
        ? `Rivalry completed: ${rivalryName}`
        : `Rivalry finished`

    case "DECAY_APPLIED":
      return delta != null
        ? `Inactivity decay: ${sign}${delta} pts`
        : `Index adjusted for inactivity`

    case "VERIFICATION_UPGRADED":
      return `Activity verification upgraded`

    case "ANOMALY_FLAGGED":
      return `Activity flagged for review`

    case "ADMIN_ADJUSTMENT":
      return delta != null
        ? `Admin adjustment: ${sign}${delta} pts`
        : `Admin adjustment applied`

    default:
      return `Sport Index updated`
  }
}
