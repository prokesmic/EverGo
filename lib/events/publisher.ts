import { randomUUID } from "crypto"
import type { Prisma } from "@prisma/client"
import { enqueueJob } from "@/lib/jobs/queue"
import type { BaseDomainEvent, DomainEvent, DomainEventName } from "@/lib/events/types"

type EventInput = {
  name: DomainEventName
  aggregateId: string
  aggregateType: "activity" | "search" | "system"
  userId?: string
  payload: Record<string, unknown>
}

export function buildDomainEvent(input: EventInput): BaseDomainEvent {
  return {
    id: randomUUID(),
    name: input.name,
    aggregateId: input.aggregateId,
    aggregateType: input.aggregateType,
    userId: input.userId,
    occurredAt: new Date().toISOString(),
    payload: input.payload,
  }
}

export async function enqueueDomainEvent(event: DomainEvent): Promise<string> {
  return enqueueJob(
    "PROCESS_DOMAIN_EVENT",
    { event },
    {
      idempotencyKey: `domain-event:${event.id}`,
      priority: 50,
    }
  )
}

export async function enqueueDomainEventTx(
  tx: Prisma.TransactionClient,
  event: DomainEvent
) {
  await tx.jobQueue.create({
    data: {
      jobType: "PROCESS_DOMAIN_EVENT",
      payload: JSON.stringify({ event }),
      status: "PENDING",
      priority: 50,
      idempotencyKey: `domain-event:${event.id}`,
    },
  })
}
