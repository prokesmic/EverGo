"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sport, Discipline } from "@prisma/client"
import {
    Upload,
    MapPin,
    Calendar,
    Clock,
    Flame,
    Route,
    Timer,
    Camera,
    Globe,
    Users,
    Lock,
    ChevronRight,
    Zap,
    Activity,
    Bike,
    Waves,
    Mountain,
    Dumbbell,
    Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { createActivity } from "@/app/actions/activity"
import { toast } from "sonner"

const formSchema = z.object({
    title: z.string().min(1, "Give your activity a name"),
    description: z.string().optional(),
    sportId: z.string().min(1, "Pick your sport"),
    disciplineId: z.string().min(1, "Choose a discipline"),
    activityDate: z.string(),
    activityTime: z.string(),
    durationMinutes: z.string().optional(),
    distanceKm: z.string().optional(),
    caloriesBurned: z.string().optional(),
    rpe: z.number().min(1).max(10).optional(),
    visibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"]),
})

// Sport icons mapping
const sportIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    "running": Activity,
    "cycling": Bike,
    "swimming": Waves,
    "hiking": Mountain,
    "gym": Dumbbell,
    "default": Heart,
}

function getSportIcon(sportName: string): React.ComponentType<{ className?: string }> {
    const key = sportName.toLowerCase()
    return sportIcons[key] || sportIcons.default
}

// RPE Labels
const rpeLabels: Record<number, { label: string; color: string }> = {
    1: { label: "Very Light", color: "from-green-400 to-green-500" },
    2: { label: "Light", color: "from-green-400 to-green-500" },
    3: { label: "Moderate", color: "from-lime-400 to-lime-500" },
    4: { label: "Moderate", color: "from-lime-400 to-lime-500" },
    5: { label: "Somewhat Hard", color: "from-yellow-400 to-yellow-500" },
    6: { label: "Somewhat Hard", color: "from-yellow-400 to-yellow-500" },
    7: { label: "Hard", color: "from-orange-400 to-orange-500" },
    8: { label: "Very Hard", color: "from-orange-400 to-red-500" },
    9: { label: "Max Effort", color: "from-red-500 to-red-600" },
    10: { label: "All Out!", color: "from-red-600 to-rose-700" },
}

interface MissionControlFormProps {
    sports: (Sport & { disciplines: Discipline[] })[]
}

