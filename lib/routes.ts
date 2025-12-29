/**
 * EverGo Route Map
 *
 * Canonical source of truth for all application routes.
 * Used by:
 * - Navigation components
 * - E2E test scenarios
 * - Link validation
 *
 * Each route includes:
 * - path: URL path (with optional params)
 * - auth: whether authentication is required
 * - title: human-readable page title
 * - testId: data-testid for the page container
 */

export type RouteAuth = "public" | "authenticated" | "guest-only"

export interface Route {
  path: string
  auth: RouteAuth
  title: string
  testId: string
  description?: string
}

// Public routes (no auth required)
export const PUBLIC_ROUTES = {
  landing: {
    path: "/",
    auth: "public" as const,
    title: "Welcome",
    testId: "page-landing",
    description: "Landing page",
  },
  login: {
    path: "/login",
    auth: "guest-only" as const,
    title: "Login",
    testId: "page-login",
    description: "User login page",
  },
  register: {
    path: "/register",
    auth: "guest-only" as const,
    title: "Register",
    testId: "page-register",
    description: "User registration page",
  },
  offline: {
    path: "/offline",
    auth: "public" as const,
    title: "Offline",
    testId: "page-offline",
    description: "Offline fallback page",
  },
} satisfies Record<string, Route>

// Authenticated routes
export const AUTH_ROUTES = {
  // Dashboard/Home
  home: {
    path: "/home",
    auth: "authenticated" as const,
    title: "Home",
    testId: "page-home",
    description: "User dashboard",
  },

  // Profile
  profile: {
    path: "/profile/:username",
    auth: "authenticated" as const,
    title: "Profile",
    testId: "page-profile",
    description: "User profile page",
  },

  // Activity
  activityCreate: {
    path: "/activity/create",
    auth: "authenticated" as const,
    title: "Log Activity",
    testId: "page-activity-create",
    description: "Create new activity",
  },
  activityTrack: {
    path: "/activity/track",
    auth: "authenticated" as const,
    title: "Track Activity",
    testId: "page-activity-track",
    description: "Track live activity",
  },
  activityDetail: {
    path: "/activity/:id",
    auth: "authenticated" as const,
    title: "Activity Detail",
    testId: "page-activity-detail",
    description: "View activity details",
  },

  // Calendar
  calendar: {
    path: "/calendar",
    auth: "authenticated" as const,
    title: "Calendar",
    testId: "page-calendar",
    description: "Activity calendar view",
  },

  // Challenges
  challenges: {
    path: "/challenges",
    auth: "authenticated" as const,
    title: "Challenges",
    testId: "page-challenges",
    description: "Browse challenges",
  },
  challengeCreate: {
    path: "/challenges/create",
    auth: "authenticated" as const,
    title: "Create Challenge",
    testId: "page-challenge-create",
    description: "Create new challenge",
  },
  challengeDetail: {
    path: "/challenges/:id",
    auth: "authenticated" as const,
    title: "Challenge Detail",
    testId: "page-challenge-detail",
    description: "View challenge details",
  },

  // Training
  training: {
    path: "/training",
    auth: "authenticated" as const,
    title: "Training",
    testId: "page-training",
    description: "Training overview",
  },
  trainingPlan: {
    path: "/training/:planId",
    auth: "authenticated" as const,
    title: "Training Plan",
    testId: "page-training-plan",
    description: "View training plan",
  },
  trainingPlans: {
    path: "/training-plans",
    auth: "authenticated" as const,
    title: "Training Plans",
    testId: "page-training-plans",
    description: "Browse training plans",
  },
  trainingPlanDetail: {
    path: "/training-plans/:id",
    auth: "authenticated" as const,
    title: "Training Plan Detail",
    testId: "page-training-plan-detail",
    description: "View training plan details",
  },

  // Teams
  teams: {
    path: "/teams",
    auth: "authenticated" as const,
    title: "Teams",
    testId: "page-teams",
    description: "Browse and manage teams",
  },
  teamDetail: {
    path: "/teams/:slug",
    auth: "authenticated" as const,
    title: "Team",
    testId: "page-team-detail",
    description: "View team details",
  },
  teamChallengeCreate: {
    path: "/teams/:slug/challenges/create",
    auth: "authenticated" as const,
    title: "Create Team Challenge",
    testId: "page-team-challenge-create",
    description: "Create team challenge",
  },

  // Communities
  communities: {
    path: "/communities",
    auth: "authenticated" as const,
    title: "Communities",
    testId: "page-communities",
    description: "Browse communities",
  },
  communityDetail: {
    path: "/communities/:slug",
    auth: "authenticated" as const,
    title: "Community",
    testId: "page-community-detail",
    description: "View community details",
  },

  // Rankings & Leaderboard
  leaderboard: {
    path: "/leaderboard",
    auth: "authenticated" as const,
    title: "Leaderboard",
    testId: "page-leaderboard",
    description: "View leaderboards",
  },
  rankings: {
    path: "/rankings",
    auth: "authenticated" as const,
    title: "Rankings",
    testId: "page-rankings",
    description: "View benchmark rankings",
  },

  // Notifications
  notifications: {
    path: "/notifications",
    auth: "authenticated" as const,
    title: "Notifications",
    testId: "page-notifications",
    description: "View notifications",
  },
  notificationSettings: {
    path: "/notifications/settings",
    auth: "authenticated" as const,
    title: "Notification Settings",
    testId: "page-notification-settings",
    description: "Configure notifications",
  },

  // Settings
  settings: {
    path: "/settings",
    auth: "authenticated" as const,
    title: "Settings",
    testId: "page-settings",
    description: "User settings",
  },
  settingsProfile: {
    path: "/settings/profile",
    auth: "authenticated" as const,
    title: "Profile Settings",
    testId: "page-settings-profile",
    description: "Edit profile",
  },
  settingsAccount: {
    path: "/settings/account",
    auth: "authenticated" as const,
    title: "Account Settings",
    testId: "page-settings-account",
    description: "Account management",
  },
  settingsSports: {
    path: "/settings/sports",
    auth: "authenticated" as const,
    title: "Sports Settings",
    testId: "page-settings-sports",
    description: "Manage sports preferences",
  },
  settingsSubscription: {
    path: "/settings/subscription",
    auth: "authenticated" as const,
    title: "Subscription",
    testId: "page-settings-subscription",
    description: "Manage subscription",
  },

  // Onboarding
  onboarding: {
    path: "/onboarding",
    auth: "authenticated" as const,
    title: "Onboarding",
    testId: "page-onboarding",
    description: "New user onboarding",
  },
  onboardingBenchmarks: {
    path: "/onboarding/benchmarks",
    auth: "authenticated" as const,
    title: "Set Benchmarks",
    testId: "page-onboarding-benchmarks",
    description: "Set initial benchmarks",
  },

  // Analytics
  analytics: {
    path: "/analytics",
    auth: "authenticated" as const,
    title: "Analytics",
    testId: "page-analytics",
    description: "View analytics and insights",
  },
} satisfies Record<string, Route>

// All routes combined
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
} satisfies Record<string, Route>

// Type-safe route keys
export type RouteKey = keyof typeof ROUTES

// Helper to build URL with params
export function buildUrl(
  routeKey: RouteKey,
  params?: Record<string, string>
): string {
  let path = ROUTES[routeKey].path
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value)
    }
  }
  return path
}

// Get all routes as array
export function getAllRoutes(): Route[] {
  return Object.values(ROUTES)
}

// Get routes by auth type
export function getRoutesByAuth(auth: RouteAuth): Route[] {
  return getAllRoutes().filter((route) => route.auth === auth)
}

// Get test IDs for all routes
export function getAllTestIds(): string[] {
  return getAllRoutes().map((route) => route.testId)
}

// Validate that a path matches a route pattern
export function matchRoute(path: string): Route | undefined {
  for (const route of getAllRoutes()) {
    const pattern = route.path.replace(/:[^/]+/g, "[^/]+")
    const regex = new RegExp(`^${pattern}$`)
    if (regex.test(path)) {
      return route
    }
  }
  return undefined
}
