import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
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

                if (!credentials?.email || !credentials?.password) {
                    console.log("[Auth] Missing credentials")
                    return null
                }

                try {
                    console.log("[Auth] Looking up user...")
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    })

                    if (!user) {
                        console.log("[Auth] User not found")
                        return null
                    }

                    if (!user.password) {
                        console.log("[Auth] User has no password (OAuth account?)")
                        return null
                    }

                    console.log("[Auth] Comparing passwords...")
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    if (!isPasswordValid) {
                        console.log("[Auth] Invalid password")
                        return null
                    }

                    console.log("[Auth] Login successful for user:", user.id)
                    return {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        name: user.displayName,
                        image: user.avatarUrl,
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = user.username
                token.picture = user.avatarUrl
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id
                session.user.username = token.username
                session.user.image = token.picture
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
