import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Routes that require authentication but NOT onboarding completion
 * These are allowed even if onboardingCompleted is false
 */
const ONBOARDING_ALLOWED_ROUTES = [
  "/onboarding",
  "/api/onboarding",
  "/api/location",
  "/api/sports",
  "/api/auth",
]

/**
 * Fully public routes - no authentication required
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/pricing",
  "/privacy",
  "/terms",
  "/api/auth",
]

/**
 * Check if a path starts with any of the given prefixes
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => path === route || path.startsWith(route + "/"))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all API routes to pass through (handled by their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // files with extensions
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  // Get JWT token to check auth status
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Not authenticated - redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user has completed onboarding
  // Note: We store this in the session/token
  const onboardingCompleted = token.onboardingCompleted as boolean | undefined

  // If on onboarding routes, allow
  if (matchesRoute(pathname, ONBOARDING_ALLOWED_ROUTES)) {
    // If already completed onboarding and trying to access /onboarding, redirect to home
    if (onboardingCompleted && pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/home", request.url))
    }
    return NextResponse.next()
  }

  // If onboarding not completed, redirect to onboarding
  if (!onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  // All checks passed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
