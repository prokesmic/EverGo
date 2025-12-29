import { defineConfig, devices } from '@playwright/test'

/**
 * EverGo Playwright Configuration
 *
 * 5 Testing Agents:
 * - atlas: Navigation & routing tests
 * - hermes: Form & data submission tests
 * - nyx: Auth & session tests
 * - iris: Visual & a11y tests
 * - kronos: Performance & stress tests
 *
 * Plus browser-specific projects for cross-browser testing.
 */
export default defineConfig({
  testDir: './e2e',

  // Run tests in parallel for faster execution
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests - more on CI for flaky network conditions
  retries: process.env.CI ? 2 : 1,

  // Parallel workers - scale based on environment
  workers: process.env.CI ? 4 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
        ['github'],
      ]
    : [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
      ],

  // Global test timeout
  timeout: 30000,

  // Expect timeout for assertions
  expect: {
    timeout: 10000,
    // Visual comparison settings
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying a failed test
    trace: 'on-first-retry',

    // Record video on failure
    video: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Browser context options
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Ignore HTTPS errors (for local development)
    ignoreHTTPSErrors: true,

    // Extra HTTP headers for E2E testing
    extraHTTPHeaders: {
      'x-e2e-test': 'true',
    },
  },

  // Configure projects for major browsers and viewports
  projects: [
    // ============================================
    // SETUP PROJECT - runs first
    // ============================================
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ============================================
    // AGENT PROJECTS (5 specialized test agents)
    // ============================================

    // ATLAS - Navigation & Routing
    // Tests: page loads, route transitions, deep links, redirects
    {
      name: 'atlas',
      testDir: './e2e/agents/atlas',
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // HERMES - Forms & Data Submission
    // Tests: form validation, data submission, error handling
    {
      name: 'hermes',
      testDir: './e2e/agents/hermes',
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // NYX - Auth & Sessions
    // Tests: login, logout, session persistence, role-based access
    {
      name: 'nyx',
      testDir: './e2e/agents/nyx',
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // NYX handles its own auth - no storageState
      },
    },

    // IRIS - Visual & Accessibility
    // Tests: visual regression, a11y, responsive design
    {
      name: 'iris',
      testDir: './e2e/agents/iris',
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // KRONOS - Performance & Stress
    // Tests: load times, API response times, concurrent operations
    {
      name: 'kronos',
      testDir: './e2e/agents/kronos',
      testMatch: /.*\.spec\.ts/,
      timeout: 60000, // Longer timeout for perf tests
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // ============================================
    // BROWSER-SPECIFIC PROJECTS
    // ============================================

    // Desktop Chrome - main test suite
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Safari
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // ============================================
    // SPECIAL PURPOSE PROJECTS
    // ============================================

    // Unauthenticated tests
    {
      name: 'unauthenticated',
      testMatch: /.*\.unauth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Accessibility tests project
    {
      name: 'accessibility',
      testMatch: /.*\.a11y\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Visual regression tests
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // API tests (no browser)
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        // No browser needed for API tests
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results',
})
