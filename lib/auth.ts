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
                email: { label: "Email or username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const identifier = credentials.email.trim()
                    const normalizedIdentifier = identifier.toLowerCase()
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                {
                                    email: {
                                        equals: normalizedIdentifier,
                                        mode: "insensitive"
                                    }
                                },
                                {
                                    username: {
                                        equals: identifier,
                                        mode: "insensitive"
                                    }
                                }
                            ]
                        }
                    })

                    if (!user) {
                        return null
                    }

                    if (!user.password) {
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        name: user.displayName,
                        image: user.avatarUrl,
                        onboardingCompleted: user.onboardingCompleted,
                    }
                } catch (error) {
                    console.error("[Auth] Credentials authorize error:", error)
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
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
                session.user.email = token.email as string // Ensure email is in session
                session.user.username = token.username as string
                session.user.image = token.picture as string
                session.user.onboardingCompleted = token.onboardingCompleted as boolean
            }
            return session
        }
    }
}
