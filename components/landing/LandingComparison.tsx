import { Check, X } from "lucide-react"

const comparison = {
  headers: ["Feature", "EverGo", "Strava", "Nike Run Club"],
  rows: [
    {
      feature: "Multi-Sport Support",
      evergo: true,
      strava: "Limited",
      nike: false,
    },
    {
      feature: "Global Rankings",
      evergo: true,
      strava: "Segments only",
      nike: false,
    },
    {
      feature: "Local City Rankings",
      evergo: true,
      strava: false,
      nike: false,
    },
    {
      feature: "Partner Finder",
      evergo: true,
      strava: false,
      nike: false,
    },
    {
      feature: "Team Challenges",
      evergo: true,
      strava: "Clubs",
      nike: "Limited",
    },
    {
      feature: "Badges & Gamification",
      evergo: true,
      strava: "Limited",
      nike: true,
    },
    {
      feature: "Free Tier",
      evergo: "Full features",
      strava: "Limited",
      nike: true,
    },
    {
      feature: "Social Feed",
      evergo: true,
      strava: true,
      nike: false,
    },
  ],
}

export function LandingComparison() {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why choose EverGo?
          </h2>
          <p className="text-lg text-gray-600">
            We combine the best features from all platforms, plus unique innovations
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <div className="min-w-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="font-semibold text-gray-900">Feature</div>
              <div className="font-semibold text-brand-blue text-center">
                EverGo
                <div className="text-xs font-normal text-gray-600 mt-1">You are here</div>
              </div>
              <div className="font-semibold text-gray-700 text-center">Strava</div>
              <div className="font-semibold text-gray-700 text-center">Nike Run Club</div>
            </div>

            {/* Rows */}
            {comparison.rows.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-4 gap-4 p-6 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <div className="font-medium text-gray-900">{row.feature}</div>
                <div className="text-center">
                  {renderCell(row.evergo, true)}
                </div>
                <div className="text-center">
                  {renderCell(row.strava)}
                </div>
                <div className="text-center">
                  {renderCell(row.nike)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 italic">
            * Comparison based on free tiers as of December 2025
          </p>
        </div>
      </div>
    </section>
  )
}

function renderCell(value: boolean | string, isEvergo = false) {
  if (value === true) {
    return (
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
        isEvergo ? "bg-brand-green/20" : "bg-green-100"
      }`}>
        <Check className={`w-5 h-5 ${isEvergo ? "text-brand-green" : "text-green-600"}`} />
      </div>
    )
  }

  if (value === false) {
    return (
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
        <X className="w-5 h-5 text-gray-400" />
      </div>
    )
  }

  return (
    <span className={`text-sm ${isEvergo ? "text-brand-blue font-semibold" : "text-gray-600"}`}>
      {value}
    </span>
  )
}
