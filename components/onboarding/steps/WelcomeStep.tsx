import { Zap, Trophy, Users, TrendingUp } from "lucide-react"

interface WelcomeStepProps {
  user: any
  onNext: () => void
}

export function WelcomeStep({ user, onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to EverGo, {user.displayName}! 👋
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          The #1 multi-sport social network with real rankings. Let's get you set up in just 2 minutes!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
        <FeatureCard
          icon={Trophy}
          title="Real Rankings"
          description="Compete locally and globally across all sports"
        />
        <FeatureCard
          icon={Users}
          title="Find Partners"
          description="Connect with athletes in your city"
        />
        <FeatureCard
          icon={TrendingUp}
          title="Track Progress"
          description="Log activities and see your improvement"
        />
        <FeatureCard
          icon={Zap}
          title="Challenges & Badges"
          description="Stay motivated with gamification"
        />
      </div>

      <p className="text-sm text-gray-500">
        You can skip any step and complete it later in settings
      </p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
      <Icon className="w-10 h-10 text-brand-blue mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
