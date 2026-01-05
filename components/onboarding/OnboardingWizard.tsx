"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useOnboardingStore, type OnboardingStep } from "@/lib/onboarding/store"
import { completeOnboarding } from "@/lib/onboarding/actions"
import { Step1Identity } from "./steps/Step1Identity"
import { Step2Sports } from "./steps/Step2Sports"
import { Step3Benchmark } from "./steps/Step3Benchmark"
import { Step4Sync } from "./steps/Step4Sync"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  User,
  Dumbbell,
  Target,
  Link2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { SportTag } from "@/lib/onboarding/sportsCatalog"

// Serializable sport type (without icon) for passing from server to client
export interface CatalogSportWithId {
  slug: string
  label: string
  category: string
  tags?: SportTag[]
  id: string
  dbName: string
}

interface BenchmarkDefinition {
  id: string
  slug: string
  name: string
  unit: string
  higherIsBetter: boolean
}

interface OnboardingWizardProps {
  sports: CatalogSportWithId[]
  benchmarks: BenchmarkDefinition[]
  initialData?: {
    displayName?: string
    bio?: string
    gender?: string
    countryCode?: string
    countryName?: string
    cityId?: string
    cityName?: string
    primarySportId?: string
    otherSportIds?: string[]
  }
}

const STEPS = [
  { id: 1, title: "Identity", icon: User, description: "About you" },
  { id: 2, title: "Sports", icon: Dumbbell, description: "Your activities" },
  { id: 3, title: "Benchmark", icon: Target, description: "Get ranked" },
  { id: 4, title: "Sync", icon: Link2, description: "Connect apps" },
]

export function OnboardingWizard({
  sports,
  benchmarks,
  initialData,
}: OnboardingWizardProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const store = useOnboardingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Initialize store with server data if available
  useEffect(() => {
    if (initialData) {
      store.setFields({
        displayName: initialData.displayName || "",
        bio: initialData.bio || "",
        gender: initialData.gender,
        countryCode: initialData.countryCode || "",
        countryName: initialData.countryName || "",
        cityId: initialData.cityId || "",
        cityName: initialData.cityName || "",
        primarySportId: initialData.primarySportId || "",
        otherSportIds: initialData.otherSportIds || [],
      })
    }
    setHydrated(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const progress = (store.currentStep / STEPS.length) * 100

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          store.displayName.trim().length >= 2 &&
          store.countryCode.length === 2 &&
          store.cityId.length > 0
        )
      case 2:
        return store.primarySportId.length > 0
      case 3:
        // Benchmark is optional
        return true
      case 4:
        // Sync is optional
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (store.currentStep < STEPS.length) {
      store.nextStep()
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    store.prevStep()
  }

  const handleComplete = async () => {
    setIsSubmitting(true)

    try {
      const data = store.getData()
      const result = await completeOnboarding(data)

      // Check for error response
      if (result?.ok === false) {
        toast.error(result.error || "Failed to complete onboarding", {
          description: result.fieldErrors
            ? Object.values(result.fieldErrors).flat().join(", ")
            : undefined,
        })
        setIsSubmitting(false)
        return
      }

      // Success! Update the NextAuth session to refresh the JWT token
      // This is critical to avoid redirect loops (middleware checks JWT, not DB)
      await updateSession()

      // Clear local storage
      store.reset()

      toast.success("Welcome to EverGo!", {
        description: "Your profile is set up. Let's see your rankings!",
      })

      // Navigate to home
      router.push("/home")
    } catch (error: unknown) {
      console.error("Onboarding error:", error)
      toast.error("Something went wrong", {
        description: "Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  // Prevent hydration mismatch
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  const currentStepData = STEPS[store.currentStep - 1]
  const canProceed = isStepValid(store.currentStep)
  const isLastStep = store.currentStep === STEPS.length

  return (
    <section className="w-full max-w-2xl">
      {/* Step Indicators */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = store.currentStep > step.id
            const isCurrent = store.currentStep === step.id

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() =>
                    isCompleted && store.setStep(step.id as OnboardingStep)
                  }
                  disabled={!isCompleted}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    isCompleted && "cursor-pointer hover:opacity-80",
                    !isCompleted && !isCurrent && "opacity-40"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isCompleted && "bg-green-500 text-white",
                      isCurrent &&
                        "bg-white text-violet-600 ring-4 ring-white/30",
                      !isCompleted && !isCurrent && "bg-white/20 text-white/70"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block",
                      isCurrent ? "text-white" : "text-white/70"
                    )}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 min-w-[40px]",
                      store.currentStep > step.id
                        ? "bg-green-500"
                        : "bg-white/20"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 bg-white/20" />
      </div>

      {/* Step Content Card */}
      <div className="rounded-3xl bg-white/90 shadow-xl ring-1 ring-black/5 backdrop-blur">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          {/* Step content */}
          <div className="min-h-[400px]">
            {store.currentStep === 1 && <Step1Identity />}
            {store.currentStep === 2 && <Step2Sports sports={sports} />}
            {store.currentStep === 3 && (
              <Step3Benchmark sports={sports} benchmarks={benchmarks} />
            )}
            {store.currentStep === 4 && <Step4Sync />}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-black/5 px-6 py-4 sm:px-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={store.currentStep === 1 || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {/* Step indicator for mobile */}
            <span className="text-sm text-gray-500 sm:hidden">
              {store.currentStep} / {STEPS.length}
            </span>

            <Button
              onClick={isLastStep ? handleComplete : handleNext}
              disabled={!canProceed || isSubmitting}
              className={cn(
                "gap-2 min-w-[140px]",
                isLastStep && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
