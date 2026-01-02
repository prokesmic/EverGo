"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, Loader2, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CountrySelect } from "./CountrySelect"
import { CitySelect } from "./CitySelect"
import { getCountryNameByCode } from "@/lib/location/countries"

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
    countryCode: string | null
    countryName: string | null
    cityId: string | null
    cityName: string | null
    dateOfBirth: Date | null
    gender: string | null
  }
}

interface CityValue {
  id: string
  name: string
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
    gender: user.gender || "",
  })

  // Location state - normalized
  const [countryCode, setCountryCode] = useState(user.countryCode || "")
  const [city, setCity] = useState<CityValue | null>(
    user.cityId && user.cityName
      ? { id: user.cityId, name: user.cityName }
      : null
  )

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl)
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(user.coverPhotoUrl)

  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode)
    // Clear city when country changes
    setCity(null)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image")
      return
    }

    setAvatarLoading(true)

    try {
      if (!supabase) {
        toast.error("Storage not configured")
        return
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
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
      if (!supabase) {
        toast.error("Storage not configured")
        return
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage
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
      const countryName = countryCode ? getCountryNameByCode(countryCode) : null

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Normalized location fields
          countryCode: countryCode || null,
          countryName: countryName || null,
          cityId: city?.id || null,
          cityName: city?.name || null,
          // Legacy fields for backward compatibility
          country: countryName || null,
          city: city?.name || null,
        }),
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium text-slate-700">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Your name"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="@username"
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-slate-700">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
            <p className="text-xs text-slate-500">Brief description for your profile</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Country
              </Label>
              <CountrySelect
                value={countryCode}
                onChange={handleCountryChange}
                placeholder="Select your country"
              />
              <p className="text-xs text-slate-500">Used for country rankings</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                City
              </Label>
              <CitySelect
                countryCode={countryCode}
                value={city}
                onChange={setCity}
                disabled={!countryCode}
                placeholder={countryCode ? "Select your city" : "Select country first"}
              />
              <p className="text-xs text-slate-500">Used for local rankings</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-slate-700">
              Gender
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
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
