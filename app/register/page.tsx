"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Activity, ChevronRight, Mail, Lock, Check, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success("Account created successfully")
                router.push("/login")
            } else {
                toast.error(data.error || "Registration failed")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Password strength indicators
    const passwordChecks = [
        { label: "At least 6 characters", met: formData.password.length >= 6 },
        { label: "Passwords match", met: formData.password && formData.password === formData.confirmPassword },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
                        <Activity className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Join EverGo</h1>
                    <p className="text-slate-400">Start your athletic journey today</p>
                </div>

                {/* Benefits */}
                <div className="flex justify-center gap-4 mb-8">
                    {["Track Progress", "Compete", "Connect"].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-1.5 text-sm text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {benefit}
                        </div>
                    ))}
                </div>

                {/* Register Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Password Strength */}
                        {formData.password && (
                            <div className="space-y-2">
                                {passwordChecks.map((check) => (
                                    <div key={check.label} className="flex items-center gap-2 text-sm">
                                        <div className={cn(
                                            "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                                            check.met ? "bg-emerald-500" : "bg-white/10"
                                        )}>
                                            {check.met && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={check.met ? "text-emerald-400" : "text-slate-500"}>
                                            {check.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-slate-500 text-center">
                            By creating an account, you agree to our{" "}
                            <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>
                        </p>
                    </form>
                </div>

                {/* Sign In Link */}
                <p className="text-center mt-8 text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
