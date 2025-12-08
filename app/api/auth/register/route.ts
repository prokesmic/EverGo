import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    console.log("Registration API called")

    try {
        const body = await req.json()
        console.log("Request body:", { email: body.email, hasPassword: !!body.password })

        const { email, password } = body

        if (!email || !password) {
            console.log("Missing fields")
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Use email as username (part before @) and displayName
        const emailPrefix = email.split("@")[0]

        console.log("Creating user in database...")
        const user = await prisma.user.create({
            data: {
                email,
                username: email, // Use full email as username for uniqueness
                password: hashedPassword,
                displayName: emailPrefix, // Use email prefix as display name
            }
        })

        console.log("User created:", user.id)
        return NextResponse.json({ user: { id: user.id, email: user.email } })
    } catch (error: any) {
        console.error("Registration error:", error?.message || error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
