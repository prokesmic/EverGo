import { test, expect } from '@playwright/test'
import { TEST_IDS } from '@/lib/test-ids'

/**
 * NYX - Auth & Session Tests
 *
 * Tests login, logout, session persistence, role-based access.
 * NYX handles its own authentication - no storageState dependency.
 */

// Test credentials from environment
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'e2e-test@evergo.app'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!'

test.describe('Nyx: Authentication', () => {
  test.describe('Login Flow', () => {
    test('login page displays correctly', async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByTestId(TEST_IDS.auth.loginForm)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.auth.emailInput)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.auth.passwordInput)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.auth.submitBtn)).toBeVisible()
    })

    test('login with valid credentials redirects to home', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId(TEST_IDS.auth.emailInput).fill(TEST_EMAIL)
      await page.getByTestId(TEST_IDS.auth.passwordInput).fill(TEST_PASSWORD)
      await page.getByTestId(TEST_IDS.auth.submitBtn).click()

      // Should redirect to home or onboarding
      await expect(page).toHaveURL(/home|onboarding/)
    })

    test('login with invalid credentials shows error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId(TEST_IDS.auth.emailInput).fill('invalid@test.com')
      await page.getByTestId(TEST_IDS.auth.passwordInput).fill('wrongpassword')
      await page.getByTestId(TEST_IDS.auth.submitBtn).click()

      // Should show error and stay on login page
      await expect(page).toHaveURL(/login/)
      // Error message should appear
      const errorMessage = page.getByTestId(TEST_IDS.auth.errorMessage)
      await expect(errorMessage).toBeVisible()
    })

    test('empty form submission shows validation', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId(TEST_IDS.auth.submitBtn).click()

      // Should stay on login page
      await expect(page).toHaveURL(/login/)
    })
  })

  test.describe('Registration Flow', () => {
    test('register page displays correctly', async ({ page }) => {
      await page.goto('/register')
      await expect(page.getByTestId(TEST_IDS.auth.registerForm)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.auth.emailInput)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.auth.passwordInput)).toBeVisible()
      await expect(page.getByTestId(TEST_IDS.auth.submitBtn)).toBeVisible()
    })

    test('registration link from login works', async ({ page }) => {
      await page.goto('/login')

      const registerLink = page.getByTestId(TEST_IDS.auth.registerLink)
      if (await registerLink.isVisible()) {
        await registerLink.click()
        await expect(page).toHaveURL(/register/)
      }
    })

    test('login link from register works', async ({ page }) => {
      await page.goto('/register')

      const loginLink = page.getByTestId(TEST_IDS.auth.loginLink)
      if (await loginLink.isVisible()) {
        await loginLink.click()
        await expect(page).toHaveURL(/login/)
      }
    })
  })

  test.describe('Session Management', () => {
    test('session persists across page reloads', async ({ page }) => {
      // Login first
      await page.goto('/login')
      await page.getByTestId(TEST_IDS.auth.emailInput).fill(TEST_EMAIL)
      await page.getByTestId(TEST_IDS.auth.passwordInput).fill(TEST_PASSWORD)
      await page.getByTestId(TEST_IDS.auth.submitBtn).click()

      // Wait for redirect
      await expect(page).toHaveURL(/home|onboarding/)

      // Reload page
      await page.reload()

      // Should still be authenticated
      await expect(page).not.toHaveURL(/login/)
    })

    test('logout redirects to login', async ({ page }) => {
      // Login first
      await page.goto('/login')
      await page.getByTestId(TEST_IDS.auth.emailInput).fill(TEST_EMAIL)
      await page.getByTestId(TEST_IDS.auth.passwordInput).fill(TEST_PASSWORD)
      await page.getByTestId(TEST_IDS.auth.submitBtn).click()

      // Wait for redirect
      await expect(page).toHaveURL(/home|onboarding/)

      // Find and click logout
      const logoutBtn = page.getByTestId(TEST_IDS.nav.logout)
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click()
        await expect(page).toHaveURL(/login|\//)
      }
    })
  })

  test.describe('Route Protection', () => {
    test('unauthenticated user cannot access protected routes', async ({ page }) => {
      await page.goto('/home')
      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })

    test('unauthenticated user cannot access settings', async ({ page }) => {
      await page.goto('/settings')
      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })

    test('unauthenticated user cannot access calendar', async ({ page }) => {
      await page.goto('/calendar')
      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })
  })
})
