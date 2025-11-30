"use client"

import { useState, useEffect } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

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
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Subscription</h1>
            <p className="text-gray-600 mb-8">Unlock the full EverGo experience</p>

            {/* Current Plan */}
            {subscription && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-blue-800">
                                Current Plan: {subscription.plan === 'FREE' ? 'Free' : 'Pro'}
                            </div>
                            {subscription.plan !== 'FREE' && (
                                <div className="text-sm text-blue-600">
                                    Renews on {format(new Date(subscription.currentPeriodEnd), 'PPP')}
                                </div>
                            )}
                        </div>
                        {subscription.plan !== 'FREE' && (
                            <Button variant="link" className="text-blue-600">
                                Manage subscription
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Plans Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Free</h2>
                    <div className="text-3xl font-bold text-gray-800 mb-4">
                        $0<span className="text-base font-normal text-gray-500">/month</span>
                    </div>

                    <ul className="space-y-3 mb-6">
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
                        className="w-full"
                    >
                        {subscription?.plan === 'FREE' ? 'Current Plan' : 'Downgrade'}
                    </Button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-xl border-2 border-blue-500 p-6 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                        Most Popular
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-2">Pro</h2>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        $9.99<span className="text-base font-normal text-gray-500">/month</span>
                    </div>
                    <div className="text-sm text-green-600 mb-4">
                        or $79.99/year (save 33%)
                    </div>

                    <ul className="space-y-3 mb-6">
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

                    <div className="space-y-2">
                        <Button
                            onClick={() => handleUpgrade('PRO')}
                            disabled={isUpgrading || subscription?.plan === 'PRO'}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {isUpgrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {subscription?.plan === 'PRO' ? 'Current Plan' : 'Upgrade Monthly'}
                        </Button>
                        <Button
                            onClick={() => handleUpgrade('PRO_ANNUAL')}
                            disabled={isUpgrading || subscription?.plan === 'PRO_ANNUAL'}
                            variant="outline"
                            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            {subscription?.plan === 'PRO_ANNUAL' ? 'Current Plan' : 'Upgrade Annually (Save 33%)'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
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
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ children, included = false }: { children: React.ReactNode, included?: boolean }) {
    return (
        <li className={`flex items-center gap-2 ${included ? 'text-gray-800' : 'text-gray-400'}`}>
            {included ? (
                <Check className="w-5 h-5 text-green-500" />
            ) : (
                <X className="w-5 h-5 text-gray-300" />
            )}
            <span>{children}</span>
        </li>
    )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{question}</h3>
            <p className="text-gray-600 text-sm">{answer}</p>
        </div>
    )
}
