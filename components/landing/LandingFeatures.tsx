import { Trophy, Users, TrendingUp, Zap, Target, Heart, Map, Award } from "lucide-react"

const features = [
  {
    icon: Trophy,
    title: "Real Rankings",
    description: "Compete at club, city, country, and global levels. See exactly where you stand.",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: Target,
    title: "Multi-Sport Tracking",
    description: "25+ sports in one profile. Running, cycling, swimming, tennis, golf, and more.",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Users,
    title: "Find Training Partners",
    description: "Match with athletes in your city. Train together, stay motivated.",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: Zap,
    title: "Challenges & Badges",
    description: "Join sponsored challenges. Earn badges. Get rewards from top brands.",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Track progress, identify trends, and get AI-powered training insights.",
    gradient: "from-indigo-400 to-purple-500",
  },
  {
    icon: Heart,
    title: "Social Feed",
    description: "Follow friends, like activities, and celebrate achievements together.",
    gradient: "from-red-400 to-pink-500",
  },
  {
    icon: Map,
    title: "Route Discovery",
    description: "Find popular routes near you. Save favorites. Share with the community.",
    gradient: "from-teal-400 to-green-500",
  },
  {
    icon: Award,
    title: "Teams & Communities",
    description: "Join clubs, create teams, compete together. Build your squad.",
    gradient: "from-orange-400 to-red-500",
  },
]

export function LandingFeatures() {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to
            <span className="block bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
              level up your fitness
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            From casual fitness to competitive training, EverGo has you covered
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">And much more...</p>
          <a
            href="/register"
            className="inline-flex items-center text-brand-blue font-semibold hover:text-brand-green transition-colors"
          >
            See all features →
          </a>
        </div>
      </div>
    </section>
  )
}
