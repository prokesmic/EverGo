import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    // Note: PrismaAdapter is removed because it conflicts with Credentials provider + JWT strategy
    // For OAuth providers to work, we'd need to handle user creation manually in the signIn callback
    // adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        }),
        AppleProvider({
            clientId: process.env.APPLE_ID || "",
            clientSecret: process.env.APPLE_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("[Auth] Authorize called with email:", credentials?.email)
                console.log("[Auth] Password length:", credentials?.password?.length)

                if (!credentials?.email || !credentials?.password) {
                    console.log("[Auth] Missing credentials - email:", !!credentials?.email, "password:", !!credentials?.password)
                    return null
                }

                try {
                    console.log("[Auth] Looking up user in database...")
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email.toLowerCase().trim()
                        }
                    })

                    if (!user) {
                        console.log("[Auth] User not found for email:", credentials.email)
                        return null
                    }

                    console.log("[Auth] User found:", user.id, "has password:", !!user.password)

                    if (!user.password) {
                        console.log("[Auth] User has no password (OAuth account?)")
                        return null
                    }

                    console.log("[Auth] Password hash prefix:", user.password.substring(0, 20))
                    console.log("[Auth] Comparing passwords...")
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )
                    console.log("[Auth] Password valid:", isPasswordValid)

                    if (!isPasswordValid) {
                        console.log("[Auth] Invalid password for user:", user.id)
                        return null
                    }

                    console.log("[Auth] Login successful for user:", user.id)
                    return {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        name: user.displayName,
                        image: user.avatarUrl,
                        onboardingCompleted: user.onboardingCompleted,
                    }
                } catch (error) {
                    console.error("[Auth] Error:", error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            console.log("[Auth JWT] Called with user:", user?.id, "token.sub:", token.sub, "trigger:", trigger)
            if (user) {
                token.id = user.id
                token.email = user.email ?? token.email // Explicitly preserve email
                token.username = user.username
                token.picture = user.image ?? undefined // Use image (from authorize return)
                token.onboardingCompleted = user.onboardingCompleted ?? false
            }
            // On update trigger (e.g., after completing onboarding), refresh user data
            if (trigger === "update" && token.email) {
                try {
                    const freshUser = await prisma.user.findUnique({
                        where: { email: token.email as string },
                        select: { onboardingCompleted: true }
                    })
                    if (freshUser) {
                        token.onboardingCompleted = freshUser.onboardingCompleted
                    }
                } catch (e) {
                    console.error("[Auth JWT] Error refreshing user:", e)
                }
            }
            console.log("[Auth JWT] Returning token with email:", token.email, "onboardingCompleted:", token.onboardingCompleted)
            return token
        },
        async session({ session, token }) {
            console.log("[Auth Session] Called with token.id:", token.id, "token.email:", token.email)
            if (session.user && token) {
                session.user.id = token.id as string
                session.user.email = token.email as string // Ensure email is in session
                session.user.username = token.username as string
                session.user.image = token.picture as string
                session.user.onboardingCompleted = token.onboardingCompleted as boolean
            }
            console.log("[Auth Session] Returning session with email:", session.user?.email, "onboardingCompleted:", session.user?.onboardingCompleted)
            return session
        }
    }
}
