"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createTeam } from "@/app/actions/team"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, Globe, Lock } from "lucide-react"
import { SportGlyph } from "@/components/sports/SportGlyph"

interface Sport {
  id: string
  slug: string
  name: string
  category: string
}

interface CreateTeamClientProps {
  sports: Sport[]
}

export default function CreateTeamClient({ sports }: CreateTeamClientProps) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  const [form, setForm] = React.useState({
    name: "",
    sportId: sports?.[0]?.id ?? "",
    city: "",
    country: "",
    description: "",
    isPublic: true,
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setFieldErrors({})

    const result = await createTeam(form)
    setPending(false)

    if (!result.ok) {
      setError(result.message)
      setFieldErrors(result.fieldErrors ?? {})
      return
    }

    router.push(`/teams/${result.teamSlug}`)
  }

  // Handle empty sports list
  if (sports.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No sports available</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sports need to be configured before you can create a team.
        </p>
        <Button variant="outline" onClick={() => router.push("/teams")}>
          Back to Teams
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" data-testid="create-team-form">
      {/* Global error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {/* Team Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Team Name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="e.g. Prague Runners Elite"
          data-testid="team-name-input"
          className={fieldErrors.name ? "border-destructive" : ""}
        />
        {fieldErrors.name && (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      {/* Sport Selection */}
      <div className="space-y-2">
        <Label htmlFor="sport">Sport *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sports.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => setForm((s) => ({ ...s, sportId: sport.id }))}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                form.sportId === sport.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              data-testid={`sport-option-${sport.slug}`}
            >
              <SportGlyph sport={sport} size="sm" />
              <span className="text-sm font-medium truncate">{sport.name}</span>
            </button>
          ))}
        </div>
        {fieldErrors.sportId && (
          <p className="text-xs text-destructive">{fieldErrors.sportId}</p>
        )}
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
            placeholder="Prague"
            data-testid="team-city-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={form.country}
            onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
            placeholder="Czech Republic"
            data-testid="team-country-input"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          placeholder="What is your team about? What are your goals?"
          className="min-h-[100px]"
          data-testid="team-description-input"
        />
        <p className="text-xs text-muted-foreground">
          {form.description.length}/500 characters
        </p>
      </div>

      {/* Visibility */}
      <div className="flex items-center justify-between rounded-xl border p-4">
        <div className="flex items-center gap-3">
          {form.isPublic ? (
            <Globe className="h-5 w-5 text-primary" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <div className="text-sm font-medium">
              {form.isPublic ? "Public Team" : "Private Team"}
            </div>
            <div className="text-xs text-muted-foreground">
              {form.isPublic
                ? "Anyone can discover and request to join"
                : "Only invited members can join"}
            </div>
          </div>
        </div>
        <Switch
          checked={form.isPublic}
          onCheckedChange={(v) => setForm((s) => ({ ...s, isPublic: v }))}
          data-testid="team-public-toggle"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teams")}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending} data-testid="create-team-submit">
          {pending ? "Creating..." : "Create Team"}
        </Button>
      </div>
    </form>
  )
}
