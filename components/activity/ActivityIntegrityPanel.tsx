"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ActivityIntegrityPanelProps {
  activityId: string
}

type Confidence = {
  score: number
  band: string
  checks: Array<{ label: string; status: "PASS" | "WARN" | "FAIL" }>
}

type Story = {
  headline: string
  summary: string
  talkingPoints: string[]
  coachTakeaway: string
  shareCaption: string
}

export function ActivityIntegrityPanel({ activityId }: ActivityIntegrityPanelProps) {
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [story, setStory] = useState<Story | null>(null)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [confidenceRes, storyRes] = await Promise.all([
        fetch(`/api/activities/${activityId}/confidence`),
        fetch(`/api/activities/${activityId}/story`),
      ])
      if (!mounted) return
      if (confidenceRes.ok) {
        const data = await confidenceRes.json()
        setConfidence(data.confidence)
      }
      if (storyRes.ok) {
        const data = await storyRes.json()
        setStory(data.story)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [activityId])

  const submitDispute = async () => {
    if (reason.trim().length < 4) {
      toast.error("Provide a short reason before submitting")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/activities/${activityId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Integrity concern",
          note: reason.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Unable to submit dispute")
      }
      toast.success("Dispute submitted for review")
      setReason("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit dispute")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Trust & Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black">{confidence?.score ?? 0}%</div>
          <div className="text-sm text-muted-foreground mt-1">{confidence?.band ?? "Unknown"}</div>
          <div className="mt-3 space-y-2">
            {(confidence?.checks ?? []).slice(0, 4).map((check) => (
              <div key={check.label} className="rounded-lg border border-border-light px-3 py-2 text-sm">
                <span className="font-semibold">{check.status}</span> • {check.label}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Dispute Flow</div>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe what looks wrong (pace, route jump, impossible effort, etc.)"
              className="mt-2 bg-white"
              rows={3}
            />
            <Button
              className="mt-2 w-full"
              variant="outline"
              onClick={submitDispute}
              disabled={isSubmitting}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Integrity Dispute"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Performance Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-lg font-semibold">{story?.headline ?? "Loading story..."}</div>
            <p className="text-sm text-muted-foreground mt-1">{story?.summary}</p>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {(story?.talkingPoints ?? []).slice(0, 3).map((point) => (
              <li key={point} className="rounded-lg border border-border-light px-3 py-2">
                {point}
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
            {story?.coachTakeaway}
          </div>
          <div className="rounded-lg border border-border-light px-3 py-2 text-xs text-muted-foreground">
            Share caption: <span className="font-medium text-foreground">{story?.shareCaption}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
