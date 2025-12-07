import { UserPlus, Activity, Trophy, Users } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up in 30 seconds. Choose your sports and set your goals.",
    color: "text-brand-blue",
    bgColor: "bg-brand-blue/10",
  },
  {
    number: "02",
    icon: Activity,
    title: "Log Your Activities",
    description: "Manual entry or GPS tracking. Every workout counts toward your rankings.",
    color: "text-brand-green",
    bgColor: "bg-brand-green/10",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Compete & Improve",
    description: "See your rank locally and globally. Join challenges. Earn badges.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    number: "04",
    icon: Users,
    title: "Connect & Grow",
    description: "Follow athletes, join teams, find training partners. Get stronger together.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

export function LandingHowItWorks() {
  return (
    <section className="w-full py-20 md:py-28 bg-gray-50">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Get started in minutes
          </h2>
          <p className="text-lg text-gray-600">
            No complex setup. No learning curve. Just sign up and start tracking.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className="relative"
                >
                  {/* Connection Line (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -translate-x-8" />
                  )}

                  {/* Card */}
                  <div className="relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow h-full">
                    {/* Step Number */}
                    <div className="text-6xl font-bold text-gray-100 absolute top-4 right-4">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-xl ${step.bgColor} mb-6 relative z-10`}>
                      <Icon className={`w-8 h-8 ${step.color}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-green rounded-xl hover:shadow-xl transition-all"
          >
            Start Your Journey Free →
          </a>
          <p className="text-sm text-gray-500 mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
