import { Zap, Trophy, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FirstActivityStepProps {
  formData: any
}

export function FirstActivityStep({ formData }: FirstActivityStepProps) {
  const completedSteps = [
    formData.selectedSports.length > 0 && "Selected your sports",
    formData.weeklyGoal > 0 && `Set weekly goal: ${formData.weeklyGoal} activities`,
    formData.city && `Location: ${formData.city}`,
    formData.followedUsers.length > 0 && `Following ${formData.followedUsers.length} athletes`,
    formData.joinedCommunities.length > 0 && `Joined ${formData.joinedCommunities.length} communities`,
  ].filter(Boolean)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-green rounded-full mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          You're all set! 🎉
        </h2>
        <p className="text-lg text-gray-600">
          Your profile is ready. Now let's log your first activity!
        </p>
      </div>

      {/* Summary of completed steps */}
      {completedSteps.length > 0 && (
        <div className="bg-gradient-to-r from-brand-blue/10 to-brand-green/10 rounded-xl p-6 border border-brand-blue/20">
          <h3 className="font-semibold text-gray-900 mb-4">Setup Complete:</h3>
          <ul className="space-y-2">
            {completedSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-5 h-5 text-brand-green flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-center mb-4">What's next?</h3>

        <div className="grid gap-4">
          <NextStepCard
            icon={Zap}
            title="Log your first activity"
            description="Track a workout and see it appear in your feed"
            href="/activity/create"
            primary
          />
          <NextStepCard
            icon={Trophy}
            title="Join a challenge"
            description="Stay motivated with goals and rewards"
            href="/challenges"
          />
          <div className="grid grid-cols-2 gap-4">
            <NextStepCard
              icon={Users}
              title="Explore teams"
              description="Find your crew"
              href="/teams"
              compact
            />
            <NextStepCard
              icon={TrendingUp}
              title="View rankings"
              description="See where you stand"
              href="/rankings"
              compact
            />
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        You can update all these settings anytime in your profile
      </div>
    </div>
  )
}

function NextStepCard({ icon: Icon, title, description, href, primary, compact }: any) {
  return (
    <Link href={href}>
      <div className={`
        group p-6 rounded-xl border-2 transition-all cursor-pointer
        ${primary
          ? 'bg-gradient-to-r from-brand-blue to-brand-green border-brand-blue text-white hover:shadow-lg'
          : 'bg-white border-gray-200 hover:border-brand-blue hover:shadow-md'
        }
        ${compact ? 'p-4' : ''}
      `}>
        <div className="flex items-start gap-4">
          <div className={`
            p-3 rounded-lg flex-shrink-0
            ${primary ? 'bg-white/20' : 'bg-brand-blue/10'}
          `}>
            <Icon className={`w-6 h-6 ${primary ? 'text-white' : 'text-brand-blue'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold mb-1 ${primary ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h4>
            {!compact && description && (
              <p className={`text-sm ${primary ? 'text-white/90' : 'text-gray-600'}`}>
                {description}
              </p>
            )}
          </div>
          <ArrowRight className={`
            w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1
            ${primary ? 'text-white' : 'text-gray-400'}
          `} />
        </div>
      </div>
    </Link>
  )
}

// Missing imports for the component
import { Users, TrendingUp } from "lucide-react"
