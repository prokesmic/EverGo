"use client"

import { useState, useEffect } from "react"
import { Check, X, Loader2, Crown, Zap, Star, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { GradientHeader } from "@/components/ui/frosted-card"
import { cn } from "@/lib/utils"

interface Subscription {
    plan: 'FREE' | 'PRO' | 'PRO_ANNUAL'
    status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
}

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpgrading, setIsUpgrading] = useState(false)

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await fetch('/api/subscription')
                if (res.ok) {
                    const data = await res.json()
                    setSubscription(data)
                }
            } catch (error) {
                console.error('Failed to fetch subscription', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSubscription()
    }, [])

    const handleUpgrade = async (plan: 'PRO' | 'PRO_ANNUAL') => {
        setIsUpgrading(true)
        try {
            const res = await fetch('/api/subscription/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan,
                    successUrl: `${window.location.origin}/settings/subscription?success=true`,
                    cancelUrl: `${window.location.origin}/settings/subscription`
                })
            })

            if (res.ok) {
                const { checkoutUrl } = await res.json()
                window.location.href = checkoutUrl
            }
        } catch (error) {
            console.error('Failed to start checkout', error)
            setIsUpgrading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto py-8 px-4 md:px-6">
                <GradientHeader
                    icon={<Crown className="w-6 h-6" />}
                    title="Subscription"
                    description="Unlock the full EverGo experience"
                />

                {/* Current Plan Banner */}
                {subscription && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {subscription.plan === 'FREE' ? (
                                        <Star className="w-5 h-5" />
                                    ) : (
                                        <Crown className="w-5 h-5" />
                                    )}
                                    <span className="font-bold text-lg">
                                        Current Plan: {subscription.plan === 'FREE' ? 'Free' : 'Pro'}
                                    </span>
                                </div>
                                {subscription.plan !== 'FREE' && (
                                    <div className="text-white/80 text-sm">
                                        Renews on {format(new Date(subscription.currentPeriodEnd), 'PPP')}
                                    </div>
                                )}
                            </div>
                            {subscription.plan !== 'FREE' && (
                                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                                    Manage subscription
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Plans Comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Free Plan */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-100 rounded-xl">
                                <Star className="w-6 h-6 text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Free</h2>
                        </div>

                        <div className="mb-6">
                            <span className="text-5xl font-black text-slate-900">$0</span>
                            <span className="text-slate-500 text-lg ml-2">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <FeatureItem included>Track up to 3 sports</FeatureItem>
                            <FeatureItem included>City & Country rankings</FeatureItem>
                            <FeatureItem included>Join 1 team</FeatureItem>
                            <FeatureItem included>90-day activity history</FeatureItem>
                            <FeatureItem included>Badges & challenges</FeatureItem>
                            <FeatureItem>Global rankings</FeatureItem>
                            <FeatureItem>Advanced analytics</FeatureItem>
                            <FeatureItem>Data export</FeatureItem>
                            <FeatureItem>Ad-free experience</FeatureItem>
                        </ul>

                        <Button
                            disabled
                            variant="outline"
                            className="w-full h-12 text-lg rounded-xl"
                        >
                            {subscription?.plan === 'FREE' ? 'Current Plan' : 'Downgrade'}
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-indigo-500 p-8 shadow-xl">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            Most Popular
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Pro</h2>
                        </div>

                        <div className="mb-2">
                            <span className="text-5xl font-black text-slate-900">$9.99</span>
                            <span className="text-slate-500 text-lg ml-2">/month</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-6">
                            <Zap className="w-3 h-3" />
                            or $79.99/year (save 33%)
                        </div>

                        <ul className="space-y-4 mb-8">
                            <FeatureItem included>Unlimited sports</FeatureItem>
                            <FeatureItem included>All ranking scopes</FeatureItem>
                            <FeatureItem included>Unlimited teams</FeatureItem>
                            <FeatureItem included>Full activity history</FeatureItem>
                            <FeatureItem included>All badges & challenges</FeatureItem>
                            <FeatureItem included>Global rankings</FeatureItem>
                            <FeatureItem included>Advanced analytics</FeatureItem>
                            <FeatureItem included>Data export (CSV, GPX)</FeatureItem>
                            <FeatureItem included>Ad-free experience</FeatureItem>
                            <FeatureItem included>Priority support</FeatureItem>
                        </ul>

                        <div className="space-y-3">
                            <Button
                                onClick={() => handleUpgrade('PRO')}
                                disabled={isUpgrading || subscription?.plan === 'PRO'}
                                className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/25"
                            >
                                {isUpgrading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                {subscription?.plan === 'PRO' ? 'Current Plan' : 'Upgrade Monthly'}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                onClick={() => handleUpgrade('PRO_ANNUAL')}
                                disabled={isUpgrading || subscription?.plan === 'PRO_ANNUAL'}
                                variant="outline"
                                className="w-full h-12 text-lg rounded-xl border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 font-semibold"
                            >
                                {subscription?.plan === 'PRO_ANNUAL' ? 'Current Plan' : 'Upgrade Annually (Save 33%)'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FaqItem
                            question="Can I cancel anytime?"
                            answer="Yes, you can cancel your subscription at any time. You'll continue to have Pro access until the end of your billing period."
                        />
                        <FaqItem
                            question="Is there a free trial?"
                            answer="Yes! New users get a 7-day free trial of Pro features. No credit card required."
                        />
                        <FaqItem
                            question="What payment methods do you accept?"
                            answer="We accept all major credit cards, Apple Pay, and Google Pay through our secure payment processor, Stripe."
                        />
                        <FaqItem
                            question="Can I switch between monthly and annual?"
                            answer="Yes, you can switch at any time. We'll prorate your subscription automatically."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ children, included = false }: { children: React.ReactNode, included?: boolean }) {
    return (
        <li className={cn(
            "flex items-center gap-3",
            included ? "text-slate-800" : "text-slate-400"
        )}>
            {included ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                </div>
            ) : (
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="w-3 h-3 text-slate-400" />
                </div>
            )}
            <span className="font-medium">{children}</span>
        </li>
    )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="p-5 bg-slate-50 rounded-xl">
            <h3 className="font-semibold text-slate-800 mb-2">{question}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{answer}</p>
        </div>
    )
}
