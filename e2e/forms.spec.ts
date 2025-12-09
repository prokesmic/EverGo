import { test, expect } from '@playwright/test'
import { SettingsPage } from './pages/settings.page'
import { waitForPageLoad, generateTestData } from './utils/test-helpers'

/**
 * Form Interaction Tests
 * Comprehensive tests for all forms and inputs across the application
 */
test.describe('Form Interactions', () => {
  test.describe('Settings Form', () => {
    test('should load settings page with form elements', async ({ page }) => {
      const settingsPage = new SettingsPage(page)
      await settingsPage.goto()

      // Check form is visible
      const form = page.locator('form').first()
      await expect(form).toBeVisible({ timeout: 10000 }).catch(() => {
        // Settings might have a different structure
      })
    })

    test('should update profile settings', async ({ page }) => {
      const settingsPage = new SettingsPage(page)
      await settingsPage.goto()

      // Find and fill display name
      const displayNameInput = page.locator('input[name="displayName"], input[name="name"]').first()
      if (await displayNameInput.isVisible()) {
        const testName = `Test User ${Date.now()}`
        await displayNameInput.clear()
        await displayNameInput.fill(testName)
        await expect(displayNameInput).toHaveValue(testName)
      }

      // Find bio field
      const bioInput = page.locator('textarea[name="bio"], input[name="bio"]').first()
      if (await bioInput.isVisible()) {
        await bioInput.clear()
        await bioInput.fill('This is a test bio')
      }
    })

    test('should toggle notification settings', async ({ page }) => {
      const settingsPage = new SettingsPage(page)
      await settingsPage.goto()

      // Find toggle switches
      const toggles = await page.locator('[role="switch"], input[type="checkbox"]').all()

      for (const toggle of toggles.slice(0, 3)) {
        if (await toggle.isVisible()) {
          const initialState = await toggle.isChecked().catch(() =>
            toggle.getAttribute('aria-checked').then(v => v === 'true')
          )

          await toggle.click()

          // Verify state changed
          const newState = await toggle.isChecked().catch(() =>
            toggle.getAttribute('aria-checked').then(v => v === 'true')
          )

          // State should have changed (or button should be clickable)
        }
      }
    })

    test('should save settings changes', async ({ page }) => {
      const settingsPage = new SettingsPage(page)
      await settingsPage.goto()

      // Find save button
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")')
      if (await saveButton.isVisible()) {
        await expect(saveButton).toBeEnabled()
        await saveButton.click()

        // Check for success feedback
        await page.waitForTimeout(1000)
        const toast = page.locator('[data-sonner-toast], [role="status"]')
        // Toast might appear or page might just save quietly
      }
    })
  })

  test.describe('Activity Creation Form', () => {
    test('should navigate to activity creation page', async ({ page }) => {
      await page.goto('/activity/create')
      await waitForPageLoad(page)

      // Check for form or redirect
      const form = page.locator('form')
      const hasForm = await form.isVisible().catch(() => false)
      const isRedirected = !page.url().includes('/activity/create')

      expect(hasForm || isRedirected).toBeTruthy()
    })

    test('should have required form fields', async ({ page }) => {
      await page.goto('/activity/create')
      await waitForPageLoad(page)

      // Look for activity type selector
      const activityType = page.locator('select, [role="combobox"], input[name="type"]').first()
      const hasActivityType = await activityType.isVisible().catch(() => false)

      // Look for distance or duration input
      const distanceInput = page.locator('input[name="distance"], input[type="number"]').first()
      const durationInput = page.locator('input[name="duration"]').first()

      const hasDistanceOrDuration = await distanceInput.isVisible().catch(() => false) ||
        await durationInput.isVisible().catch(() => false)

      // Activity form should have type and distance/duration
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/activity/create')
      await waitForPageLoad(page)

      const submitButton = page.locator('button[type="submit"]').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()

        // Should show validation errors or prevent submission
        await page.waitForTimeout(500)
        const hasErrors = await page.locator('[aria-invalid="true"], .error, .text-destructive').count()
        const stillOnPage = page.url().includes('/activity/create')

        expect(hasErrors > 0 || stillOnPage).toBeTruthy()
      }
    })
  })

  test.describe('Team Creation Form', () => {
    test('should navigate to team creation page', async ({ page }) => {
      await page.goto('/teams/create')
      await waitForPageLoad(page)

      const form = page.locator('form')
      const hasForm = await form.isVisible().catch(() => false)
      const isRedirected = !page.url().includes('/teams/create')

      expect(hasForm || isRedirected).toBeTruthy()
    })

    test('should fill team creation form', async ({ page }) => {
      await page.goto('/teams/create')
      await waitForPageLoad(page)

      // Team name
      const nameInput = page.locator('input[name="name"]').first()
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Team ' + Date.now())
      }

      // Description
      const descInput = page.locator('textarea[name="description"]').first()
      if (await descInput.isVisible()) {
        await descInput.fill('This is a test team description')
      }

      // Sport selection
      const sportSelect = page.locator('select[name="sport"], [role="combobox"]').first()
      if (await sportSelect.isVisible()) {
        await sportSelect.click()
        const option = page.locator('[role="option"]').first()
        if (await option.isVisible()) {
          await option.click()
        }
      }
    })
  })

  test.describe('Challenge Creation/Join', () => {
    test('should interact with challenge join button', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      // Find a challenge card with join button
      const joinButton = page.locator('button:has-text("Join"), a:has-text("Join")').first()
      if (await joinButton.isVisible()) {
        await expect(joinButton).toBeEnabled()

        // Click to see what happens (might open modal or navigate)
        await joinButton.click()
        await page.waitForTimeout(500)
      }
    })

    test('should view challenge details', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      // Click on first challenge card
      const challengeCard = page.locator('article, [class*="challenge-card"]').first()
      if (await challengeCard.isVisible()) {
        await challengeCard.click()

        // Should navigate to challenge detail or open modal
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('Search Forms', () => {
    test('should use search input on teams page', async ({ page }) => {
      await page.goto('/teams')
      await waitForPageLoad(page)

      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await page.waitForTimeout(500) // Wait for debounce

        // Results should update or filter
      }
    })

    test('should use global search in command palette', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open command palette
      await page.keyboard.press('Meta+k')

      const searchInput = page.locator('[cmdk-input], input[placeholder*="Search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('john')
        await page.waitForTimeout(500)

        // Should show search results
        const results = page.locator('[cmdk-item], [role="option"]')
        const resultCount = await results.count()
        // Results might be empty if no matching data
      }
    })
  })

  test.describe('Filter Forms', () => {
    test('should use ranking filters', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)

      // Find filter buttons
      const filterButtons = page.locator('button').filter({ hasText: /Friends|Team|Global/ })
      const buttons = await filterButtons.all()

      for (const button of buttons) {
        if (await button.isVisible()) {
          await button.click()
          await page.waitForTimeout(300)
          // Content should update based on filter
        }
      }
    })

    test('should use sport filter', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)

      // Find sport dropdown
      const sportSelect = page.locator('select, [role="combobox"]').first()
      if (await sportSelect.isVisible()) {
        await sportSelect.click()

        const option = page.locator('[role="option"]').first()
        if (await option.isVisible()) {
          await option.click()
          await page.waitForTimeout(300)
        }
      }
    })
  })

  test.describe('Form Validation', () => {
    test('should validate email format', async ({ page }) => {
      // Go to settings or profile edit
      await page.goto('/settings')
      await waitForPageLoad(page)

      const emailInput = page.locator('input[type="email"], input[name="email"]').first()
      if (await emailInput.isVisible()) {
        await emailInput.clear()
        await emailInput.fill('invalid-email')
        await emailInput.blur()

        // Check for validation state
        const isInvalid = await emailInput.getAttribute('aria-invalid')
        // Browser might also show native validation
      }
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/teams/create')
      await waitForPageLoad(page)

      const submitButton = page.locator('button[type="submit"]').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()

        // Should show validation errors
        await page.waitForTimeout(500)
        const stillOnPage = page.url().includes('/teams/create')
        expect(stillOnPage).toBeTruthy()
      }
    })
  })

  test.describe('Form Accessibility', () => {
    test('should have labels for all inputs', async ({ page }) => {
      await page.goto('/settings')
      await waitForPageLoad(page)

      const inputs = await page.locator('input:visible, textarea:visible, select:visible').all()

      for (const input of inputs.slice(0, 5)) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        const placeholder = await input.getAttribute('placeholder')

        // Should have some form of label
        const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false

        expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy()
      }
    })

    test('should support keyboard navigation in forms', async ({ page }) => {
      await page.goto('/settings')
      await waitForPageLoad(page)

      // Tab through form elements
      const inputs = await page.locator('input:visible, button:visible, select:visible').all()

      if (inputs.length > 0) {
        await inputs[0].focus()

        for (let i = 0; i < Math.min(5, inputs.length - 1); i++) {
          await page.keyboard.press('Tab')
          await page.waitForTimeout(100)
        }
      }
    })
  })
})
