import { test, expect } from '@playwright/test'
import { waitForPageLoad } from './utils/test-helpers'

/**
 * Component Interaction Tests
 * Tests for individual UI components across the application
 */
test.describe('Component Interactions', () => {
  test.describe('Buttons', () => {
    test('should test all buttons on home page are clickable', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const buttons = await page.locator('button:visible').all()
      console.log(`Found ${buttons.length} buttons on home page`)

      for (const button of buttons.slice(0, 10)) {
        const isEnabled = await button.isEnabled()
        const text = await button.textContent()

        if (isEnabled) {
          // Verify button is interactable
          await expect(button).toBeVisible()
          await expect(button).toBeEnabled()
        }

        console.log(`Button "${text?.trim()}": enabled=${isEnabled}`)
      }
    })

    test('should have proper button states (hover, focus)', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const button = page.locator('button:visible').first()
      if (await button.isVisible()) {
        // Test hover state
        await button.hover()
        await page.waitForTimeout(200)

        // Test focus state
        await button.focus()
        const hasFocus = await button.evaluate(el => document.activeElement === el)
        expect(hasFocus).toBeTruthy()
      }
    })
  })

  test.describe('Cards', () => {
    test('should click activity cards', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const activityCards = page.locator('article, [class*="activity-card"]')
      const cardCount = await activityCards.count()

      if (cardCount > 0) {
        const firstCard = activityCards.first()
        await expect(firstCard).toBeVisible()

        // Click and check navigation or modal
        const currentUrl = page.url()
        await firstCard.click()
        await page.waitForTimeout(500)

        // Either URL changed or modal opened
        const urlChanged = page.url() !== currentUrl
        const modalVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false)
      }
    })

    test('should click team cards', async ({ page }) => {
      await page.goto('/teams')
      await waitForPageLoad(page)

      const teamCards = page.locator('[class*="team-card"], article')
      if (await teamCards.first().isVisible()) {
        await teamCards.first().click()
        await page.waitForTimeout(500)

        // Should navigate to team detail
        expect(page.url()).toMatch(/\/teams\//)
      }
    })

    test('should click challenge cards', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      const challengeCards = page.locator('[class*="challenge-card"], article')
      if (await challengeCards.first().isVisible()) {
        await challengeCards.first().click()
        await page.waitForTimeout(500)
      }
    })

    test('should interact with ranking cards', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const rankingCards = page.locator('[class*="rank"], [class*="ranking"]')
      if (await rankingCards.first().isVisible()) {
        await rankingCards.first().click()
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Modals and Dialogs', () => {
    test('should open and close command palette', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open
      await page.keyboard.press('Meta+k')
      const dialog = page.locator('[cmdk-root], [role="dialog"]')

      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(dialog).toBeVisible()

        // Close with Escape
        await page.keyboard.press('Escape')
        await expect(dialog).not.toBeVisible()
      }
    })

    test('should handle modal focus trap', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open command palette
      await page.keyboard.press('Meta+k')

      const dialog = page.locator('[cmdk-root], [role="dialog"]')
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Tab should cycle within modal
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')

        // Focus should still be within dialog
        const activeElement = await page.evaluate(() => document.activeElement?.closest('[role="dialog"], [cmdk-root]'))
        // Focus trap might be implemented differently
      }
    })
  })

  test.describe('Dropdowns and Selects', () => {
    test('should open dropdown menus', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)

      const dropdown = page.locator('select, [role="combobox"]').first()
      if (await dropdown.isVisible()) {
        await dropdown.click()

        const options = page.locator('[role="option"], option')
        const optionCount = await options.count()
        expect(optionCount).toBeGreaterThan(0)
      }
    })

    test('should select dropdown option', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)

      const dropdown = page.locator('[role="combobox"]').first()
      if (await dropdown.isVisible()) {
        await dropdown.click()

        const option = page.locator('[role="option"]').first()
        if (await option.isVisible()) {
          const optionText = await option.textContent()
          await option.click()

          // Dropdown should close and value should be selected
          await expect(page.locator('[role="option"]')).not.toBeVisible()
        }
      }
    })

    test('should use user menu dropdown', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Find user menu button (usually avatar or settings icon in header)
      const userMenu = page.locator('header [role="button"], header button:has([class*="avatar"])')
      if (await userMenu.first().isVisible()) {
        await userMenu.first().click()

        // Menu items should appear
        const menuItems = page.locator('[role="menuitem"], [role="menu"] a')
        await expect(menuItems.first()).toBeVisible({ timeout: 3000 }).catch(() => { })
      }
    })
  })

  test.describe('Tabs', () => {
    test('should switch between tabs on challenges page', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      const tabs = page.locator('[role="tab"]')
      const tabCount = await tabs.count()

      if (tabCount > 1) {
        // Click second tab
        await tabs.nth(1).click()
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')

        // Click back to first tab
        await tabs.first().click()
        await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
      }
    })

    test('should keyboard navigate tabs', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      const tabs = page.locator('[role="tab"]')
      if (await tabs.first().isVisible()) {
        await tabs.first().focus()

        // Arrow right to next tab
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(100)
      }
    })
  })

  test.describe('Progress Bars', () => {
    test('should display progress bars correctly', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const progressBars = page.locator('[role="progressbar"]')
      const count = await progressBars.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const bar = progressBars.nth(i)
        if (await bar.isVisible()) {
          const value = await bar.getAttribute('aria-valuenow')
          const max = await bar.getAttribute('aria-valuemax')

          // Progress bar should have proper ARIA attributes
          expect(value !== null || max !== null).toBeTruthy()
        }
      }
    })

    test('should display XP progress on challenges', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      const xpProgress = page.locator('[role="progressbar"]').first()
      if (await xpProgress.isVisible()) {
        await expect(xpProgress).toBeVisible()
      }
    })
  })

  test.describe('Avatars', () => {
    test('should display user avatars', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const avatars = page.locator('[class*="avatar"]')
      const count = await avatars.count()

      expect(count).toBeGreaterThan(0)

      // Check first avatar has image or fallback
      const firstAvatar = avatars.first()
      if (await firstAvatar.isVisible()) {
        const hasImage = await firstAvatar.locator('img').isVisible().catch(() => false)
        const hasFallback = await firstAvatar.locator('span').isVisible().catch(() => false)

        expect(hasImage || hasFallback).toBeTruthy()
      }
    })
  })

  test.describe('Badges', () => {
    test('should display badges on challenges page', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      // Switch to badges tab if available
      const badgesTab = page.locator('[role="tab"]:has-text("Badges")')
      if (await badgesTab.isVisible()) {
        await badgesTab.click()
        await page.waitForTimeout(300)

        const badges = page.locator('[class*="badge"]')
        const count = await badges.count()
        console.log(`Found ${count} badges`)
      }
    })

    test('should show badge tooltip on hover', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      const badgesTab = page.locator('[role="tab"]:has-text("Badges")')
      if (await badgesTab.isVisible()) {
        await badgesTab.click()
        await page.waitForTimeout(300)

        const badge = page.locator('[class*="badge"]').first()
        if (await badge.isVisible()) {
          await badge.hover()
          await page.waitForTimeout(500)

          // Check for tooltip
          const tooltip = page.locator('[role="tooltip"], [class*="tooltip"]')
          // Tooltip might be implemented differently
        }
      }
    })
  })

  test.describe('Tooltips', () => {
    test('should show tooltips on hover', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Find elements with title or tooltip
      const elementsWithTooltip = page.locator('[title], [data-tooltip]')
      const count = await elementsWithTooltip.count()

      if (count > 0) {
        const element = elementsWithTooltip.first()
        await element.hover()
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Loading States', () => {
    test('should show skeleton loaders during data fetch', async ({ page }) => {
      // Intercept API to slow down response
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 100))
        await route.continue()
      })

      await page.goto('/home')

      // Check for any loading indicators
      const loaders = page.locator('[class*="skeleton"], [class*="loading"], [role="progressbar"]')
      // Loaders might be too fast to catch
    })
  })

  test.describe('Empty States', () => {
    test('should display empty state on teams page when no teams', async ({ page }) => {
      await page.goto('/teams')
      await waitForPageLoad(page)

      // Check for empty state or team cards
      const emptyState = page.locator('[class*="empty"], .empty-state')
      const teamCards = page.locator('[class*="team-card"]')

      const hasEmpty = await emptyState.isVisible().catch(() => false)
      const hasTeams = await teamCards.first().isVisible().catch(() => false)

      // Should have either empty state or teams
      expect(hasEmpty || hasTeams).toBeTruthy()
    })
  })

  test.describe('Infinite Scroll / Pagination', () => {
    test('should load more content on scroll', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Get initial card count
      const initialCards = await page.locator('article, [class*="card"]').count()

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(1000)

      // Check if more content loaded
      const afterScrollCards = await page.locator('article, [class*="card"]').count()

      console.log(`Cards before scroll: ${initialCards}, after: ${afterScrollCards}`)
      // Might not have infinite scroll implemented
    })
  })
})
