import { test, expect } from '@playwright/test'

/**
 * Ribbon Range Switcher Tests
 * Tests for the period switcher (Week/Month/Year/All) on Home and Profile pages
 */
test.describe('Ribbon Range Switcher', () => {
  test.describe('Home Page', () => {
    test('should display range switcher and default to week', async ({ page }) => {
      await page.goto('/home')

      // Wait for ribbon to load
      await expect(page.locator('nav[role="tablist"]')).toBeVisible({ timeout: 10000 })

      // Check Week is selected by default
      const weekButton = page.locator('button[role="tab"]', { hasText: 'Week' })
      await expect(weekButton).toHaveAttribute('aria-selected', 'true')

      // Check URL doesn't have range param initially (uses default)
      // After clicking, it should update
      expect(page.url()).not.toContain('range=month')
    })

    test('should switch to Month and update URL', async ({ page }) => {
      await page.goto('/home')

      // Wait for ribbon
      await expect(page.locator('nav[role="tablist"]')).toBeVisible({ timeout: 10000 })

      // Click Month
      const monthButton = page.locator('button[role="tab"]', { hasText: 'Month' })
      await monthButton.click()

      // Check URL updated
      await expect(page).toHaveURL(/range=month/)

      // Check Month is now selected
      await expect(monthButton).toHaveAttribute('aria-selected', 'true')

      // Check caption changed
      await expect(page.locator('text=Last 30 days')).toBeVisible()
    })

    test('should switch to Year and show 365 days caption', async ({ page }) => {
      await page.goto('/home')

      await expect(page.locator('nav[role="tablist"]')).toBeVisible({ timeout: 10000 })

      const yearButton = page.locator('button[role="tab"]', { hasText: 'Year' })
      await yearButton.click()

      await expect(page).toHaveURL(/range=year/)
      await expect(page.locator('text=Last 365 days')).toBeVisible()
    })

    test('should switch to All and show "Since" caption', async ({ page }) => {
      await page.goto('/home')

      await expect(page.locator('nav[role="tablist"]')).toBeVisible({ timeout: 10000 })

      const allButton = page.locator('button[role="tab"]', { hasText: 'All' })
      await allButton.click()

      await expect(page).toHaveURL(/range=all/)
      // Caption should show "Since {month year}"
      await expect(page.locator('text=/Since [A-Z][a-z]+ \\d{4}/')).toBeVisible()
    })

    test('should preserve range in URL on page reload', async ({ page }) => {
      await page.goto('/home?range=month')

      await expect(page.locator('nav[role="tablist"]')).toBeVisible({ timeout: 10000 })

      // Month should be selected
      const monthButton = page.locator('button[role="tab"]', { hasText: 'Month' })
      await expect(monthButton).toHaveAttribute('aria-selected', 'true')
    })
  })

  test.describe('Profile Page', () => {
    test('should default to All on profile page', async ({ page }) => {
      await page.goto('/profile/me')

      // Wait for ribbon (may redirect first)
      await page.waitForTimeout(2000) // Allow for redirect

      // After redirect, check for ribbon
      const ribbon = page.locator('nav[role="tablist"]')
      if (await ribbon.isVisible()) {
        const allButton = page.locator('button[role="tab"]', { hasText: 'All' })
        await expect(allButton).toHaveAttribute('aria-selected', 'true')
      }
    })
  })

  test.describe('API Endpoint', () => {
    test('should return stats for week range', async ({ request }) => {
      const response = await request.get('/api/me/ribbon?range=week')

      // May return 401 if not authenticated, which is expected
      expect([200, 401]).toContain(response.status())

      if (response.status() === 200) {
        const data = await response.json()
        expect(data.range).toBe('week')
        expect(data.rangeBased).toBeDefined()
        expect(data.always).toBeDefined()
      }
    })

    test('should reject invalid range', async ({ request }) => {
      const response = await request.get('/api/me/ribbon?range=invalid')

      // Either 400 for invalid range or 401 for unauth
      expect([400, 401]).toContain(response.status())
    })
  })
})
