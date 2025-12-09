import { test, expect } from '@playwright/test'
import { waitForPageLoad } from './utils/test-helpers'

/**
 * Visual Regression Tests
 * Screenshots for visual comparison and regression detection
 */
test.describe('Visual Regression', () => {
  test.describe('Page Screenshots', () => {
    test('home page visual', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Wait for any animations to complete
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('home-page.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('rankings page visual', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('rankings-page.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('challenges page visual', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('challenges-page.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('teams page visual', async ({ page }) => {
      await page.goto('/teams')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('teams-page.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('profile page visual', async ({ page }) => {
      await page.goto('/profile/me')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('profile-page.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('settings page visual', async ({ page }) => {
      await page.goto('/settings')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('settings-page.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Component Screenshots', () => {
    test('command palette visual', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      await page.keyboard.press('Meta+k')
      await page.waitForTimeout(500)

      const dialog = page.locator('[cmdk-root]').first()
      if (await dialog.isVisible()) {
        await expect(dialog).toHaveScreenshot('command-palette.png', {
          animations: 'disabled',
        })
      }
    })

    test('ranking card visual', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const rankingCard = page.locator('[class*="rank"], [class*="ranking"]').first()
      if (await rankingCard.isVisible()) {
        await expect(rankingCard).toHaveScreenshot('ranking-card.png', {
          animations: 'disabled',
        })
      }
    })

    test('challenge card visual', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      const challengeCard = page.locator('[class*="challenge-card"], article').first()
      if (await challengeCard.isVisible()) {
        await expect(challengeCard).toHaveScreenshot('challenge-card.png', {
          animations: 'disabled',
        })
      }
    })

    test('team card visual', async ({ page }) => {
      await page.goto('/teams')
      await waitForPageLoad(page)

      const teamCard = page.locator('[class*="team-card"], article').first()
      if (await teamCard.isVisible()) {
        await expect(teamCard).toHaveScreenshot('team-card.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Responsive Screenshots', () => {
    test('home page mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/home')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('home-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('home page tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/home')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('home-tablet.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('rankings page mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/rankings')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('rankings-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test('challenges page mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/challenges')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('challenges-mobile.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('State Screenshots', () => {
    test('button hover state', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const button = page.locator('button:visible').first()
      if (await button.isVisible()) {
        await button.hover()
        await page.waitForTimeout(200)

        await expect(button).toHaveScreenshot('button-hover.png', {
          animations: 'disabled',
        })
      }
    })

    test('button focus state', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      const button = page.locator('button:visible').first()
      if (await button.isVisible()) {
        await button.focus()

        await expect(button).toHaveScreenshot('button-focus.png', {
          animations: 'disabled',
        })
      }
    })

    test('input focus state', async ({ page }) => {
      await page.goto('/settings')
      await waitForPageLoad(page)

      const input = page.locator('input:visible').first()
      if (await input.isVisible()) {
        await input.focus()

        await expect(input).toHaveScreenshot('input-focus.png', {
          animations: 'disabled',
        })
      }
    })

    test('dropdown open state', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)

      const dropdown = page.locator('[role="combobox"]').first()
      if (await dropdown.isVisible()) {
        await dropdown.click()
        await page.waitForTimeout(300)

        // Screenshot the dropdown area
        const dropdownContainer = page.locator('[role="listbox"]').first()
        if (await dropdownContainer.isVisible()) {
          await expect(dropdownContainer).toHaveScreenshot('dropdown-open.png', {
            animations: 'disabled',
          })
        }
      }
    })
  })

  test.describe('Empty State Screenshots', () => {
    test('teams empty state', async ({ page }) => {
      await page.goto('/teams')
      await waitForPageLoad(page)

      const emptyState = page.locator('[class*="empty"], .empty-state')
      if (await emptyState.isVisible()) {
        await expect(emptyState).toHaveScreenshot('teams-empty.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Dark Mode Screenshots', () => {
    test.skip('home page dark mode', async ({ page }) => {
      // Set dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' })

      await page.goto('/home')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('home-dark.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })

    test.skip('rankings page dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })

      await page.goto('/rankings')
      await waitForPageLoad(page)
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('rankings-dark.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Loading State Screenshots', () => {
    test.skip('skeleton loading state', async ({ page }) => {
      // Slow down API responses to capture loading state
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await route.continue()
      })

      await page.goto('/home')

      // Capture immediately before data loads
      await expect(page).toHaveScreenshot('home-loading.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })
})
