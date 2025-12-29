/**
 * EverGo Test IDs
 *
 * Canonical source of truth for all data-testid attributes.
 * Use these constants in both:
 * - React components: data-testid={TEST_IDS.nav.home}
 * - E2E tests: page.getByTestId(TEST_IDS.nav.home)
 *
 * Naming conventions:
 * - kebab-case for IDs
 * - Grouped by component/section
 * - Descriptive and unique
 */

export const TEST_IDS = {
  // Navigation
  nav: {
    main: "nav-main",
    sidebar: "nav-sidebar",
    bottomBar: "nav-bottom-bar",
    home: "nav-home",
    calendar: "nav-calendar",
    challenges: "nav-challenges",
    teams: "nav-teams",
    profile: "nav-profile",
    settings: "nav-settings",
    notifications: "nav-notifications",
    logout: "nav-logout",
    logo: "nav-logo",
  },

  // Auth
  auth: {
    loginForm: "auth-login-form",
    registerForm: "auth-register-form",
    emailInput: "auth-email-input",
    passwordInput: "auth-password-input",
    confirmPasswordInput: "auth-confirm-password-input",
    submitBtn: "auth-submit-btn",
    loginLink: "auth-login-link",
    registerLink: "auth-register-link",
    forgotPasswordLink: "auth-forgot-password-link",
    errorMessage: "auth-error-message",
    successMessage: "auth-success-message",
  },

  // Home/Dashboard
  home: {
    page: "page-home",
    welcomeCard: "home-welcome-card",
    statsGrid: "home-stats-grid",
    recentActivities: "home-recent-activities",
    upcomingChallenges: "home-upcoming-challenges",
    quickActions: "home-quick-actions",
    addActivityBtn: "home-add-activity-btn",
  },

  // Activity
  activity: {
    createPage: "page-activity-create",
    trackPage: "page-activity-track",
    detailPage: "page-activity-detail",
    form: "activity-form",
    sportSelect: "activity-sport-select",
    dateInput: "activity-date-input",
    durationInput: "activity-duration-input",
    distanceInput: "activity-distance-input",
    notesInput: "activity-notes-input",
    submitBtn: "activity-submit-btn",
    cancelBtn: "activity-cancel-btn",
    deleteBtn: "activity-delete-btn",
    editBtn: "activity-edit-btn",
    card: "activity-card",
    list: "activity-list",
    emptyState: "activity-empty-state",
    achievements: "activity-achievements",
  },

  // Calendar
  calendar: {
    page: "page-calendar",
    grid: "calendar-grid",
    monthNav: "calendar-month-nav",
    prevBtn: "calendar-prev-btn",
    nextBtn: "calendar-next-btn",
    todayBtn: "calendar-today-btn",
    dayCell: "calendar-day-cell",
    eventItem: "calendar-event-item",
  },

  // Challenges
  challenges: {
    page: "page-challenges",
    createPage: "page-challenge-create",
    detailPage: "page-challenge-detail",
    list: "challenges-list",
    card: "challenge-card",
    form: "challenge-form",
    nameInput: "challenge-name-input",
    descriptionInput: "challenge-description-input",
    startDateInput: "challenge-start-date-input",
    endDateInput: "challenge-end-date-input",
    goalInput: "challenge-goal-input",
    submitBtn: "challenge-submit-btn",
    joinBtn: "challenge-join-btn",
    leaveBtn: "challenge-leave-btn",
    progressBar: "challenge-progress-bar",
    leaderboard: "challenge-leaderboard",
    emptyState: "challenges-empty-state",
    filter: "challenges-filter",
    tabs: "challenges-tabs",
  },

  // Training
  training: {
    page: "page-training",
    planPage: "page-training-plan",
    plansPage: "page-training-plans",
    planCard: "training-plan-card",
    planList: "training-plan-list",
    workoutCard: "training-workout-card",
    weekNav: "training-week-nav",
    startPlanBtn: "training-start-plan-btn",
    pausePlanBtn: "training-pause-plan-btn",
    resumePlanBtn: "training-resume-plan-btn",
    emptyState: "training-empty-state",
  },

  // Teams
  teams: {
    page: "page-teams",
    detailPage: "page-team-detail",
    list: "teams-list",
    card: "team-card",
    createBtn: "team-create-btn",
    joinBtn: "team-join-btn",
    leaveBtn: "team-leave-btn",
    memberList: "team-member-list",
    memberCard: "team-member-card",
    inviteBtn: "team-invite-btn",
    settingsBtn: "team-settings-btn",
    emptyState: "teams-empty-state",
  },

  // Communities
  communities: {
    page: "page-communities",
    detailPage: "page-community-detail",
    list: "communities-list",
    card: "community-card",
    joinBtn: "community-join-btn",
    leaveBtn: "community-leave-btn",
    memberCount: "community-member-count",
    feed: "community-feed",
    emptyState: "communities-empty-state",
  },

  // Rankings
  rankings: {
    page: "page-rankings",
    leaderboardPage: "page-leaderboard",
    sportFilter: "rankings-sport-filter",
    benchmarkFilter: "rankings-benchmark-filter",
    table: "rankings-table",
    row: "rankings-row",
    userRank: "rankings-user-rank",
    emptyState: "rankings-empty-state",
  },

  // Profile
  profile: {
    page: "page-profile",
    avatar: "profile-avatar",
    displayName: "profile-display-name",
    username: "profile-username",
    bio: "profile-bio",
    statsCard: "profile-stats-card",
    sportsCard: "profile-sports-card",
    benchmarksCard: "profile-benchmarks-card",
    activitiesTab: "profile-activities-tab",
    achievementsTab: "profile-achievements-tab",
    followBtn: "profile-follow-btn",
    unfollowBtn: "profile-unfollow-btn",
    editBtn: "profile-edit-btn",
    followersCount: "profile-followers-count",
    followingCount: "profile-following-count",
  },

  // Settings
  settings: {
    page: "page-settings",
    profilePage: "page-settings-profile",
    accountPage: "page-settings-account",
    sportsPage: "page-settings-sports",
    subscriptionPage: "page-settings-subscription",
    nav: "settings-nav",
    form: "settings-form",
    saveBtn: "settings-save-btn",
    cancelBtn: "settings-cancel-btn",
    avatarUpload: "settings-avatar-upload",
    displayNameInput: "settings-display-name-input",
    bioInput: "settings-bio-input",
    emailInput: "settings-email-input",
    passwordInput: "settings-password-input",
    newPasswordInput: "settings-new-password-input",
    confirmPasswordInput: "settings-confirm-password-input",
    deleteAccountBtn: "settings-delete-account-btn",
  },

  // Notifications
  notifications: {
    page: "page-notifications",
    settingsPage: "page-notification-settings",
    list: "notifications-list",
    item: "notification-item",
    markReadBtn: "notification-mark-read-btn",
    markAllReadBtn: "notification-mark-all-read-btn",
    emptyState: "notifications-empty-state",
    badge: "notifications-badge",
  },

  // Onboarding
  onboarding: {
    page: "page-onboarding",
    benchmarksPage: "page-onboarding-benchmarks",
    step: "onboarding-step",
    progressBar: "onboarding-progress-bar",
    nextBtn: "onboarding-next-btn",
    prevBtn: "onboarding-prev-btn",
    skipBtn: "onboarding-skip-btn",
    finishBtn: "onboarding-finish-btn",
    sportSelect: "onboarding-sport-select",
    benchmarkInput: "onboarding-benchmark-input",
  },

  // Analytics
  analytics: {
    page: "page-analytics",
    chart: "analytics-chart",
    periodSelect: "analytics-period-select",
    statsCard: "analytics-stats-card",
    exportBtn: "analytics-export-btn",
  },

  // Common UI
  ui: {
    loadingSpinner: "ui-loading-spinner",
    loadingSkeleton: "ui-loading-skeleton",
    errorBoundary: "ui-error-boundary",
    errorMessage: "ui-error-message",
    successToast: "ui-success-toast",
    errorToast: "ui-error-toast",
    modal: "ui-modal",
    modalClose: "ui-modal-close",
    modalConfirm: "ui-modal-confirm",
    modalCancel: "ui-modal-cancel",
    dropdown: "ui-dropdown",
    dropdownTrigger: "ui-dropdown-trigger",
    dropdownMenu: "ui-dropdown-menu",
    searchInput: "ui-search-input",
    emptyState: "ui-empty-state",
    pagination: "ui-pagination",
    paginationPrev: "ui-pagination-prev",
    paginationNext: "ui-pagination-next",
  },

  // Forms
  form: {
    field: "form-field",
    label: "form-label",
    input: "form-input",
    select: "form-select",
    textarea: "form-textarea",
    checkbox: "form-checkbox",
    radio: "form-radio",
    error: "form-error",
    hint: "form-hint",
    submitBtn: "form-submit-btn",
    resetBtn: "form-reset-btn",
  },
} as const

// Type for all test IDs
export type TestId = (typeof TEST_IDS)[keyof typeof TEST_IDS]

// Helper to get a test ID selector
export function tid(testId: string): string {
  return `[data-testid="${testId}"]`
}

// Helper to create dynamic test IDs (e.g., for list items)
export function dynamicTid(base: string, id: string | number): string {
  return `${base}-${id}`
}
