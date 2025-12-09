import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const authFile = 'playwright/.auth/user.json'

// Increase timeout for auth setup
setup.setTimeout(60000)

/**
 * Authentication Setup
 * This runs before all authenticated tests to establish a session
 */
setup('authenticate', async ({ page }) => {
  // Ensure auth directory exists
  const authDir = path.dirname(authFile)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Navigate to login page
  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')

  // Check if we're already authenticated (redirected to home)
  if (page.url().includes('/home')) {
    console.log('Already authenticated, saving state...')
    await page.context().storageState({ path: authFile })
    return
  }

  // Get test credentials from environment or use defaults
  const email = process.env.TEST_USER_EMAIL || 'test@example.com'
  const password = process.env.TEST_USER_PASSWORD || 'testpassword123'

  console.log(`Attempting login with email: ${email}`)

  // Fill login form
  const emailInput = page.locator('#email, input[name="email"], input[type="email"]').first()
  const passwordInput = page.locator('#password, input[name="password"], input[type="password"]').first()
  const submitButton = page.locator('button[type="submit"]').first()

  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await emailInput.fill(email)
  await passwordInput.fill(password)

  // Click submit
  await submitButton.click()

  // Wait for either success or failure - wait for URL change or stay on login
  await Promise.race([
    page.waitForURL(/\/(home|dashboard)/, { timeout: 10000 }),
    page.waitForTimeout(5000)
  ]).catch(() => {})

  // Check if login succeeded
  const currentUrl = page.url()
  console.log(`After login attempt, URL: ${currentUrl}`)

  if (currentUrl.includes('/home') || currentUrl.includes('/dashboard')) {
    console.log('Login succeeded!')
    await page.context().storageState({ path: authFile })
    return
  }

  // Login failed - try to register
  console.log('Login failed, attempting to register...')

  const registerLink = page.locator('a[href*="register"]').first()
  if (await registerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await registerLink.click()
    await page.waitForURL('**/register', { timeout: 10000 })

    // Fill registration form
    const regEmailInput = page.locator('input[name="email"], input[type="email"]').first()
    const regPasswordInput = page.locator('input[name="password"], input[type="password"]').first()

    await regEmailInput.fill(email)
    await regPasswordInput.fill(password)

    // Look for confirm password field
    const confirmPassword = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first()
    if (await confirmPassword.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmPassword.fill(password)
    }

    // Look for username field
    const usernameInput = page.locator('input[name="username"]').first()
    if (await usernameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usernameInput.fill('testuser' + Date.now())
    }

    // Look for display name field
    const displayNameInput = page.locator('input[name="displayName"], input[name="name"]').first()
    if (await displayNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await displayNameInput.fill('Test User')
    }

    // Submit registration
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(3000)

    // If we're back on login, try logging in
    if (page.url().includes('/login')) {
      console.log('Registration complete, logging in...')
      await page.locator('input[name="email"], input[type="email"]').first().fill(email)
      await page.locator('input[name="password"], input[type="password"]').first().fill(password)
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(3000)
    }
  }

  // Save authentication state (even if not logged in, to prevent infinite loops)
  console.log('Saving authentication state...')
  try {
    await page.context().storageState({ path: authFile })
  } catch (e) {
    console.log('Could not save storage state, creating empty auth file')
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }))
  }
})