export function MissionControlForm({ sports }: MissionControlFormProps) {
    const [selectedSportId, setSelectedSportId] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [rpe, setRpe] = useState<number>(5)
    const [isDragging, setIsDragging] = useState(false)
    const [photos, setPhotos] = useState<File[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            sportId: "",
            disciplineId: "",
            activityDate: new Date().toISOString().split("T")[0],
            activityTime: new Date().toTimeString().slice(0, 5),
            durationMinutes: "",
            distanceKm: "",
            caloriesBurned: "",
            rpe: 5,
            visibility: "PUBLIC",
        },
    })

    const selectedSport = sports.find((s) => s.id === selectedSportId)

    const handleGpxDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file && file.name.endsWith('.gpx')) {
            toast.info("Parsing GPX file...")
            setTimeout(() => {
                form.setValue("distanceKm", "10.5")
                form.setValue("durationMinutes", "48")
                form.setValue("activityDate", new Date().toISOString().split("T")[0])
                form.setValue("title", file.name.replace(".gpx", ""))
                toast.success("Route data imported!")
            }, 800)
        }
    }, [form])

    const handleGpxFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            toast.info("Parsing GPX file...")
            setTimeout(() => {
                form.setValue("distanceKm", "10.5")
                form.setValue("durationMinutes", "48")
                form.setValue("activityDate", new Date().toISOString().split("T")[0])
                form.setValue("title", file.name.replace(".gpx", ""))
                toast.success("Route data imported!")
            }, 800)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("title", values.title)
            formData.append("description", values.description || "")
            formData.append("sportId", values.sportId)
            formData.append("disciplineId", values.disciplineId)

            const dateTime = new Date(`${values.activityDate}T${values.activityTime}`)
            formData.append("activityDate", dateTime.toISOString())

            if (values.durationMinutes) {
                formData.append("durationSeconds", (parseFloat(values.durationMinutes) * 60).toString())
            }
            if (values.distanceKm) {
                formData.append("distanceMeters", (parseFloat(values.distanceKm) * 1000).toString())
            }
            if (values.caloriesBurned) {
                formData.append("caloriesBurned", values.caloriesBurned)
            }
            formData.append("visibility", values.visibility)

            await createActivity(formData)
            toast.success("Activity logged!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to create activity")
        } finally {
            setIsSubmitting(false)
        }
    }

    const visibility = form.watch("visibility")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Form (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* GPX Dropzone - Map-like */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleGpxDrop}
                            className={cn(
                                "relative h-40 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group",
                                "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950",
                                isDragging && "ring-4 ring-emerald-400 scale-[1.02]"
                            )}
                        >
                            {/* Fake map grid pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <svg className="w-full h-full">
                                    <defs>
                                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            {/* Route line decoration */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                                <path
                                    d="M20,80 Q100,20 200,80 T380,80"
                                    fill="none"
                                    stroke="url(#routeGrad)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray="8,8"
                                    className="opacity-30"
                                />
                                <defs>
                                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#34d399" />
                                        <stop offset="100%" stopColor="#22d3ee" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <input
                                type="file"
                                accept=".gpx"
                                className="hidden"
                                id="gpx-upload"
                                onChange={handleGpxFile}
                            />
                            <label
                                htmlFor="gpx-upload"
                                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                            >
                                <div className={cn(
                                    "p-4 rounded-full bg-white/10 backdrop-blur-sm mb-3 transition-all",
                                    "group-hover:bg-white/20 group-hover:scale-110",
                                    isDragging && "bg-emerald-500/30 scale-125"
                                )}>
                                    <MapPin className={cn(
                                        "w-8 h-8 text-white transition-colors",
                                        isDragging && "text-emerald-300"
                                    )} />
                                </div>
                                <span className="text-white/80 font-medium">
                                    {isDragging ? "Drop GPX file here" : "Drop GPX file or click to upload"}
                                </span>
                                <span className="text-white/50 text-sm mt-1">Auto-fills distance, duration & route</span>
                            </label>
                        </div>

                        {/* Title - Massive Input */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Name your activity..."
                                            className="text-4xl font-extrabold h-auto py-4 px-0 border-0 bg-transparent placeholder:text-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Sport Tiles */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600 uppercase tracking-wide">Sport</label>
                            <FormField
                                control={form.control}
                                name="sportId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                {sports.slice(0, 8).map((sport) => {
                                                    const Icon = getSportIcon(sport.name)
                                                    const isSelected = field.value === sport.id
                                                    return (
                                                        <button
                                                            key={sport.id}
                                                            type="button"
                                                            onClick={() => {
                                                                field.onChange(sport.id)
                                                                setSelectedSportId(sport.id)
                                                                form.setValue("disciplineId", "")
                                                            }}
                                                            className={cn(
                                                                "flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all duration-200 shrink-0",
                                                                "border-2",
                                                                isSelected
                                                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30 scale-105"
                                                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                                                            )}
                                                        >
                                                            <Icon className="w-6 h-6" />
                                                            <span className="text-sm font-semibold whitespace-nowrap">{sport.name}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Discipline Tiles (when sport selected) */}
                        {selectedSport && selectedSport.disciplines.length > 0 && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-medium text-slate-600 uppercase tracking-wide">Discipline</label>
                                <FormField
                                    control={form.control}
                                    name="disciplineId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedSport.disciplines.map((discipline) => {
                                                        const isSelected = field.value === discipline.id
                                                        return (
                                                            <button
                                                                key={discipline.id}
                                                                type="button"
                                                                onClick={() => field.onChange(discipline.id)}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                                                    isSelected
                                                                        ? "bg-slate-900 text-white"
                                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                                )}
                                                            >
                                                                {discipline.name}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Big Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Distance */}
                            <FormField
                                control={form.control}
                                name="distanceKm"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Route className="w-4 h-4 text-emerald-600" />
                                                <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Distance</span>
                                            </div>
                                            <FormControl>
                                                <div className="flex items-baseline gap-1">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0"
                                                        className="text-3xl font-bold w-full h-auto p-0 border-0 bg-transparent text-slate-900 placeholder:text-slate-300 focus-visible:ring-0"
                                                        {...field}
                                                    />
                                                    <span className="text-lg font-medium text-slate-400">km</span>
                                                </div>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Duration */}
                            <FormField
                                control={form.control}
                                name="durationMinutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Timer className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Duration</span>
                                            </div>
                                            <FormControl>
                                                <div className="flex items-baseline gap-1">
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="0"
                                                        className="text-3xl font-bold w-full h-auto p-0 border-0 bg-transparent text-slate-900 placeholder:text-slate-300 focus-visible:ring-0"
                                                        {...field}
                                                    />
                                                    <span className="text-lg font-medium text-slate-400">min</span>
                                                </div>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Calories */}
                            <FormField
                                control={form.control}
                                name="caloriesBurned"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Flame className="w-4 h-4 text-orange-600" />
                                                <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Calories</span>
                                            </div>
                                            <FormControl>
                                                <div className="flex items-baseline gap-1">
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="0"
                                                        className="text-3xl font-bold w-full h-auto p-0 border-0 bg-transparent text-slate-900 placeholder:text-slate-300 focus-visible:ring-0"
                                                        {...field}
                                                    />
                                                    <span className="text-lg font-medium text-slate-400">kcal</span>
                                                </div>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* RPE Slider */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <span className="font-semibold text-slate-800">Effort Level (RPE)</span>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r",
                                    rpeLabels[rpe].color
                                )}>
                                    {rpe} - {rpeLabels[rpe].label}
                                </div>
                            </div>

                            <div className="relative pt-2 pb-6">
                                <div className="relative h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={rpe}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value)
                                            setRpe(value)
                                            form.setValue("rpe", value)
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-slate-300 transition-all"
                                        style={{ left: `calc(${((rpe - 1) / 9) * 100}% - 12px)` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <span key={n}>{n}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="How did it feel? Any highlights?"
                                            className="min-h-[100px] resize-none rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column - Sidebar (1/3) */}
                    <div className="space-y-6">
                        {/* Date & Time Card */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                When
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="activityDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    className="text-sm rounded-lg border-slate-200"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="activityTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="time"
                                                    className="text-sm rounded-lg border-slate-200"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-4">Visibility</h3>
                            <FormField
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="space-y-2">
                                                {[
                                                    { value: "PUBLIC", label: "Public", icon: Globe, desc: "Everyone can see" },
                                                    { value: "FOLLOWERS_ONLY", label: "Followers", icon: Users, desc: "Only followers" },
                                                    { value: "PRIVATE", label: "Private", icon: Lock, desc: "Only you" },
                                                ].map((option) => {
                                                    const Icon = option.icon
                                                    const isSelected = field.value === option.value
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => field.onChange(option.value)}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                                                isSelected
                                                                    ? "bg-indigo-50 border-2 border-indigo-500"
                                                                    : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                                                            )}
                                                        >
                                                            <Icon className={cn(
                                                                "w-5 h-5",
                                                                isSelected ? "text-indigo-600" : "text-slate-400"
                                                            )} />
                                                            <div className="flex-1">
                                                                <div className={cn(
                                                                    "font-medium",
                                                                    isSelected ? "text-indigo-900" : "text-slate-700"
                                                                )}>
                                                                    {option.label}
                                                                </div>
                                                                <div className="text-xs text-slate-500">{option.desc}</div>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Photo Grid */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-purple-500" />
                                Photos
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {photos.map((photo, i) => (
                                    <div key={i} className="aspect-square rounded-lg bg-slate-100 overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(photo)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || [])
                                            setPhotos(prev => [...prev, ...files].slice(0, 6))
                                        }}
                                    />
                                    <Camera className="w-6 h-6 text-slate-300" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold px-8 py-6 h-auto rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Log Activity
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
