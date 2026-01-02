"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Activity, ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // TODO: Implement actual password reset logic
        // For now, just show a success message
        await new Promise(resolve => setTimeout(resolve, 1000))

        setSubmitted(true)
        toast.success("If an account exists, you'll receive a reset link")
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
                        <Activity className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Reset Password</h1>
                    <p className="text-slate-400">
                        {submitted
                            ? "Check your email for reset instructions"
                            : "Enter your email to receive a reset link"
                        }
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-slate-300 mb-4">
                                We've sent a password reset link to <strong className="text-white">{email}</strong>
                            </p>
                            <p className="text-sm text-slate-500">
                                Didn't receive it? Check your spam folder or try again.
                            </p>
                        </div>
                    )}
                </div>

                {/* Back to Login Link */}
                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 mt-8 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>
            </div>
        </div>
    )
}
