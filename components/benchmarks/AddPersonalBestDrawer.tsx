"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BenchmarkMeasurementType } from "@prisma/client"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Trophy, Calendar, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

// Form schema for adding a PB
const pbFormSchema = z.object({
    benchmarkId: z.string().min(1, "Select a benchmark"),
    value: z.string().min(1, "Enter a value"),
    achievedAt: z.string().min(1, "Select the date achieved"),
    // For TIME type - split into hours, minutes, seconds
    hours: z.string().optional(),
    minutes: z.string().optional(),
    seconds: z.string().optional(),
})

interface AddPersonalBestDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sportId: string
    sportName: string
    benchmarks: BenchmarkDef[]
    onSubmit: (data: {
        benchmarkId: string
        value: number
        achievedAt: Date
    }) => Promise<void>
}

export function AddPersonalBestDrawer({
    open,
    onOpenChange,
    sportId,
    sportName,
    benchmarks,
    onSubmit,
}: AddPersonalBestDrawerProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkDef | null>(null)

    const form = useForm<z.infer<typeof pbFormSchema>>({
        resolver: zodResolver(pbFormSchema),
        defaultValues: {
            benchmarkId: "",
            value: "",
            achievedAt: new Date().toISOString().split("T")[0],
            hours: "",
            minutes: "",
            seconds: "",
        },
    })

    const handleBenchmarkChange = (benchmarkId: string) => {
        const benchmark = benchmarks.find(b => b.id === benchmarkId)
        setSelectedBenchmark(benchmark || null)
        form.setValue("benchmarkId", benchmarkId)
        // Reset value fields when benchmark changes
        form.setValue("value", "")
        form.setValue("hours", "")
        form.setValue("minutes", "")
        form.setValue("seconds", "")
    }

    const getValueFromForm = (): number => {
        if (!selectedBenchmark) return 0

        if (selectedBenchmark.measurementType === "TIME") {
            const hours = parseInt(form.getValues("hours") || "0") || 0
            const minutes = parseInt(form.getValues("minutes") || "0") || 0
            const seconds = parseInt(form.getValues("seconds") || "0") || 0
            return hours * 3600 + minutes * 60 + seconds
        }

        // For distance, convert based on unit
        const rawValue = parseFloat(form.getValues("value") || "0")
        if (selectedBenchmark.measurementType === "DISTANCE") {
            // If unit is km, convert to meters
            if (selectedBenchmark.unit === "km") {
                return rawValue * 1000
            }
            return rawValue // Already in meters
        }

        return rawValue
    }

    async function handleSubmit(values: z.infer<typeof pbFormSchema>) {
        setIsSubmitting(true)
        try {
            const numericValue = getValueFromForm()

            if (numericValue <= 0) {
                toast.error("Please enter a valid value")
                return
            }

            await onSubmit({
                benchmarkId: values.benchmarkId,
                value: numericValue,
                achievedAt: new Date(values.achievedAt),
            })

            toast.success("Personal best saved!")
            form.reset()
            setSelectedBenchmark(null)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to save personal best")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Check if date is within validity window (24 months)
    const isDateValid = (date: string): { valid: boolean; isLegacy: boolean } => {
        const achievedDate = new Date(date)
        const now = new Date()
        const monthsDiff = (now.getFullYear() - achievedDate.getFullYear()) * 12 +
            (now.getMonth() - achievedDate.getMonth())

        return {
            valid: monthsDiff <= 60, // 5 years max
            isLegacy: monthsDiff > 24, // Legacy if > 2 years
        }
    }

    const dateStatus = isDateValid(form.watch("achievedAt"))

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[85vh] rounded-t-2xl"
                data-testid="add-pb-drawer"
            >
                <SheetHeader className="text-left pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <SheetTitle>Add Personal Best</SheetTitle>
                    </div>
                    <SheetDescription>
                        Record your best performance in {sportName}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="py-6 space-y-6">
                        {/* Benchmark Selection */}
                        <FormField
                            control={form.control}
                            name="benchmarkId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Benchmark</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={handleBenchmarkChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger data-testid="benchmark-select">
                                                <SelectValue placeholder="Select a benchmark..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {benchmarks.map((benchmark) => (
                                                <SelectItem key={benchmark.id} value={benchmark.id}>
                                                    {benchmark.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Value Input - Dynamic based on benchmark type */}
                        {selectedBenchmark && (
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                {selectedBenchmark.measurementType === "TIME" ? (
                                    <div className="space-y-2">
                                        <Label>Time</Label>
                                        <div className="flex gap-2 items-center">
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    max="99"
                                                    {...form.register("hours")}
                                                    data-testid="pb-hours"
                                                />
                                                <span className="text-xs text-muted-foreground mt-1 block text-center">Hours</span>
                                            </div>
                                            <span className="text-lg font-bold text-muted-foreground">:</span>
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    placeholder="00"
                                                    min="0"
                                                    max="59"
                                                    {...form.register("minutes")}
                                                    data-testid="pb-minutes"
                                                />
                                                <span className="text-xs text-muted-foreground mt-1 block text-center">Minutes</span>
                                            </div>
                                            <span className="text-lg font-bold text-muted-foreground">:</span>
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    placeholder="00"
                                                    min="0"
                                                    max="59"
                                                    {...form.register("seconds")}
                                                    data-testid="pb-seconds"
                                                />
                                                <span className="text-xs text-muted-foreground mt-1 block text-center">Seconds</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {selectedBenchmark.measurementType === "DISTANCE" ? "Distance" :
                                                        selectedBenchmark.measurementType === "SPEED" ? "Speed" :
                                                            selectedBenchmark.measurementType === "POWER" ? "Power" :
                                                                selectedBenchmark.measurementType === "WEIGHT_REPS" ? "Weight" :
                                                                    "Value"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            step={selectedBenchmark.measurementType === "DISTANCE" ? "0.01" : "1"}
                                                            placeholder="0"
                                                            {...field}
                                                            data-testid="pb-value"
                                                        />
                                                        <span className="text-sm text-muted-foreground min-w-[50px]">
                                                            {selectedBenchmark.unit}
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    {selectedBenchmark.higherIsBetter
                                                        ? "Higher is better"
                                                        : "Lower is better"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        {/* Date Achieved */}
                        <FormField
                            control={form.control}
                            name="achievedAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Date Achieved
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            max={new Date().toISOString().split("T")[0]}
                                            {...field}
                                            data-testid="pb-date"
                                        />
                                    </FormControl>
                                    {dateStatus.isLegacy && (
                                        <div className="flex items-start gap-2 text-amber-600 text-sm mt-2 p-2 bg-amber-50 rounded-lg">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>
                                                This PB is over 2 years old and will be marked as &quot;Legacy&quot;.
                                                It won&apos;t count toward your current Sport Index but will still be visible.
                                            </span>
                                        </div>
                                    )}
                                    {!dateStatus.valid && (
                                        <div className="flex items-start gap-2 text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>
                                                PBs older than 5 years cannot be recorded.
                                            </span>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <SheetFooter className="pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !dateStatus.valid}
                                className="bg-amber-500 hover:bg-amber-600"
                                data-testid="save-pb-button"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="h-4 w-4 mr-2" />
                                        Save PB
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
