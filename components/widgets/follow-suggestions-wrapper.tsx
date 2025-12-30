"use client"

import { SuggestedAthletes } from "@/components/recommendations/SuggestedAthletes"

/**
 * Wrapper for sidebar suggestions.
 * Uses the unified SuggestedAthletes component with "list" variant.
 * @deprecated Use SuggestedAthletes directly with variant="list"
 */
export function FollowSuggestionsWrapper() {
  return <SuggestedAthletes variant="list" title="Suggested Athletes" limit={5} />
}
