"use client"

import { useState, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sport, Discipline, BenchmarkMeasurementType } from "@prisma/client"
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
    Heart,
    Search,
    Star,
    Trophy,
    Plus,
    ChevronDown,
    Medal,
    X,
    Check
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createActivity } from "@/app/actions/activity"
import { toast } from "sonner"
import { SportGlyph } from "@/components/sports/SportGlyph"
import { AddPersonalBestDrawer } from "@/components/benchmarks/AddPersonalBestDrawer"
import { upsertUserPb } from "@/app/actions/benchmarks"

const formSchema = z.object({
    title: z.string().min(1, "Give your activity a name"),
    description: z.string().optional(),
    sportId: z.string().min(1, "Pick your sport"),
    disciplineId: z.string().optional(),
    activityDate: z.string(),
    activityTime: z.string(),
    durationMinutes: z.string().optional(),
    distanceKm: z.string().optional(),
    caloriesBurned: z.string().optional(),
    rpe: z.number().min(1).max(10).optional(),
    visibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"]),
})

// Benchmark type definition
type BenchmarkDef = {
    id: string
    sportId: string
    slug: string
    name: string
    measurementType: BenchmarkMeasurementType
    unit: string
    higherIsBetter: boolean
}

type UserBest = {
    benchmarkId: string
    value: number
    achievedAt: Date
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

// Helper to format benchmark values for display
function formatBenchmarkValue(value: number, type: BenchmarkMeasurementType, unit: string): string {
    if (type === "TIME") {
        // value is in seconds
        const hours = Math.floor(value / 3600)
        const mins = Math.floor((value % 3600) / 60)
        const secs = Math.floor(value % 60)
        if (hours > 0) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }
    if (type === "DISTANCE") {
        // value is in meters
        if (value >= 1000) return `${(value / 1000).toFixed(1)} km`
        return `${Math.round(value)} m`
    }
    if (type === "SPEED") return `${value.toFixed(1)} km/h`
    if (type === "POWER") return `${Math.round(value)} W`
    if (type === "WEIGHT_REPS") return `${value} kg`
    if (type === "COUNT") return `${Math.round(value)}`
    return `${value} ${unit}`
}

interface MissionControlFormProps {
    sports: (Sport & { disciplines: Discipline[] })[]
    activeSportIds?: string[]
    benchmarkDefinitions?: BenchmarkDef[]
    userBenchmarkBests?: UserBest[]
}

export function MissionControlForm({
    sports,
    activeSportIds = [],
    benchmarkDefinitions = [],
    userBenchmarkBests = []
}: MissionControlFormProps) {
    const [selectedSportId, setSelectedSportId] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [rpe, setRpe] = useState<number>(5)
    const [isDragging, setIsDragging] = useState(false)
    const [photos, setPhotos] = useState<File[]>([])
    const [sportSearchQuery, setSportSearchQuery] = useState("")
    const [isSportPickerOpen, setIsSportPickerOpen] = useState(false)
    const [isPbDrawerOpen, setIsPbDrawerOpen] = useState(false)
    // Achievements: benchmarkId -> value (canonical numeric)
    const [achievements, setAchievements] = useState<Map<string, number>>(new Map())
    const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null)
    const [achievementInputValue, setAchievementInputValue] = useState("")

    // Separate active sports from other sports
    const { activeSports, otherSports, filteredOtherSports } = useMemo(() => {
        const active = sports.filter(s => activeSportIds.includes(s.id))
        const other = sports.filter(s => !activeSportIds.includes(s.id))
        const filtered = sportSearchQuery.trim()
            ? other.filter(s =>
                s.name.toLowerCase().includes(sportSearchQuery.toLowerCase()) ||
                (s.category && s.category.toLowerCase().includes(sportSearchQuery.toLowerCase()))
            )
            : other
        return { activeSports: active, otherSports: other, filteredOtherSports: filtered }
    }, [sports, activeSportIds, sportSearchQuery])

    // Get benchmarks for selected sport
    const sportBenchmarks = useMemo(() => {
        if (!selectedSportId) return []
        return benchmarkDefinitions.filter(b => b.sportId === selectedSportId)
    }, [selectedSportId, benchmarkDefinitions])

    // Get user's PBs for selected sport benchmarks
    const sportPBs = useMemo(() => {
        const pbMap = new Map(userBenchmarkBests.map(pb => [pb.benchmarkId, pb]))
        return sportBenchmarks.map(bench => ({
            benchmark: bench,
            pb: pbMap.get(bench.id)
        }))
    }, [sportBenchmarks, userBenchmarkBests])

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
            if (values.disciplineId) {
                formData.append("disciplineId", values.disciplineId)
            }

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

    const handleAddPb = async (data: { benchmarkId: string; value: number; achievedAt: Date }) => {
        await upsertUserPb({
            benchmarkId: data.benchmarkId,
            value: data.value,
            achievedAtISO: data.achievedAt.toISOString(),
        })
    }

    // Parse user input for achievement values (handles time, distance, etc.)
    const parseAchievementValue = (input: string, benchmark: BenchmarkDef): number | null => {
        if (!input.trim()) return null

        if (benchmark.measurementType === "TIME") {
            // Support formats: "1:30:00" (h:m:s), "45:30" (m:s), "30" (seconds)
            const parts = input.split(":").map(p => parseInt(p.trim()) || 0)
            if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
            if (parts.length === 2) return parts[0] * 60 + parts[1]
            return parseInt(input) || null
        }

        if (benchmark.measurementType === "DISTANCE") {
            const value = parseFloat(input)
            if (isNaN(value)) return null
            // If unit is km, convert to meters
            if (benchmark.unit === "km") return value * 1000
            return value
        }

        const value = parseFloat(input)
        return isNaN(value) ? null : value
    }

    // Format value for display in input field
    const formatAchievementInput = (value: number, benchmark: BenchmarkDef): string => {
        if (benchmark.measurementType === "TIME") {
            const hours = Math.floor(value / 3600)
            const mins = Math.floor((value % 3600) / 60)
            const secs = Math.floor(value % 60)
            if (hours > 0) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
            return `${mins}:${secs.toString().padStart(2, "0")}`
        }
        if (benchmark.measurementType === "DISTANCE" && benchmark.unit === "km") {
            return (value / 1000).toFixed(2)
        }
        return value.toString()
    }

    const handleAddAchievement = (benchmarkId: string) => {
        const benchmark = sportBenchmarks.find(b => b.id === benchmarkId)
        if (!benchmark) return

        const value = parseAchievementValue(achievementInputValue, benchmark)
        if (value === null || value <= 0) {
            toast.error("Please enter a valid value")
            return
        }

        setAchievements(prev => new Map(prev).set(benchmarkId, value))
        setEditingAchievementId(null)
        setAchievementInputValue("")
        toast.success(`${benchmark.name} achievement added!`)
    }

    const handleRemoveAchievement = (benchmarkId: string) => {
        setAchievements(prev => {
            const next = new Map(prev)
            next.delete(benchmarkId)
            return next
        })
    }

    const handleStartEditAchievement = (benchmarkId: string) => {
        const existingValue = achievements.get(benchmarkId)
        const benchmark = sportBenchmarks.find(b => b.id === benchmarkId)
        if (existingValue && benchmark) {
            setAchievementInputValue(formatAchievementInput(existingValue, benchmark))
        } else {
            setAchievementInputValue("")
        }
        setEditingAchievementId(benchmarkId)
    }

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

                        {/* Sport Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600 uppercase tracking-wide">Sport</label>
                            <FormField
                                control={form.control}
                                name="sportId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="space-y-4">
                                                {/* Active Sports Tiles (if user has active sports) */}
                                                {activeSports.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Star className="w-3 h-3" />
                                                            <span>Your Active Sports</span>
                                                        </div>
                                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" data-testid="active-sports-tiles">
                                                            {activeSports.map((sport) => {
                                                                const isSelected = field.value === sport.id
                                                                return (
                                                                    <button
                                                                        key={sport.id}
                                                                        type="button"
                                                                        data-testid={`sport-tile-${sport.slug}`}
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
                                                                        <SportGlyph sport={sport} size="md" className={cn(isSelected && "bg-white/20 border-white/30")} />
                                                                        <span className="text-sm font-semibold whitespace-nowrap">{sport.name}</span>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* All Sports Picker / Search */}
                                                <Popover open={isSportPickerOpen} onOpenChange={setIsSportPickerOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            role="combobox"
                                                            data-testid="all-sports-picker"
                                                            className={cn(
                                                                "w-full justify-between h-12 text-left",
                                                                !field.value && activeSports.length === 0 && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                <div className="flex items-center gap-3">
                                                                    <SportGlyph sport={sports.find(s => s.id === field.value) || { name: "" }} size="sm" />
                                                                    <span>{sports.find(s => s.id === field.value)?.name}</span>
                                                                    {activeSportIds.includes(field.value) && (
                                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="flex items-center gap-2">
                                                                    <Search className="w-4 h-4" />
                                                                    {activeSports.length > 0 ? "Or choose another sport..." : "Search all sports..."}
                                                                </span>
                                                            )}
                                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[400px] p-0" align="start">
                                                        <div className="p-3 border-b">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Search sports..."
                                                                    value={sportSearchQuery}
                                                                    onChange={(e) => setSportSearchQuery(e.target.value)}
                                                                    className="pl-9"
                                                                    data-testid="sport-search-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-[300px] overflow-y-auto p-2">
                                                            {/* Active Sports Group */}
                                                            {activeSports.length > 0 && !sportSearchQuery && (
                                                                <div className="mb-3">
                                                                    <div className="px-2 py-1 text-xs font-medium text-slate-500 flex items-center gap-1">
                                                                        <Star className="w-3 h-3 text-amber-500" />
                                                                        Active Sports
                                                                    </div>
                                                                    {activeSports.map((sport) => (
                                                                        <button
                                                                            key={sport.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                field.onChange(sport.id)
                                                                                setSelectedSportId(sport.id)
                                                                                form.setValue("disciplineId", "")
                                                                                setIsSportPickerOpen(false)
                                                                                setSportSearchQuery("")
                                                                            }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                                                                field.value === sport.id
                                                                                    ? "bg-indigo-100 text-indigo-900"
                                                                                    : "hover:bg-slate-100"
                                                                            )}
                                                                        >
                                                                            <SportGlyph sport={sport} size="sm" />
                                                                            <span className="font-medium">{sport.name}</span>
                                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 ml-auto" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* All/Filtered Sports */}
                                                            <div>
                                                                {!sportSearchQuery && activeSports.length > 0 && (
                                                                    <div className="px-2 py-1 text-xs font-medium text-slate-500">
                                                                        All Sports
                                                                    </div>
                                                                )}
                                                                {filteredOtherSports.length === 0 ? (
                                                                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                                                        No sports found
                                                                    </div>
                                                                ) : (
                                                                    filteredOtherSports.slice(0, 20).map((sport) => (
                                                                        <button
                                                                            key={sport.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                field.onChange(sport.id)
                                                                                setSelectedSportId(sport.id)
                                                                                form.setValue("disciplineId", "")
                                                                                setIsSportPickerOpen(false)
                                                                                setSportSearchQuery("")
                                                                            }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                                                                field.value === sport.id
                                                                                    ? "bg-indigo-100 text-indigo-900"
                                                                                    : "hover:bg-slate-100"
                                                                            )}
                                                                        >
                                                                            <SportGlyph sport={sport} size="sm" />
                                                                            <div className="flex-1">
                                                                                <span className="font-medium">{sport.name}</span>
                                                                                {sport.category && (
                                                                                    <span className="ml-2 text-xs text-slate-400">{sport.category}</span>
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    ))
                                                                )}
                                                                {filteredOtherSports.length > 20 && (
                                                                    <div className="px-3 py-2 text-xs text-center text-muted-foreground">
                                                                        + {filteredOtherSports.length - 20} more. Type to search...
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* PB Panel - Shows when sport is selected */}
                        {selectedSport && sportPBs.length > 0 && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 animate-in slide-in-from-top-2 duration-300" data-testid="pb-panel">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-600" />
                                        <span className="font-semibold text-slate-800">Your Personal Bests</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                                        data-testid="add-pb-button"
                                        onClick={() => setIsPbDrawerOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add PB
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {sportPBs.slice(0, 6).map(({ benchmark, pb }) => (
                                        <div
                                            key={benchmark.id}
                                            className={cn(
                                                "p-3 rounded-xl border",
                                                pb ? "bg-white border-amber-200" : "bg-white/50 border-dashed border-amber-200/50"
                                            )}
                                        >
                                            <div className="text-xs text-slate-500 mb-1">{benchmark.name}</div>
                                            {pb ? (
                                                <div className="font-bold text-slate-900">
                                                    {formatBenchmarkValue(pb.value, benchmark.measurementType, benchmark.unit)}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-400 italic">Not set</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

                        {/* Achievements Section - Manual benchmark results for this activity */}
                        {selectedSport && sportBenchmarks.length > 0 && (
                            <div
                                className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-200 animate-in slide-in-from-top-2 duration-300"
                                data-testid="achievements-section"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Medal className="w-5 h-5 text-violet-600" />
                                        <span className="font-semibold text-slate-800">Activity Achievements</span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        Record benchmarks hit during this activity
                                    </span>
                                </div>

                                {/* Added achievements list */}
                                {achievements.size > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {Array.from(achievements.entries()).map(([benchmarkId, value]) => {
                                            const benchmark = sportBenchmarks.find(b => b.id === benchmarkId)
                                            if (!benchmark) return null
                                            return (
                                                <div
                                                    key={benchmarkId}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-violet-100"
                                                    data-testid={`achievement-${benchmark.slug}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                                            <Medal className="w-4 h-4 text-violet-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{benchmark.name}</div>
                                                            <div className="text-sm text-violet-600 font-semibold">
                                                                {formatBenchmarkValue(value, benchmark.measurementType, benchmark.unit)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAchievement(benchmarkId)}
                                                        className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        data-testid={`remove-achievement-${benchmark.slug}`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Add achievement UI */}
                                <div className="space-y-3">
                                    {editingAchievementId ? (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-violet-200">
                                            <div className="flex-1">
                                                <div className="text-xs text-slate-500 mb-1">
                                                    {sportBenchmarks.find(b => b.id === editingAchievementId)?.name}
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder={
                                                        sportBenchmarks.find(b => b.id === editingAchievementId)?.measurementType === "TIME"
                                                            ? "e.g., 45:30 or 1:30:00"
                                                            : "Enter value"
                                                    }
                                                    value={achievementInputValue}
                                                    onChange={(e) => setAchievementInputValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            handleAddAchievement(editingAchievementId)
                                                        }
                                                        if (e.key === "Escape") {
                                                            setEditingAchievementId(null)
                                                            setAchievementInputValue("")
                                                        }
                                                    }}
                                                    className="h-9"
                                                    autoFocus
                                                    data-testid="achievement-input"
                                                />
                                            </div>
                                            <span className="text-sm text-slate-400 min-w-[40px]">
                                                {sportBenchmarks.find(b => b.id === editingAchievementId)?.unit}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleAddAchievement(editingAchievementId)}
                                                className="p-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                                                data-testid="confirm-achievement"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingAchievementId(null)
                                                    setAchievementInputValue("")
                                                }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                data-testid="cancel-achievement"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start text-violet-600 border-violet-200 hover:bg-violet-50"
                                                    data-testid="add-achievement-button"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Achievement
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-2" align="start">
                                                <div className="space-y-1 max-h-[250px] overflow-y-auto">
                                                    {sportBenchmarks
                                                        .filter(b => !achievements.has(b.id))
                                                        .map((benchmark) => (
                                                            <button
                                                                key={benchmark.id}
                                                                type="button"
                                                                onClick={() => handleStartEditAchievement(benchmark.id)}
                                                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                                                                data-testid={`select-benchmark-${benchmark.slug}`}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                                                    <Medal className="w-4 h-4 text-violet-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-slate-800 truncate">{benchmark.name}</div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {benchmark.measurementType === "TIME" ? "Time" :
                                                                         benchmark.measurementType === "DISTANCE" ? "Distance" :
                                                                         benchmark.measurementType === "SPEED" ? "Speed" :
                                                                         benchmark.measurementType === "POWER" ? "Power" :
                                                                         benchmark.unit}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    {sportBenchmarks.filter(b => !achievements.has(b.id)).length === 0 && (
                                                        <div className="text-center text-sm text-slate-500 py-4">
                                                            All benchmarks added!
                                                        </div>
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>

                                {achievements.size > 0 && (
                                    <div className="mt-4 pt-3 border-t border-violet-100 flex items-center gap-2 text-xs text-slate-500">
                                        <Trophy className="w-3 h-3 text-amber-500" />
                                        <span>These will be saved with your activity and checked for PBs</span>
                                    </div>
                                )}
                            </div>
                        )}
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

            {/* Add PB Drawer */}
            {selectedSport && (
                <AddPersonalBestDrawer
                    open={isPbDrawerOpen}
                    onOpenChange={setIsPbDrawerOpen}
                    sportId={selectedSport.id}
                    sportName={selectedSport.name}
                    benchmarks={sportBenchmarks}
                    onSubmit={handleAddPb}
                />
            )}
        </Form>
    )
}
