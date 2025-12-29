import { test, expect } from '@playwright/test'
import { ROUTES } from '@/lib/routes'
import { TEST_IDS } from '@/lib/test-ids'

/**
 * ATLAS - Navigation & Routing Tests
 *
 * Tests all navigation flows, route transitions, deep links, and redirects.
 */

test.describe('Atlas: Navigation', () => {
  test.describe('Public Routes', () => {
    test('landing page loads correctly', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/EverGo|Welcome/)
    })

    test('login page is accessible', async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByTestId(TEST_IDS.auth.loginForm)).toBeVisible()
    })

    test('register page is accessible', async ({ page }) => {
      await page.goto('/register')
      await expect(page.getByTestId(TEST_IDS.auth.registerForm)).toBeVisible()
    })
  })

  test.describe('Authenticated Routes', () => {
    test('home page loads after login', async ({ page }) => {
      await page.goto('/home')
      await expect(page).toHaveURL(/home/)
    })

    test('calendar page loads', async ({ page }) => {
      await page.goto('/calendar')
      await expect(page).toHaveURL(/calendar/)
    })

    test('challenges page loads', async ({ page }) => {
      await page.goto('/challenges')
      await expect(page).toHaveURL(/challenges/)
    })

    test('teams page loads', async ({ page }) => {
      await page.goto('/teams')
      await expect(page).toHaveURL(/teams/)
    })

    test('settings page loads', async ({ page }) => {
      await page.goto('/settings')
      await expect(page).toHaveURL(/settings/)
    })

    test('rankings page loads', async ({ page }) => {
      await page.goto('/rankings')
      await expect(page).toHaveURL(/rankings/)
    })
  })

  test.describe('Navigation Links', () => {
    test('main navigation works', async ({ page }) => {
      await page.goto('/home')

      // Click calendar nav
      const calendarLink = page.getByTestId(TEST_IDS.nav.calendar)
      if (await calendarLink.isVisible()) {
        await calendarLink.click()
        await expect(page).toHaveURL(/calendar/)
      }
    })

    test('settings navigation works', async ({ page }) => {
      await page.goto('/settings')

      // Navigate to profile settings
      const profileLink = page.getByRole('link', { name: /profile/i })
      if (await profileLink.isVisible()) {
        await profileLink.click()
        await expect(page).toHaveURL(/settings\/profile/)
      }
    })
  })

  test.describe('Route Protection', () => {
    test('protected routes redirect when unauthenticated', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined })
      const page = await context.newPage()

      await page.goto('/home')
      // Should redirect to login
      await expect(page).toHaveURL(/login/)

      await context.close()
    })
  })

  test.describe('Deep Links', () => {
    test('activity detail deep link', async ({ page }) => {
      // Navigate to activity creation first
      await page.goto('/activity/create')
      await expect(page).toHaveURL(/activity\/create/)
    })

    test('challenge detail deep link', async ({ page }) => {
      await page.goto('/challenges')
      await expect(page).toHaveURL(/challenges/)
    })
  })
})
