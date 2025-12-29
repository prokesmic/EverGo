"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-14">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xl font-semibold">Create Team failed to load</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Try again. If it keeps happening, check server logs for the digest.
        </div>

        <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs">
          <div className="font-medium">Digest</div>
          <div className="mt-1">{error.digest ?? "n/a"}</div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => reset()}>
            Retry
          </Button>
          <Button asChild>
            <Link href="/teams">Back to Teams</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
