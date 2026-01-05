"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { OnboardingData } from "@/schemas/onboarding"

export type OnboardingStep = 1 | 2 | 3 | 4

export interface OnboardingState {
  // Current step
  currentStep: OnboardingStep

  // Form data matching OnboardingData schema
  displayName: string
  bio: string
  gender: string | undefined
  countryCode: string
  countryName: string
  cityId: string
  cityName: string
  primarySportId: string
  otherSportIds: string[]
  initialBenchmark:
    | {
        benchmarkId: string
        disciplineSlug: string
        rawInput: string
        value: number
        unit: string
        occurredAt?: string
      }
    | undefined
  connectProvider: "STRAVA" | "GARMIN" | "SKIP"

  // Actions
  setStep: (step: OnboardingStep) => void
  nextStep: () => void
  prevStep: () => void
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void
  setFields: (fields: Partial<OnboardingState>) => void
  reset: () => void
  getData: () => Partial<OnboardingData>
}

const initialState = {
  currentStep: 1 as OnboardingStep,
  displayName: "",
  bio: "",
  gender: undefined as string | undefined,
  countryCode: "",
  countryName: "",
  cityId: "",
  cityName: "",
  primarySportId: "",
  otherSportIds: [] as string[],
  initialBenchmark: undefined as OnboardingState["initialBenchmark"],
  connectProvider: "SKIP" as const,
}

// Helper to sanitize persisted data (in case of corrupted localStorage)
function sanitizePersistedData(data: Record<string, unknown>): Partial<OnboardingState> {
  const sanitized: Partial<OnboardingState> = {}

  // Only copy over primitive strings
  if (typeof data.displayName === "string") sanitized.displayName = data.displayName
  if (typeof data.bio === "string") sanitized.bio = data.bio
  if (typeof data.gender === "string") sanitized.gender = data.gender
  if (typeof data.countryCode === "string") sanitized.countryCode = data.countryCode
  if (typeof data.countryName === "string") sanitized.countryName = data.countryName
  if (typeof data.cityId === "string") sanitized.cityId = data.cityId
  if (typeof data.cityName === "string") sanitized.cityName = data.cityName
  if (typeof data.primarySportId === "string") sanitized.primarySportId = data.primarySportId

  // Validate arrays
  if (Array.isArray(data.otherSportIds) && data.otherSportIds.every((id) => typeof id === "string")) {
    sanitized.otherSportIds = data.otherSportIds as string[]
  }

  // Validate connect provider
  if (data.connectProvider === "STRAVA" || data.connectProvider === "GARMIN" || data.connectProvider === "SKIP") {
    sanitized.connectProvider = data.connectProvider
  }

  // Validate initialBenchmark structure
  if (data.initialBenchmark && typeof data.initialBenchmark === "object") {
    const bench = data.initialBenchmark as Record<string, unknown>
    if (
      typeof bench.benchmarkId === "string" &&
      typeof bench.disciplineSlug === "string" &&
      typeof bench.rawInput === "string" &&
      typeof bench.value === "number" &&
      typeof bench.unit === "string"
    ) {
      sanitized.initialBenchmark = {
        benchmarkId: bench.benchmarkId,
        disciplineSlug: bench.disciplineSlug,
        rawInput: bench.rawInput,
        value: bench.value,
        unit: bench.unit,
        occurredAt: typeof bench.occurredAt === "string" ? bench.occurredAt : undefined,
      }
    }
  }

  return sanitized
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4) as OnboardingStep,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1) as OnboardingStep,
        })),

      setField: (key, value) => set({ [key]: value }),

      setFields: (fields) => set(fields),

      reset: () => set(initialState),

      getData: () => {
        const state = get()
        return {
          displayName: state.displayName,
          bio: state.bio || undefined,
          gender: state.gender as any,
          countryCode: state.countryCode,
          countryName: state.countryName,
          cityId: state.cityId,
          cityName: state.cityName,
          primarySportId: state.primarySportId,
          otherSportIds: state.otherSportIds,
          initialBenchmark: state.initialBenchmark,
          connectProvider: state.connectProvider,
        }
      },
    }),
    {
      name: "evergo-onboarding",
      // Only persist form data, not step (so user resumes from beginning but with data)
      partialize: (state) => ({
        displayName: state.displayName,
        bio: state.bio,
        gender: state.gender,
        countryCode: state.countryCode,
        countryName: state.countryName,
        cityId: state.cityId,
        cityName: state.cityName,
        primarySportId: state.primarySportId,
        otherSportIds: state.otherSportIds,
        initialBenchmark: state.initialBenchmark,
        connectProvider: state.connectProvider,
      }),
      // Sanitize persisted data to prevent corrupted localStorage from breaking the app
      merge: (persistedState, currentState) => {
        const sanitized = sanitizePersistedData(
          (persistedState as Record<string, unknown>) || {}
        )
        return {
          ...currentState,
          ...sanitized,
        }
      },
    }
  )
)
