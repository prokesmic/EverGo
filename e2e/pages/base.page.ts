import { Page, Locator, expect } from '@playwright/test'
import { waitForPageLoad, waitForHydration } from '../utils/test-helpers'

/**
 * Base Page Object - All page objects extend this
 * Implements common functionality and best practices
 */
export abstract class BasePage {
  readonly page: Page

  // Common UI elements
  readonly header: Locator
  readonly footer: Locator
  readonly loadingSpinner: Locator
  readonly toast: Locator
  readonly commandPalette: Locator
  readonly mobileNav: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('header').first()
    this.footer = page.locator('footer').first()
    this.loadingSpinner = page.locator('[data-loading="true"], .loading, .spinner')
    this.toast = page.locator('[data-sonner-toast]')
    this.commandPalette = page.locator('[cmdk-root]')
    this.mobileNav = page.locator('nav[data-mobile]').or(page.locator('.mobile-nav'))
  }

  // Abstract method - each page must define its URL
  abstract readonly url: string

  // Navigate to this page
  async goto() {
    await this.page.goto(this.url)
    await waitForPageLoad(this.page)
    await this.waitForReady()
  }

  // Wait for page-specific ready state
  async waitForReady() {
    await waitForHydration(this.page)
  }

  // Check page is loaded correctly
  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForReady()
      return true
    } catch {
      return false
    }
  }

  // Get page title
  async getTitle(): Promise<string> {
    return this.page.title()
  }

  // Get current URL
  getCurrentUrl(): string {
    return this.page.url()
  }

  // Open command palette (⌘K)
  async openCommandPalette() {
    await this.page.keyboard.press('Meta+k')
    await expect(this.commandPalette).toBeVisible()
  }

  // Close command palette
  async closeCommandPalette() {
    await this.page.keyboard.press('Escape')
    await expect(this.commandPalette).not.toBeVisible()
  }

  // Search via command palette
  async searchViaCommandPalette(query: string) {
    await this.openCommandPalette()
    await this.page.locator('[cmdk-input]').fill(query)
    await this.page.waitForTimeout(500) // Wait for search results
  }

  // Wait for loading to complete
  async waitForLoadingComplete() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => { })
  }

  // Check for toast message
  async expectToast(message: string | RegExp) {
    await expect(this.toast).toContainText(message)
  }

  // Take screenshot
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    })
  }

  // Get all visible buttons
  async getButtons(): Promise<Locator[]> {
    return this.page.locator('button:visible').all()
  }

  // Get all visible links
  async getLinks(): Promise<Locator[]> {
    return this.page.locator('a:visible').all()
  }

  // Get all form inputs
  async getInputs(): Promise<Locator[]> {
    return this.page.locator('input:visible, textarea:visible, select:visible').all()
  }

  // Click and wait for navigation
  async clickAndNavigate(locator: Locator, expectedUrl?: string) {
    await Promise.all([
      this.page.waitForURL(expectedUrl || /.*/),
      locator.click()
    ])
    await waitForPageLoad(this.page)
  }

  // Check for console errors
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = []
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    return errors
  }

  // Check accessibility basics
  async checkBasicAccessibility() {
    // Check for main landmark
    await expect(this.page.locator('main').first()).toBeVisible()

    // Check images have alt text
    const images = await this.page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const ariaHidden = await img.getAttribute('aria-hidden')
      expect(alt !== null || ariaHidden === 'true').toBeTruthy()
    }

    // Check buttons have accessible names
    const buttons = await this.page.locator('button:visible').all()
    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')
      expect(text || ariaLabel || ariaLabelledBy).toBeTruthy()
    }
  }
}
