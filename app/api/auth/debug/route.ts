import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        console.log("[Debug Auth] Testing login for:", email)

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        })

        if (!user) {
            return NextResponse.json({
                success: false,
                step: "user_lookup",
                error: "User not found",
                emailSearched: email.toLowerCase().trim()
            })
        }

        if (!user.password) {
            return NextResponse.json({
                success: false,
                step: "password_check",
                error: "No password set (OAuth user?)",
                userId: user.id
            })
        }

        // Test bcrypt
        const isValid = await bcrypt.compare(password, user.password)

        return NextResponse.json({
            success: isValid,
            step: "bcrypt_compare",
            userId: user.id,
            passwordHashPrefix: user.password.substring(0, 20),
            passwordLength: password.length,
            bcryptResult: isValid
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            step: "error",
            error: error.message
        }, { status: 500 })
    }
}
