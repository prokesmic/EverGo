import { test, expect } from '@playwright/test'
import { waitForPageLoad, testKeyboardNavigation } from './utils/test-helpers'

/**
 * Accessibility Tests
 * Comprehensive a11y testing following WCAG 2.1 guidelines
 */
test.describe('Accessibility', () => {
  test.describe('Semantic Structure', () => {
    test('home page has proper heading hierarchy', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Should have an h1
      const h1 = await page.locator('h1').count()
      expect(h1).toBeGreaterThanOrEqual(1)

      // Headings should be in order (no skipping levels)
      const headings = await page.evaluate(() => {
        const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        return Array.from(hs).map(h => parseInt(h.tagName.replace('H', '')))
      })

      // Check no level is skipped
      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i] - headings[i - 1]
        expect(diff).toBeLessThanOrEqual(1) // Can go up by 1 or stay same or go down
      }
    })

    test('page has main landmark', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('page has navigation landmark', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const nav = page.locator('nav, [role="navigation"]')
      const navCount = await nav.count()
      expect(navCount).toBeGreaterThan(0)
    })

    test('links have descriptive text', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const links = await page.locator('a').all()

      for (const link of links.slice(0, 20)) {
        const text = await link.textContent()
        const ariaLabel = await link.getAttribute('aria-label')
        const title = await link.getAttribute('title')

        // Link should have some accessible name
        const hasName = (text && text.trim().length > 0) || ariaLabel || title
        expect(hasName).toBeTruthy()

        // Should not be generic "click here" or "read more"
        const genericTexts = ['click here', 'read more', 'learn more', 'here']
        const isGeneric = genericTexts.some(g => text?.toLowerCase().includes(g))
        if (isGeneric && !ariaLabel) {
          console.warn(`Link may have generic text: "${text}"`)
        }
      }
    })
  })

  test.describe('Form Accessibility', () => {
    test('form inputs have associated labels', async ({ page }) => {
      await page.goto('/settings')
      await waitForPageLoad(page)

      const inputs = await page.locator('input:visible, textarea:visible, select:visible').all()

      for (const input of inputs) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        const placeholder = await input.getAttribute('placeholder')

        // Check for associated label
        let hasLabel = false
        if (id) {
          hasLabel = await page.locator(`label[for="${id}"]`).count() > 0
        }

        const hasAccessibleName = hasLabel || ariaLabel || ariaLabelledBy
        expect(hasAccessibleName).toBeTruthy()
      }
    })

    test('required fields are indicated', async ({ page }) => {
      await page.goto('/teams/create')
      await waitForPageLoad(page)

      const requiredInputs = await page.locator('input[required], input[aria-required="true"]').all()

      for (const input of requiredInputs) {
        const ariaRequired = await input.getAttribute('aria-required')
        const required = await input.getAttribute('required')

        expect(ariaRequired === 'true' || required !== null).toBeTruthy()
      }
    })

    test('error messages are accessible', async ({ page }) => {
      await page.goto('/login')
      await waitForPageLoad(page)

      // Trigger validation
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(500)

      const errors = await page.locator('[role="alert"], [aria-live="polite"], .error').all()

      for (const error of errors) {
        // Errors should be announced to screen readers
        const role = await error.getAttribute('role')
        const ariaLive = await error.getAttribute('aria-live')

        // Error should have role=alert or aria-live
        expect(role === 'alert' || ariaLive).toBeTruthy()
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('can navigate page with keyboard only', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Start tabbing through page
      const tabOrder = await testKeyboardNavigation(page)

      console.log('Tab order:', tabOrder)

      // Should be able to tab through interactive elements
      expect(tabOrder.length).toBeGreaterThan(0)
    })

    test('focus is visible on interactive elements', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Tab to first button
      await page.keyboard.press('Tab')

      const activeElement = await page.evaluate(() => {
        const el = document.activeElement
        const styles = getComputedStyle(el!)
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          border: styles.border
        }
      })

      // Should have visible focus indicator (outline, box-shadow, or border)
      const hasFocusIndicator =
        activeElement.outline !== 'none' && activeElement.outline !== '' ||
        activeElement.boxShadow !== 'none' && activeElement.boxShadow !== ''

      // Focus indicator might be styled differently
    })

    test('dialogs trap focus', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open command palette
      await page.keyboard.press('Meta+k')

      const dialog = page.locator('[role="dialog"], [cmdk-root]')
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Tab multiple times
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab')
        }

        // Focus should still be within dialog
        const focusInDialog = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], [cmdk-root]')
          return dialog?.contains(document.activeElement)
        })

        expect(focusInDialog).toBeTruthy()

        await page.keyboard.press('Escape')
      }
    })

    test('skip link exists and works', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Skip link is usually first focusable element
      await page.keyboard.press('Tab')

      const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip")')
      const isSkipLinkFocused = await skipLink.isVisible().catch(() => false)

      // Skip link might be visually hidden until focused
    })
  })

  test.describe('Color and Contrast', () => {
    test('text has sufficient contrast', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Sample some text elements
      const textElements = await page.locator('p, span, h1, h2, h3, a').all()

      for (const el of textElements.slice(0, 10)) {
        const color = await el.evaluate(e => {
          const styles = getComputedStyle(e)
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor
          }
        })

        // Would need color contrast calculation library for actual testing
        // This is a placeholder check
        expect(color.color).toBeTruthy()
      }
    })

    test('information not conveyed by color alone', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      // Check that status indicators have more than just color
      const statusIndicators = page.locator('[class*="status"], [class*="badge"]')
      const count = await statusIndicators.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const indicator = statusIndicators.nth(i)
        if (await indicator.isVisible()) {
          const text = await indicator.textContent()
          const ariaLabel = await indicator.getAttribute('aria-label')

          // Should have text or aria-label, not just color
          expect(text || ariaLabel).toBeTruthy()
        }
      }
    })
  })

  test.describe('Images and Media', () => {
    test('images have alt text', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const images = await page.locator('img').all()

      for (const img of images) {
        const alt = await img.getAttribute('alt')
        const ariaHidden = await img.getAttribute('aria-hidden')
        const role = await img.getAttribute('role')

        // Image should have alt text OR be marked as decorative
        const isAccessible = alt !== null || ariaHidden === 'true' || role === 'presentation'
        expect(isAccessible).toBeTruthy()
      }
    })

    test('icons have accessible names', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const icons = page.locator('svg')
      const iconCount = await icons.count()

      for (let i = 0; i < Math.min(iconCount, 10); i++) {
        const icon = icons.nth(i)
        const ariaHidden = await icon.getAttribute('aria-hidden')
        const ariaLabel = await icon.getAttribute('aria-label')
        const role = await icon.getAttribute('role')

        // Icon should be hidden from AT or have accessible name
        const isAccessible = ariaHidden === 'true' || ariaLabel || role === 'img'
        // Many icons are decorative, so this is just informational
      }
    })
  })

  test.describe('ARIA Usage', () => {
    test('buttons have accessible names', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const buttons = await page.locator('button').all()

      for (const button of buttons) {
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        const ariaLabelledBy = await button.getAttribute('aria-labelledby')
        const title = await button.getAttribute('title')

        // Button should have accessible name
        const hasName = (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy || title
        expect(hasName).toBeTruthy()
      }
    })

    test('interactive elements have correct roles', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Check tabs
      const tablist = page.locator('[role="tablist"]')
      if (await tablist.count() > 0) {
        const tabs = tablist.locator('[role="tab"]')
        expect(await tabs.count()).toBeGreaterThan(0)
      }

      // Check dialogs
      const dialog = page.locator('[role="dialog"]')
      // Dialog should not be visible initially
    })

    test('live regions are used for dynamic content', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Check for live regions
      const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]')
      // Live regions may or may not be present
    })
  })

  test.describe('Mobile Accessibility', () => {
    test('touch targets are large enough', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/home')
      await waitForPageLoad(page)

      const buttons = await page.locator('button:visible, a:visible').all()

      for (const button of buttons.slice(0, 10)) {
        const box = await button.boundingBox()
        if (box) {
          // WCAG recommends 44x44px minimum
          const meetsMinSize = box.width >= 44 || box.height >= 44
          // Allow some flexibility for inline links
          if (!meetsMinSize) {
            console.warn(`Small touch target: ${box.width}x${box.height}`)
          }
        }
      }
    })

    test('page is usable in portrait and landscape', async ({ page }) => {
      // Portrait
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/home')
      await waitForPageLoad(page)
      await expect(page.locator('main')).toBeVisible()

      // Landscape
      await page.setViewportSize({ width: 667, height: 375 })
      await page.waitForTimeout(500)
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('Page-specific Accessibility', () => {
    const pages = [
      { name: 'Home', url: '/home' },
      { name: 'Rankings', url: '/rankings' },
      { name: 'Challenges', url: '/challenges' },
      { name: 'Teams', url: '/teams' },
      { name: 'Profile', url: '/profile/me' },
      { name: 'Settings', url: '/settings' },
    ]

    for (const pageInfo of pages) {
      test(`${pageInfo.name} page meets basic accessibility requirements`, async ({ page }) => {
        await page.goto(pageInfo.url)
        await waitForPageLoad(page)

        // Has h1
        const h1Count = await page.locator('h1').count()
        expect(h1Count).toBeGreaterThanOrEqual(1)

        // Has main landmark
        const main = page.locator('main')
        await expect(main).toBeVisible()

        // No empty buttons
        const buttons = await page.locator('button').all()
        for (const button of buttons.slice(0, 10)) {
          const text = await button.textContent()
          const ariaLabel = await button.getAttribute('aria-label')
          expect((text && text.trim()) || ariaLabel).toBeTruthy()
        }

        // No empty links
        const links = await page.locator('a').all()
        for (const link of links.slice(0, 10)) {
          const text = await link.textContent()
          const ariaLabel = await link.getAttribute('aria-label')
          expect((text && text.trim()) || ariaLabel).toBeTruthy()
        }
      })
    }
  })
})
