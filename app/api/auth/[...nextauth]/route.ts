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
                console.log("Authorize called with:", { email: credentials?.email })

                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials")
                    return null
                }

                try {
                    // Debug: Check file system
                    const fs = require('fs')
                    const path = require('path')
                    console.log("CWD:", process.cwd())
                    console.log("Files in root:", fs.readdirSync(process.cwd()))
                    if (fs.existsSync(path.join(process.cwd(), 'prisma'))) {
                        console.log("Files in prisma:", fs.readdirSync(path.join(process.cwd(), 'prisma')))
                    } else {
                        console.log("prisma directory not found")
                    }

                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    })

                    console.log("User found:", user ? "Yes" : "No")

                    if (!user || !user.password) {
                        console.log("User not found or no password")
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    console.log("Password valid:", isPasswordValid)

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        name: user.displayName,
                        image: user.avatarUrl,
                    }
                } catch (error) {
                    console.error("Auth error:", error)
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
