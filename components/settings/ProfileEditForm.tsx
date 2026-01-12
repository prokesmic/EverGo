"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Star, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSportThumbImage } from "@/lib/sports/media"

interface Sport {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface ProfileEditFormProps {
  initialData: {
    displayName: string
    username: string
    bio: string
    city: string
    country: string
    avatarUrl: string
    coverPhotoUrl: string
    primarySportId: string
  }
  sports: Sport[]
}

export function ProfileEditForm({ initialData, sports }: ProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }

      toast.success("Profile updated successfully")

      // Refresh the page data
      router.refresh()

      // Navigate back to profile
      if (formData.username) {
        router.push(`/profile/${formData.username}`)
      } else {
        router.push("/profile/me")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Your display name"
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="username"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            This will be your profile URL: /profile/{formData.username || "username"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={3}
            className="bg-background"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Location</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Your city"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Your country"
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {/* Primary Sport Selection */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">Primary Sport</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Your primary sport determines your hero banner image and is shown on your profile.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sports.map((sport) => {
            const isSelected = formData.primarySportId === sport.id
            const sportThumb = getSportThumbImage(sport.slug ?? sport.name)

            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, primarySportId: sport.id }))}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border bg-background"
                )}
              >
                {sportThumb && (
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={sportThumb}
                      alt={sport.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className={cn(
                  "font-medium text-sm text-left",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {sport.name}
                </span>
                {isSelected && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
              </button>
            )
          })}
        </div>

        {formData.primarySportId && (
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, primarySportId: "" }))}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
