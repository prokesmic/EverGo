export type DomainEventName =
  | "activity.created"
  | "activity.deleted"
  | "search.queried"

export interface BaseDomainEvent<TPayload = Record<string, unknown>> {
  id: string
  name: DomainEventName
  aggregateId: string
  aggregateType: "activity" | "search" | "system"
  userId?: string
  occurredAt: string
  payload: TPayload
}

export type ActivityCreatedEvent = BaseDomainEvent<{
  activityId: string
  userId: string
  visibility: string
  power?: number
}>

export type SearchQueriedEvent = BaseDomainEvent<{
  query: string
  searchType: string
  resultCount: number
}>

export type DomainEvent = ActivityCreatedEvent | SearchQueriedEvent | BaseDomainEvent
