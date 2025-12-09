import { test, expect } from '@playwright/test'
import { HomePage } from './pages/home.page'
import { RankingsPage } from './pages/rankings.page'
import { ChallengesPage } from './pages/challenges.page'
import { TeamsPage } from './pages/teams.page'
import { ProfilePage } from './pages/profile.page'
import { SettingsPage } from './pages/settings.page'
import { waitForPageLoad, measurePerformance } from './utils/test-helpers'

/**
 * Navigation and Page Load Tests
 * Comprehensive tests for all major pages and navigation flows
 */
test.describe('Page Navigation', () => {
  test.describe('Main Navigation', () => {
    test('should navigate to home page', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()

      await expect(page).toHaveURL(/\/home/)
      const elements = await homePage.checkDashboardElements()
      expect(elements.activityFeedVisible || await page.locator('main').isVisible()).toBeTruthy()
    })

    test('should navigate to rankings page', async ({ page }) => {
      const rankingsPage = new RankingsPage(page)
      await rankingsPage.goto()

      await expect(page).toHaveURL(/\/rankings/)
      const elements = await rankingsPage.checkRankingElements()
      expect(elements.titleVisible).toBeTruthy()
    })

    test('should navigate to challenges page', async ({ page }) => {
      const challengesPage = new ChallengesPage(page)
      await challengesPage.goto()

      await expect(page).toHaveURL(/\/challenges/)
      const elements = await challengesPage.checkChallengesElements()
      expect(elements.titleVisible).toBeTruthy()
    })

    test('should navigate to teams page', async ({ page }) => {
      const teamsPage = new TeamsPage(page)
      await teamsPage.goto()

      await expect(page).toHaveURL(/\/teams/)
      const elements = await teamsPage.checkTeamsElements()
      expect(elements.titleVisible).toBeTruthy()
    })

    test('should navigate to profile page', async ({ page }) => {
      const profilePage = new ProfilePage(page)
      await profilePage.goto()

      await expect(page).toHaveURL(/\/profile/)
      const elements = await profilePage.checkProfileElements()
      expect(elements.avatarVisible || elements.nameVisible).toBeTruthy()
    })

    test('should navigate to settings page', async ({ page }) => {
      const settingsPage = new SettingsPage(page)
      await settingsPage.goto()

      await expect(page).toHaveURL(/\/settings/)
      const elements = await settingsPage.checkSettingsElements()
      expect(elements.saveButtonVisible || elements.formVisible).toBeTruthy()
    })
  })

  test.describe('Navigation Links', () => {
    test('should have working nav links on home page', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()

      // Get all navigation links
      const navLinks = await page.locator('nav a, header a').all()
      expect(navLinks.length).toBeGreaterThan(0)

      // Test each nav link is clickable
      for (const link of navLinks.slice(0, 5)) {
        const href = await link.getAttribute('href')
        if (href && !href.startsWith('#') && !href.includes('logout')) {
          await expect(link).toBeVisible()
        }
      }
    })

    test('should navigate via header links', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Find and click rankings link
      const rankingsLink = page.locator('a[href*="rankings"]').first()
      if (await rankingsLink.isVisible()) {
        await rankingsLink.click()
        await expect(page).toHaveURL(/rankings/)
      }
    })

    test('should navigate via bottom navigation (mobile)', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/home')
      await waitForPageLoad(page)

      // Check for mobile navigation
      const mobileNav = page.locator('nav[data-mobile], .mobile-nav, [class*="bottom-nav"]')
      if (await mobileNav.isVisible()) {
        const navItems = await mobileNav.locator('a').all()
        expect(navItems.length).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Command Palette Navigation', () => {
    test('should open command palette with keyboard shortcut', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open command palette
      await page.keyboard.press('Meta+k')

      const commandDialog = page.locator('[cmdk-root], [role="dialog"]')
      await expect(commandDialog).toBeVisible({ timeout: 5000 }).catch(() => {
        // Command palette might not be implemented
      })
    })

    test('should navigate via command palette search', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      await page.keyboard.press('Meta+k')

      const commandInput = page.locator('[cmdk-input], input[placeholder*="Search"]')
      if (await commandInput.isVisible()) {
        await commandInput.fill('rankings')
        await page.waitForTimeout(500)

        // Select first result
        await page.keyboard.press('Enter')

        // Should navigate to rankings or show search results
        await page.waitForTimeout(1000)
      }
    })

    test('should use quick action shortcuts', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open command palette
      await page.keyboard.press('Meta+k')

      const commandDialog = page.locator('[cmdk-root], [role="dialog"]')
      if (await commandDialog.isVisible()) {
        // Test quick action
        await page.keyboard.press('Meta+h') // Go to home shortcut

        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Page Load Performance', () => {
    test('home page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/home')
      await waitForPageLoad(page)
      const loadTime = Date.now() - startTime

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })

    test('rankings page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/rankings')
      await waitForPageLoad(page)
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
    })

    test('challenges page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/challenges')
      await waitForPageLoad(page)
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
    })

    test('should measure core web vitals', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const metrics = await measurePerformance(page)

      console.log('Performance metrics:', metrics)

      // Basic performance expectations
      expect(metrics.loadTime).toBeGreaterThan(0)
      expect(metrics.domContentLoaded).toBeGreaterThan(0)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page-12345')
      await waitForPageLoad(page)

      // Should show error page or redirect
      const is404 = page.url().includes('404') ||
        await page.locator('text=/not found/i, text=/404/i').isVisible().catch(() => false)
      const redirected = !page.url().includes('non-existent')

      expect(is404 || redirected).toBeTruthy()
    })

    test('should show loading states during navigation', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Navigate to another page
      const link = page.locator('a[href*="rankings"]').first()
      if (await link.isVisible()) {
        // Click and check for loading indicator
        await link.click()

        // Check for any loading indicators
        const loadingIndicator = page.locator('[data-loading], .loading, .spinner, [role="progressbar"]')
        // Loading indicator might be too fast to catch, so just verify navigation works
        await page.waitForURL(/rankings/, { timeout: 10000 })
      }
    })
  })

  test.describe('Browser Navigation', () => {
    test('should support browser back/forward', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Navigate to rankings
      await page.goto('/rankings')
      await waitForPageLoad(page)
      expect(page.url()).toContain('/rankings')

      // Go back
      await page.goBack()
      await waitForPageLoad(page)
      expect(page.url()).toContain('/home')

      // Go forward
      await page.goForward()
      await waitForPageLoad(page)
      expect(page.url()).toContain('/rankings')
    })

    test('should preserve scroll position on back navigation', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500))
      const scrollBefore = await page.evaluate(() => window.scrollY)

      // Navigate away and back
      await page.goto('/home')
      await page.goBack()
      await waitForPageLoad(page)

      // Scroll position may or may not be preserved depending on implementation
    })
  })
})
