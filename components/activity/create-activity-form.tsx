"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sport, Discipline } from "@prisma/client"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createActivity } from "@/app/actions/activity"
import { toast } from "sonner"

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    sportId: z.string().min(1, "Sport is required"),
    disciplineId: z.string().min(1, "Discipline is required"),
    activityDate: z.string(),
    activityTime: z.string(),
    durationMinutes: z.string().optional(), // Input as string, convert to seconds
    distanceKm: z.string().optional(), // Input as string, convert to meters
    caloriesBurned: z.string().optional(),
    visibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"]),
})

interface CreateActivityFormProps {
    sports: (Sport & { disciplines: Discipline[] })[]
}

export function CreateActivityForm({ sports }: CreateActivityFormProps) {
    const [selectedSportId, setSelectedSportId] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            visibility: "PUBLIC",
        },
    })

    const selectedSport = sports.find((s) => s.id === selectedSportId)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("title", values.title)
            formData.append("description", values.description || "")
            formData.append("sportId", values.sportId)
            formData.append("disciplineId", values.disciplineId)

            // Combine date and time
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
            toast.success("Activity created successfully!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to create activity. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Morning Run" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="sportId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sport</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value)
                                        setSelectedSportId(value)
                                        form.setValue("disciplineId", "") // Reset discipline
                                    }}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a sport" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sports.map((sport) => (
                                            <SelectItem key={sport.id} value={sport.id}>
                                                {sport.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="disciplineId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discipline</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!selectedSportId}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a discipline" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {selectedSport?.disciplines.map((discipline) => (
                                            <SelectItem key={discipline.id} value={discipline.id}>
                                                {discipline.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="activityDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="activityTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration (min)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="1" placeholder="30" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="distanceKm"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Distance (km)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="5.0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="caloriesBurned"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Calories</FormLabel>
                                <FormControl>
                                    <Input type="number" step="1" placeholder="300" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="How did it go?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PUBLIC">Public</SelectItem>
                                    <SelectItem value="FOLLOWERS_ONLY">Followers Only</SelectItem>
                                    <SelectItem value="PRIVATE">Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Activity"}
                </Button>
            </form>
        </Form>
    )
}
