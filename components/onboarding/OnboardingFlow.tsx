"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { WelcomeStep } from "./steps/WelcomeStep"
import { SportSelectionStep } from "./steps/SportSelectionStep"
import { GoalSettingStep } from "./steps/GoalSettingStep"
import { LocationStep } from "./steps/LocationStep"
import { FollowSuggestionsStep } from "./steps/FollowSuggestionsStep"
import { CommunityStep } from "./steps/CommunityStep"
import { FirstActivityStep } from "./steps/FirstActivityStep"

interface OnboardingFlowProps {
  user: any
  sports: any[]
  suggestedUsers: any[]
  suggestedCommunities: any[]
}

const STEPS = [
  { id: "welcome", title: "Welcome", component: WelcomeStep },
  { id: "sports", title: "Choose Sports", component: SportSelectionStep },
  { id: "goals", title: "Set Goals", component: GoalSettingStep },
  { id: "location", title: "Location", component: LocationStep },
  { id: "follow", title: "Follow Athletes", component: FollowSuggestionsStep },
  { id: "communities", title: "Join Communities", component: CommunityStep },
  { id: "activity", title: "First Activity", component: FirstActivityStep },
]

export function OnboardingFlow({
  user,
  sports,
  suggestedUsers,
  suggestedCommunities,
}: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    selectedSports: [] as string[],
    weeklyGoal: 3,
    distanceGoal: 10,
    city: user.city || "",
    country: user.country || "",
    followedUsers: [] as string[],
    joinedCommunities: [] as string[],
  })

  const CurrentStepComponent = STEPS[currentStep].component
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      // Save onboarding data
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to complete onboarding")
      }

      toast.success("Welcome to EverGo!", {
        description: "Your profile is all set up!"
      })

      router.push("/home")
    } catch (error) {
      toast.error("Failed to complete onboarding", {
        description: "Please try again."
      })
    }
  }

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-white/80">{STEPS[currentStep].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[500px] flex flex-col">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          user={user}
          sports={sports}
          suggestedUsers={suggestedUsers}
          suggestedCommunities={suggestedCommunities}
          onNext={handleNext}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center mt-auto pt-6 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 && currentStep > 0 && (
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === STEPS.length - 1 ? "Finish" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
