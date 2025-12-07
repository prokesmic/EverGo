"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Loader2, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProfileSettingsProps {
  user: {
    id: string
    displayName: string | null
    username: string | null
    email: string | null
    bio: string | null
    avatarUrl: string | null
    coverPhotoUrl: string | null
    city: string | null
    country: string | null
    birthDate: Date | null
    gender: string | null
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [coverLoading, setCoverLoading] = useState(false)

  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    username: user.username || "",
    bio: user.bio || "",
    city: user.city || "",
    country: user.country || "",
    gender: user.gender || "",
  })

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl)
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(user.coverPhotoUrl)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image")
      return
    }

    setAvatarLoading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Update database
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      setAvatarUrl(publicUrl)
      toast.success("Profile photo updated!")
      router.refresh()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload photo. Please try again.")
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image")
      return
    }

    setCoverLoading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhotoUrl: publicUrl }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      setCoverPhotoUrl(publicUrl)
      toast.success("Cover photo updated!")
      router.refresh()
    } catch (error) {
      console.error("Error uploading cover:", error)
      toast.error("Failed to upload photo. Please try again.")
    } finally {
      setCoverLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      toast.success("Profile updated successfully!")
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const initials = formData.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-48 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg overflow-hidden">
            {coverPhotoUrl && (
              <img
                src={coverPhotoUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <label
              htmlFor="cover-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer"
            >
              {coverLoading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <div className="text-center text-white">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">Change Cover Photo</span>
                </div>
              )}
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={coverLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={avatarUrl || undefined} alt={formData.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-primary/90 transition-colors shadow-lg"
              >
                {avatarLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={avatarLoading}
              />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                {formData.displayName || "Your Name"}
              </h3>
              <p className="text-sm text-text-muted mb-3">
                Click the camera icon to upload a new photo
              </p>
              <p className="text-xs text-text-muted">
                Recommended: Square image, at least 200x200px, max 5MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="@username"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Prague"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Czech Republic"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="NON_BINARY">Non-binary</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
