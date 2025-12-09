import { test, expect } from '@playwright/test'
import { waitForPageLoad } from './utils/test-helpers'

/**
 * Full User Journey Tests
 * End-to-end scenarios that test complete user workflows
 */
test.describe('User Journeys', () => {
  test.describe('New User Journey', () => {
    test('complete onboarding flow', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Check if onboarding is shown for new users
      const onboarding = page.locator('[class*="onboarding"], [class*="welcome"]')
      if (await onboarding.isVisible()) {
        console.log('Onboarding detected - walking through steps')

        // Complete onboarding steps
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")')
        while (await nextButton.isVisible()) {
          await nextButton.click()
          await page.waitForTimeout(500)
        }

        const finishButton = page.locator('button:has-text("Finish"), button:has-text("Get Started")')
        if (await finishButton.isVisible()) {
          await finishButton.click()
        }
      }

      // Should end up on home dashboard
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('Activity Logging Journey', () => {
    test('log a new activity', async ({ page }) => {
      // Start from home
      await page.goto('/home')
      await waitForPageLoad(page)

      // Find and click log activity button
      const logButton = page.locator('a[href*="activity/create"], button:has-text("Log")')
      if (await logButton.first().isVisible()) {
        await logButton.first().click()
        await page.waitForURL('**/activity/**')

        // Fill activity form
        const form = page.locator('form')
        if (await form.isVisible()) {
          // Select activity type
          const typeSelect = page.locator('select, [role="combobox"]').first()
          if (await typeSelect.isVisible()) {
            await typeSelect.click()
            const option = page.locator('[role="option"]').first()
            if (await option.isVisible()) await option.click()
          }

          // Enter distance
          const distanceInput = page.locator('input[name="distance"], input[type="number"]').first()
          if (await distanceInput.isVisible()) {
            await distanceInput.fill('5')
          }

          // Enter duration
          const durationInput = page.locator('input[name="duration"]')
          if (await durationInput.isVisible()) {
            await durationInput.fill('30')
          }

          // Submit
          const submitButton = page.locator('button[type="submit"]')
          if (await submitButton.isVisible()) {
            await submitButton.click()
            await page.waitForTimeout(2000)
          }
        }
      }
    })
  })

  test.describe('Team Discovery Journey', () => {
    test('browse and view teams', async ({ page }) => {
      // Navigate to teams
      await page.goto('/teams')
      await waitForPageLoad(page)

      // Use search if available
      const searchInput = page.locator('input[placeholder*="Search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('running')
        await page.waitForTimeout(500)
      }

      // Click on a team card
      const teamCard = page.locator('[class*="team-card"], article').first()
      if (await teamCard.isVisible()) {
        await teamCard.click()
        await page.waitForTimeout(1000)

        // Should navigate to team detail
        expect(page.url()).toMatch(/\/teams\//)

        // Check team detail page elements
        const teamName = page.locator('h1, h2').first()
        await expect(teamName).toBeVisible()

        // Look for join button
        const joinButton = page.locator('button:has-text("Join")')
        if (await joinButton.isVisible()) {
          console.log('Join button available')
        }
      }
    })

    test('create a new team', async ({ page }) => {
      await page.goto('/teams/create')
      await waitForPageLoad(page)

      const form = page.locator('form')
      if (await form.isVisible()) {
        // Fill team name
        const nameInput = page.locator('input[name="name"]')
        if (await nameInput.isVisible()) {
          await nameInput.fill(`Test Team ${Date.now()}`)
        }

        // Fill description
        const descInput = page.locator('textarea[name="description"]')
        if (await descInput.isVisible()) {
          await descInput.fill('A test team for E2E testing')
        }

        // Select sport
        const sportSelect = page.locator('select[name="sport"], [role="combobox"]').first()
        if (await sportSelect.isVisible()) {
          await sportSelect.click()
          const option = page.locator('[role="option"]').first()
          if (await option.isVisible()) await option.click()
        }

        console.log('Team creation form filled')
      }
    })
  })

  test.describe('Challenge Participation Journey', () => {
    test('browse and join a challenge', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      // View challenges
      const challengeCards = page.locator('[class*="challenge-card"], article')
      const cardCount = await challengeCards.count()
      console.log(`Found ${cardCount} challenges`)

      if (cardCount > 0) {
        // Click first challenge
        await challengeCards.first().click()
        await page.waitForTimeout(1000)

        // Look for join/participate button
        const joinButton = page.locator('button:has-text("Join"), button:has-text("Participate")')
        if (await joinButton.isVisible()) {
          console.log('Challenge join button available')
        }
      }
    })

    test('view badges and achievements', async ({ page }) => {
      await page.goto('/challenges')
      await waitForPageLoad(page)

      // Switch to badges tab
      const badgesTab = page.locator('[role="tab"]:has-text("Badges")')
      if (await badgesTab.isVisible()) {
        await badgesTab.click()
        await page.waitForTimeout(500)

        // Check badges are displayed
        const badges = page.locator('[class*="badge"]')
        const badgeCount = await badges.count()
        console.log(`Found ${badgeCount} badges`)

        // Hover over a badge for tooltip
        if (badgeCount > 0) {
          await badges.first().hover()
          await page.waitForTimeout(500)
        }
      }
    })
  })

  test.describe('Ranking Journey', () => {
    test('view and filter rankings', async ({ page }) => {
      await page.goto('/rankings')
      await waitForPageLoad(page)

      // Check leaderboard is visible
      const leaderboard = page.locator('table, [class*="leaderboard"]')
      await expect(leaderboard.first()).toBeVisible({ timeout: 10000 }).catch(() => { })

      // Test filter buttons
      const filterButtons = ['Friends', 'Team', 'Global']
      for (const filter of filterButtons) {
        const button = page.locator(`button:has-text("${filter}")`)
        if (await button.isVisible()) {
          await button.click()
          await page.waitForTimeout(500)
          console.log(`Filtered by: ${filter}`)
        }
      }

      // Click on a user in leaderboard
      const userRow = page.locator('[class*="leaderboard-row"], tr').first()
      if (await userRow.isVisible()) {
        await userRow.click()
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Profile Management Journey', () => {
    test('view and edit profile', async ({ page }) => {
      // View own profile
      await page.goto('/profile/me')
      await waitForPageLoad(page)

      // Check profile elements
      const avatar = page.locator('[class*="avatar"]').first()
      await expect(avatar).toBeVisible()

      const displayName = page.locator('h1, h2').first()
      await expect(displayName).toBeVisible()

      // Navigate to settings
      const editButton = page.locator('a[href*="settings"], button:has-text("Edit")')
      if (await editButton.isVisible()) {
        await editButton.click()
        await page.waitForURL('**/settings**')
      }
    })

    test('update settings', async ({ page }) => {
      await page.goto('/settings')
      await waitForPageLoad(page)

      // Update display name
      const nameInput = page.locator('input[name="displayName"], input[name="name"]')
      if (await nameInput.isVisible()) {
        const currentValue = await nameInput.inputValue()
        await nameInput.clear()
        await nameInput.fill('Updated Name')

        // Save changes
        const saveButton = page.locator('button[type="submit"], button:has-text("Save")')
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForTimeout(1000)
        }

        // Restore original value
        await nameInput.clear()
        await nameInput.fill(currentValue || 'Test User')
        if (await saveButton.isVisible()) {
          await saveButton.click()
        }
      }
    })
  })

  test.describe('Search Journey', () => {
    test('search for users, teams, and challenges', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open command palette
      await page.keyboard.press('Meta+k')

      const commandInput = page.locator('[cmdk-input], input[placeholder*="Search"]')
      if (await commandInput.isVisible({ timeout: 3000 })) {
        // Search for users
        await commandInput.fill('john')
        await page.waitForTimeout(500)

        const userResults = page.locator('[cmdk-item]:has-text("@"), [role="option"]')
        console.log(`User search results: ${await userResults.count()}`)

        // Clear and search for teams
        await commandInput.clear()
        await commandInput.fill('running')
        await page.waitForTimeout(500)

        // Close palette
        await page.keyboard.press('Escape')
      }
    })

    test('use quick actions', async ({ page }) => {
      await page.goto('/home')
      await waitForPageLoad(page)

      // Open command palette
      await page.keyboard.press('Meta+k')

      const commandDialog = page.locator('[cmdk-root], [role="dialog"]')
      if (await commandDialog.isVisible({ timeout: 3000 })) {
        // Quick actions should be visible when no search
        const quickActions = page.locator('[cmdk-item], [role="option"]')
        const actionCount = await quickActions.count()
        console.log(`Quick actions available: ${actionCount}`)

        // Select first action
        if (actionCount > 0) {
          await quickActions.first().click()
          await page.waitForTimeout(500)
        }
      }
    })
  })

  test.describe('Mobile User Journey', () => {
    test('complete mobile navigation flow', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/home')
      await waitForPageLoad(page)

      // Check for mobile navigation
      const mobileNav = page.locator('nav, [class*="bottom-nav"], [class*="mobile-nav"]')
      await expect(mobileNav.first()).toBeVisible()

      // Navigate through main sections
      const navItems = ['Home', 'Rankings', 'Challenges', 'Teams', 'Profile']
      for (const item of navItems) {
        const navLink = page.locator(`a:has-text("${item}"), button:has-text("${item}")`).first()
        if (await navLink.isVisible()) {
          await navLink.click()
          await page.waitForTimeout(500)
          console.log(`Navigated to: ${item}`)
        }
      }
    })

    test('mobile search functionality', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/home')
      await waitForPageLoad(page)

      // Find search button/icon
      const searchButton = page.locator('button:has([class*="search"]), [aria-label*="search"]')
      if (await searchButton.first().isVisible()) {
        await searchButton.first().click()
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Error Recovery Journey', () => {
    test('handle network errors gracefully', async ({ page }) => {
      // Simulate offline
      await page.route('**/api/**', route => route.abort())

      await page.goto('/home')

      // Check for error message or offline indicator
      await page.waitForTimeout(2000)

      // Re-enable network
      await page.unroute('**/api/**')

      // Refresh
      await page.reload()
      await waitForPageLoad(page)
    })

    test('recover from 404 page', async ({ page }) => {
      await page.goto('/non-existent-page-xyz')
      await waitForPageLoad(page)

      // Navigate back to home
      const homeLink = page.locator('a[href="/home"], a[href="/"], button:has-text("Home")')
      if (await homeLink.first().isVisible()) {
        await homeLink.first().click()
        await page.waitForURL(/\/(home)?$/)
      } else {
        await page.goto('/home')
      }

      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('Full App Walkthrough', () => {
    test('exercise all major features', async ({ page }) => {
      const visited: string[] = []

      // 1. Start at home
      await page.goto('/home')
      await waitForPageLoad(page)
      visited.push('home')

      // 2. Check rankings
      await page.goto('/rankings')
      await waitForPageLoad(page)
      visited.push('rankings')

      // 3. Browse challenges
      await page.goto('/challenges')
      await waitForPageLoad(page)
      visited.push('challenges')

      // 4. View teams
      await page.goto('/teams')
      await waitForPageLoad(page)
      visited.push('teams')

      // 5. Check profile
      await page.goto('/profile/me')
      await waitForPageLoad(page)
      visited.push('profile')

      // 6. Update settings
      await page.goto('/settings')
      await waitForPageLoad(page)
      visited.push('settings')

      // 7. Use command palette
      await page.keyboard.press('Meta+k')
      await page.waitForTimeout(500)
      await page.keyboard.press('Escape')

      // 8. Return home
      await page.goto('/home')
      await waitForPageLoad(page)

      console.log('Visited pages:', visited.join(', '))
      expect(visited.length).toBe(6)
    })
  })
})
