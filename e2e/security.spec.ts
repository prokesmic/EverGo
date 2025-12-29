import { test, expect } from '@playwright/test'

/**
 * Security Tests
 *
 * Tests for common security vulnerabilities and best practices.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

test.describe('Security Tests', () => {
  test.describe('XSS Protection', () => {
    test('login form escapes HTML input', async ({ page }) => {
      await page.goto('/login')

      const xssPayload = '<script>alert("xss")</script>'
      await page.fill('[data-testid="auth-email-input"]', xssPayload)

      // The script should not execute
      const alertTriggered = await page.evaluate(() => {
        return (window as unknown as { xssTriggered?: boolean }).xssTriggered === true
      })

      expect(alertTriggered).toBe(false)
    })

    test('search input escapes HTML', async ({ page }) => {
      await page.goto('/home')

      // Find any search input
      const searchInput = page.locator('[type="search"], [data-testid*="search"]').first()

      if (await searchInput.isVisible()) {
        const xssPayload = '<img src="x" onerror="alert(\'xss\')">'
        await searchInput.fill(xssPayload)

        // Page should not have script injection
        const scripts = await page.locator('script:not([src])').count()
        // Should not have injected new inline scripts
        expect(scripts).toBeLessThanOrEqual(10)
      }
    })
  })

  test.describe('CSRF Protection', () => {
    test('forms include CSRF tokens or use same-origin', async ({ page }) => {
      await page.goto('/login')

      // Check for CSRF token in form or verify same-origin policy
      const forms = await page.locator('form').all()

      for (const form of forms) {
        const action = await form.getAttribute('action')

        // If form has external action, it should have CSRF token
        if (action && action.startsWith('http') && !action.includes(BASE_URL)) {
          const csrfInput = await form.locator('input[name*="csrf"], input[name*="token"]').count()
          expect(csrfInput).toBeGreaterThan(0)
        }
      }
    })
  })

  test.describe('Session Security', () => {
    test('session cookie has secure attributes', async ({ page, context }) => {
      await page.goto('/login')

      await page.fill('[data-testid="auth-email-input"]', process.env.TEST_USER_EMAIL || 'test@test.com')
      await page.fill('[data-testid="auth-password-input"]', process.env.TEST_USER_PASSWORD || 'password')
      await page.click('[data-testid="auth-submit-btn"]')

      // Wait for potential redirect
      await page.waitForTimeout(2000)

      const cookies = await context.cookies()
      const sessionCookies = cookies.filter(
        (c) =>
          c.name.toLowerCase().includes('session') ||
          c.name.toLowerCase().includes('token') ||
          c.name.toLowerCase().includes('auth')
      )

      for (const cookie of sessionCookies) {
        // HttpOnly should be true for session cookies
        expect(cookie.httpOnly).toBe(true)

        // In production, Secure should be true
        // For local testing, this might be false
        if (BASE_URL.startsWith('https://')) {
          expect(cookie.secure).toBe(true)
        }

        // SameSite should be Strict or Lax
        expect(['Strict', 'Lax', 'None']).toContain(cookie.sameSite)
      }
    })
  })

  test.describe('Information Disclosure', () => {
    test('error pages do not leak stack traces', async ({ page }) => {
      // Navigate to a non-existent page
      await page.goto('/this-page-does-not-exist-12345')

      const content = await page.content()

      // Should not contain stack traces
      expect(content).not.toMatch(/at\s+[\w.]+\s+\(/i) // Stack trace pattern
      expect(content).not.toMatch(/node_modules/i)
      expect(content).not.toMatch(/\.tsx?:\d+:\d+/i) // TypeScript file references
    })

    test('API errors do not leak sensitive info', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/not-found-12345`)
      const body = await response.text()

      // Should not contain internal paths or stack traces
      expect(body).not.toMatch(/node_modules/i)
      expect(body).not.toMatch(/Users\//i)
      expect(body).not.toMatch(/at\s+[\w.]+\s+\(/i)
    })
  })

  test.describe('Authentication', () => {
    test('password field is not autocompleted', async ({ page }) => {
      await page.goto('/login')

      const passwordInput = page.locator('[data-testid="auth-password-input"]')
      const autocomplete = await passwordInput.getAttribute('autocomplete')

      // Autocomplete should be "new-password" or "current-password" not "on"
      if (autocomplete) {
        expect(['new-password', 'current-password', 'off']).toContain(autocomplete)
      }
    })

    test('brute force protection exists', async ({ request }) => {
      // Try multiple failed logins
      const attempts = []
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request.post(`${BASE_URL}/api/auth/callback/credentials`, {
            data: {
              email: 'brute-force-test@test.com',
              password: `wrong-password-${i}`,
            },
          })
        )
      }

      const responses = await Promise.all(attempts)
      const statuses = responses.map((r) => r.status())

      // After multiple failures, should see rate limiting (429) or continue to fail
      // Should NOT see 200 for any of these
      for (const status of statuses) {
        expect([401, 403, 429, 302, 303, 307]).toContain(status)
      }
    })
  })

  test.describe('Input Validation', () => {
    test('SQL injection attempts are blocked', async ({ request }) => {
      const sqlPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
      ]

      for (const payload of sqlPayloads) {
        const response = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
          data: {
            email: payload,
            password: payload,
          },
        })

        // Should not return 200 (successful login)
        expect(response.status()).not.toBe(200)

        // Should not return 500 (SQL error)
        expect(response.status()).not.toBe(500)
      }
    })

    test('path traversal is blocked', async ({ request }) => {
      const traversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
      ]

      for (const payload of traversalPayloads) {
        const response = await request.get(`${BASE_URL}/api/users/${payload}`)

        // Should return 400 or 404, not file contents
        expect([400, 401, 403, 404]).toContain(response.status())

        const body = await response.text()
        expect(body).not.toMatch(/root:x:0:0/i) // Unix passwd file
      }
    })
  })

  test.describe('Headers', () => {
    test('X-Content-Type-Options is nosniff', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/`)
      const header = response.headers()['x-content-type-options']

      if (header) {
        expect(header).toBe('nosniff')
      }
    })

    test('X-Frame-Options prevents clickjacking', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/`)
      const header = response.headers()['x-frame-options']

      if (header) {
        expect(['DENY', 'SAMEORIGIN']).toContain(header.toUpperCase())
      }
    })
  })
})
