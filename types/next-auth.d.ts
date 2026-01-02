import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            username: string
            onboardingCompleted: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        username: string
        avatarUrl?: string | null
        onboardingCompleted?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        email?: string
        username?: string
        picture?: string
        onboardingCompleted?: boolean
    }
}
