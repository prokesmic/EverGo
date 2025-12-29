export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="h-6 w-44 rounded bg-muted animate-pulse" />
        <div className="mt-3 h-4 w-72 rounded bg-muted animate-pulse" />
        <div className="mt-8 space-y-3">
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-24 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
