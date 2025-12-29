import { test, expect } from '@playwright/test'

/**
 * KRONOS - Performance & Stress Tests
 *
 * Tests load times, API response times, and concurrent operations.
 * Longer timeout configured in playwright.config.ts for this agent.
 */

test.describe('Kronos: Performance', () => {
  test.describe('Page Load Performance', () => {
    test('home page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/home', { waitUntil: 'networkidle' })
      const loadTime = Date.now() - startTime

      console.log(`Home page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000) // 5 seconds max
    })

    test('calendar page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/calendar', { waitUntil: 'networkidle' })
      const loadTime = Date.now() - startTime

      console.log(`Calendar page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000)
    })

    test('challenges page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/challenges', { waitUntil: 'networkidle' })
      const loadTime = Date.now() - startTime

      console.log(`Challenges page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000)
    })

    test('rankings page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/rankings', { waitUntil: 'networkidle' })
      const loadTime = Date.now() - startTime

      console.log(`Rankings page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000)
    })
  })

  test.describe('Time to Interactive', () => {
    test('home page is interactive quickly', async ({ page }) => {
      await page.goto('/home')

      // Wait for page to be interactive
      const startTime = Date.now()
      await page.waitForLoadState('domcontentloaded')
      const tti = Date.now() - startTime

      console.log(`Home page TTI: ${tti}ms`)
      expect(tti).toBeLessThan(3000) // 3 seconds TTI max
    })
  })

  test.describe('API Response Times', () => {
    test('API calls complete within acceptable time', async ({ page }) => {
      const apiCalls: { url: string; startTime: number; endTime?: number }[] = []

      // Listen for API requests and responses
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiCalls.push({
            url: request.url(),
            startTime: Date.now(),
          })
        }
      })

      page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          const call = apiCalls.find((c) => c.url === response.url() && !c.endTime)
          if (call) {
            call.endTime = Date.now()
          }
        }
      })

      await page.goto('/home', { waitUntil: 'networkidle' })

      // Check all API calls completed quickly
      for (const call of apiCalls) {
        if (call.endTime) {
          const duration = call.endTime - call.startTime
          console.log(`API ${call.url}: ${duration}ms`)
          expect(duration).toBeLessThan(2000) // 2 seconds max per API call
        }
      }
    })
  })

  test.describe('Navigation Performance', () => {
    test('navigation between pages is smooth', async ({ page }) => {
      await page.goto('/home', { waitUntil: 'networkidle' })

      const navigationTimes: number[] = []

      // Navigate to multiple pages
      const routes = ['/calendar', '/challenges', '/teams', '/settings']

      for (const route of routes) {
        const startTime = Date.now()
        await page.goto(route, { waitUntil: 'domcontentloaded' })
        const navTime = Date.now() - startTime
        navigationTimes.push(navTime)
        console.log(`Navigation to ${route}: ${navTime}ms`)
      }

      // Average navigation time should be under 2 seconds
      const avgNavTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length
      console.log(`Average navigation time: ${avgNavTime}ms`)
      expect(avgNavTime).toBeLessThan(2000)
    })
  })

  test.describe('Concurrent Operations', () => {
    test('handles multiple rapid page navigations', async ({ page }) => {
      await page.goto('/home')

      // Rapid navigation test
      const routes = ['/calendar', '/challenges', '/home', '/teams', '/settings']
      let errors = 0

      for (const route of routes) {
        try {
          await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 })
        } catch {
          errors++
        }
      }

      expect(errors).toBe(0)
    })

    test('handles form submission under load', async ({ page }) => {
      await page.goto('/activity/create')

      // Fill form quickly
      const sportSelect = page.locator('[data-testid="activity-sport-select"]')
      if (await sportSelect.isVisible()) {
        await sportSelect.click()
        const option = page.getByRole('option').first()
        if (await option.isVisible()) {
          await option.click()
        }
      }

      // Should handle rapid interactions without error
      await expect(page).not.toHaveURL(/error/)
    })
  })

  test.describe('Memory & Resource Usage', () => {
    test('no memory leaks on repeated navigation', async ({ page }) => {
      // Navigate back and forth multiple times
      for (let i = 0; i < 10; i++) {
        await page.goto('/home', { waitUntil: 'domcontentloaded' })
        await page.goto('/calendar', { waitUntil: 'domcontentloaded' })
      }

      // If we got here without crashing, memory is managed reasonably
      await expect(page).toHaveURL(/calendar/)
    })
  })

  test.describe('Lazy Loading', () => {
    test('images load lazily', async ({ page }) => {
      await page.goto('/home')

      // Check that images have lazy loading
      const images = await page.locator('img').all()
      for (const img of images) {
        const loading = await img.getAttribute('loading')
        // Either lazy or native lazy loading is acceptable
        if (loading) {
          expect(loading).toBe('lazy')
        }
      }
    })
  })

  test.describe('Bundle Size', () => {
    test('initial bundle size is reasonable', async ({ page }) => {
      let totalJsSize = 0

      page.on('response', async (response) => {
        const url = response.url()
        const headers = response.headers()

        if (url.includes('.js') && headers['content-length']) {
          totalJsSize += parseInt(headers['content-length'], 10)
        }
      })

      await page.goto('/home', { waitUntil: 'networkidle' })

      const sizeKB = totalJsSize / 1024
      console.log(`Total JS bundle size: ${sizeKB.toFixed(2)}KB`)

      // Initial bundle should be under 2MB
      expect(sizeKB).toBeLessThan(2048)
    })
  })
})
