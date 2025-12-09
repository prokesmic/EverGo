import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Login Page Object
 */
export class LoginPage extends BasePage {
  readonly url = '/login'

  // Form elements
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly registerLink: Locator
  readonly forgotPasswordLink: Locator
  readonly errorMessage: Locator
  readonly googleButton: Locator
  readonly stravaButton: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.locator('input[name="email"], input[type="email"]')
    this.passwordInput = page.locator('input[name="password"], input[type="password"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.registerLink = page.locator('a[href*="register"]').first()
    this.forgotPasswordLink = page.locator('a[href*="forgot"]')
    this.errorMessage = page.locator('[role="alert"], .error-message, .text-destructive')
    this.googleButton = page.locator('button:has-text("Google")')
    this.stravaButton = page.locator('button:has-text("Strava")')
  }

  async waitForReady() {
    await super.waitForReady()
    await expect(this.emailInput).toBeVisible()
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async loginAndWaitForRedirect(email: string, password: string, expectedUrl: string = '/home') {
    await this.login(email, password)
    await this.page.waitForURL(`**${expectedUrl}`, { timeout: 15000 })
  }

  async expectError(message?: string | RegExp) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async goToRegister() {
    await this.registerLink.click()
    await this.page.waitForURL('**/register')
  }

  async testFormValidation() {
    // Empty submission
    await this.submitButton.click()
    await expect(this.emailInput).toHaveAttribute('aria-invalid', 'true').catch(() => { })

    // Invalid email
    await this.emailInput.fill('invalid-email')
    await this.passwordInput.fill('short')
    await this.submitButton.click()
  }
}
