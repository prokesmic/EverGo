"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Target, Calendar, TrendingUp } from "lucide-react"

interface GoalSettingStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export function GoalSettingStep({ formData, updateFormData }: GoalSettingStepProps) {
  const [weeklyGoal, setWeeklyGoal] = useState(formData.weeklyGoal)
  const [distanceGoal, setDistanceGoal] = useState(formData.distanceGoal)

  const handleWeeklyGoalChange = (value: number[]) => {
    setWeeklyGoal(value[0])
    updateFormData({ weeklyGoal: value[0] })
  }

  const handleDistanceGoalChange = (value: number[]) => {
    setDistanceGoal(value[0])
    updateFormData({ distanceGoal: value[0] })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Set your goals
        </h2>
        <p className="text-gray-600">
          We'll help you stay on track and celebrate your progress
        </p>
      </div>

      <div className="space-y-8 max-w-xl mx-auto">
        {/* Weekly Activity Goal */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-blue/10 rounded-lg">
              <Calendar className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <Label className="text-lg font-semibold">Weekly Activity Goal</Label>
              <p className="text-sm text-gray-600">How many workouts per week?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold text-brand-blue">{weeklyGoal}</span>
              <span className="text-sm text-gray-600">activities per week</span>
            </div>
            <Slider
              value={[weeklyGoal]}
              onValueChange={handleWeeklyGoalChange}
              min={1}
              max={7}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1/week</span>
              <span>7/week</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {weeklyGoal <= 2 && "Great for beginners! Start small and build consistency."}
              {weeklyGoal >= 3 && weeklyGoal <= 4 && "Perfect for staying active and healthy!"}
              {weeklyGoal >= 5 && weeklyGoal <= 6 && "Ambitious! You're serious about fitness."}
              {weeklyGoal === 7 && "Elite level! Make sure to include rest and recovery."}
            </p>
          </div>
        </div>

        {/* Weekly Distance Goal */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-green/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <Label className="text-lg font-semibold">Weekly Distance Goal</Label>
              <p className="text-sm text-gray-600">For running/cycling activities</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold text-brand-green">{distanceGoal} km</span>
              <span className="text-sm text-gray-600">per week</span>
            </div>
            <Slider
              value={[distanceGoal]}
              onValueChange={handleDistanceGoalChange}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {distanceGoal <= 20 && "Perfect for casual fitness and staying active!"}
              {distanceGoal > 20 && distanceGoal <= 50 && "Great for regular training and improvement."}
              {distanceGoal > 50 && "Serious athlete goals! Stay consistent and injury-free."}
            </p>
          </div>
        </div>

        {/* Goals Summary */}
        <div className="bg-gradient-to-r from-brand-blue/10 to-brand-green/10 rounded-xl p-6 border border-brand-blue/20">
          <div className="flex items-start gap-3">
            <Target className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Your Goals</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ Complete {weeklyGoal} activities per week</li>
                <li>✓ Cover {distanceGoal} km per week</li>
                <li>✓ Build a {weeklyGoal === 7 ? '7-day' : `${weeklyGoal * 7}-day`} streak</li>
              </ul>
              <p className="text-xs text-gray-600 italic pt-2">
                You can adjust these anytime in settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
