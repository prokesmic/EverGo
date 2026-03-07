import { Suspense } from "react"
import SearchPageClient from "@/components/search/search-page-client"

function SearchPageFallback() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="rounded-xl border border-border-light bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          Loading search...
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  )
}
