/**
 * V6 Home Header
 *
 * Simple welcome message with tagline
 */

interface HomeHeaderProps {
  displayName: string
}

export function HomeHeader({ displayName }: HomeHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {displayName}!
      </h1>
      <p className="text-slate-500 mt-1">
        Track anywhere. Compete here.
      </p>
    </div>
  )
}
