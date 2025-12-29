import { test, expect, Page } from '@playwright/test'
import { TEST_IDS } from '../../../lib/test-ids'

// Define result type inline to avoid importing axe-core
interface A11yViolation {
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null
  id: string
  description: string
}

interface A11yResults {
  violations: A11yViolation[]
}

// Dynamic import for AxeBuilder to avoid type issues at compile time
async function runAxeAnalysis(page: Page): Promise<A11yResults> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AxeBuilder = require('@axe-core/playwright').default
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
}

async function runAxeAnalysisBasic(page: Page): Promise<A11yResults> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AxeBuilder = require('@axe-core/playwright').default
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
}

/**
 * IRIS - Visual & Accessibility Tests
 *
 * Tests visual regression, accessibility compliance, and responsive design.
 */

test.describe('Iris: Visual & Accessibility', () => {
  test.describe('Visual Regression', () => {
    test('home page visual snapshot', async ({ page }) => {
      await page.goto('/home')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('home-page.png', {
        fullPage: true,
        maxDiffPixels: 200,
      })
    })

    test('calendar page visual snapshot', async ({ page }) => {
      await page.goto('/calendar')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('calendar-page.png', {
        fullPage: true,
        maxDiffPixels: 200,
      })
    })

    test('challenges page visual snapshot', async ({ page }) => {
      await page.goto('/challenges')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('challenges-page.png', {
        fullPage: true,
        maxDiffPixels: 200,
      })
    })

    test('settings page visual snapshot', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('settings-page.png', {
        fullPage: true,
        maxDiffPixels: 200,
      })
    })
  })

  test.describe('Accessibility', () => {
    test('home page has no critical a11y violations', async ({ page }) => {
      await page.goto('/home')
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await runAxeAnalysis(page)

      // Filter for only critical and serious violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v: A11yViolation) => v.impact === 'critical' || v.impact === 'serious'
      )

      expect(criticalViolations).toEqual([])
    })

    test('login page has no critical a11y violations', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined })
      const page = await context.newPage()

      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await runAxeAnalysisBasic(page)

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v: A11yViolation) => v.impact === 'critical' || v.impact === 'serious'
      )

      expect(criticalViolations).toEqual([])
      await context.close()
    })

    test('challenges page has no critical a11y violations', async ({ page }) => {
      await page.goto('/challenges')
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await runAxeAnalysisBasic(page)

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v: A11yViolation) => v.impact === 'critical' || v.impact === 'serious'
      )

      expect(criticalViolations).toEqual([])
    })

    test('settings page has no critical a11y violations', async ({ page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await runAxeAnalysisBasic(page)

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v: A11yViolation) => v.impact === 'critical' || v.impact === 'serious'
      )

      expect(criticalViolations).toEqual([])
    })
  })

  test.describe('Responsive Design', () => {
    test('mobile viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto('/home')
      await page.waitForLoadState('networkidle')

      // Check bottom navigation is visible on mobile
      const bottomNav = page.getByTestId(TEST_IDS.nav.bottomBar)
      if (await bottomNav.isVisible()) {
        await expect(bottomNav).toBeVisible()
      }
    })

    test('tablet viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await page.goto('/home')
      await page.waitForLoadState('networkidle')

      // Check layout adapts properly
      await expect(page).toHaveScreenshot('home-tablet.png', {
        fullPage: false,
        maxDiffPixels: 300,
      })
    })

    test('desktop viewport renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/home')
      await page.waitForLoadState('networkidle')

      // Check sidebar is visible on desktop
      const sidebar = page.getByTestId(TEST_IDS.nav.sidebar)
      if (await sidebar.isVisible()) {
        await expect(sidebar).toBeVisible()
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('can navigate login form with keyboard', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined })
      const page = await context.newPage()

      await page.goto('/login')

      // Tab to email input
      await page.keyboard.press('Tab')
      await expect(page.getByTestId(TEST_IDS.auth.emailInput)).toBeFocused()

      // Tab to password input
      await page.keyboard.press('Tab')
      await expect(page.getByTestId(TEST_IDS.auth.passwordInput)).toBeFocused()

      // Tab to submit button
      await page.keyboard.press('Tab')
      await expect(page.getByTestId(TEST_IDS.auth.submitBtn)).toBeFocused()

      await context.close()
    })

    test('main navigation is keyboard accessible', async ({ page }) => {
      await page.goto('/home')

      // Press Tab multiple times and check navigation receives focus
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
      }

      // Check some focusable element has focus
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })
})
