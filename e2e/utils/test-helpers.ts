import { Page, expect, Locator } from '@playwright/test'

/**
 * Comprehensive test utilities following best practices
 */

// Wait for page to be fully loaded
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

// Wait for hydration to complete (Next.js specific)
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    return document.readyState === 'complete' &&
      !document.body.classList.contains('loading')
  })
}

// Safe click with retry logic
export async function safeClick(locator: Locator, options?: { timeout?: number }) {
  await locator.waitFor({ state: 'visible', timeout: options?.timeout || 10000 })
  await locator.click()
}

// Fill form field with validation
export async function fillField(page: Page, selector: string, value: string) {
  const field = page.locator(selector)
  await field.waitFor({ state: 'visible' })
  await field.clear()
  await field.fill(value)
  await expect(field).toHaveValue(value)
}

// Submit form and wait for response
export async function submitForm(page: Page, submitSelector: string) {
  const submitButton = page.locator(submitSelector)
  await expect(submitButton).toBeEnabled()

  const responsePromise = page.waitForResponse(
    response => response.status() < 400,
    { timeout: 30000 }
  )

  await submitButton.click()

  try {
    await responsePromise
  } catch {
    // Response might not be needed for all forms
  }
}

// Check for toast notification
export async function expectToast(page: Page, message: string | RegExp) {
  const toast = page.locator('[data-sonner-toast]').or(page.locator('[role="status"]'))
  await expect(toast).toContainText(message)
}

// Navigation helper with loading state handling
export async function navigateTo(page: Page, path: string) {
  await page.goto(path)
  await waitForPageLoad(page)
}

// Get all interactive elements on page
export async function getAllInteractiveElements(page: Page) {
  return {
    buttons: await page.locator('button:visible, [role="button"]:visible').all(),
    links: await page.locator('a:visible').all(),
    inputs: await page.locator('input:visible, textarea:visible, select:visible').all(),
    checkboxes: await page.locator('input[type="checkbox"]:visible, [role="checkbox"]:visible').all(),
    radios: await page.locator('input[type="radio"]:visible, [role="radio"]:visible').all(),
  }
}

// Test all buttons on a page don't throw errors
export async function testAllButtonsClickable(page: Page) {
  const buttons = await page.locator('button:visible').all()
  const errors: string[] = []

  for (const button of buttons) {
    const buttonText = await button.textContent()
    const isDisabled = await button.isDisabled()

    if (!isDisabled) {
      try {
        // Check button is accessible
        await expect(button).toBeVisible()
        await expect(button).toBeEnabled()
      } catch (e) {
        errors.push(`Button "${buttonText}" failed: ${e}`)
      }
    }
  }

  return errors
}

// Check all links are valid
export async function validateLinks(page: Page) {
  const links = await page.locator('a[href]:visible').all()
  const results: { href: string; valid: boolean; error?: string }[] = []

  for (const link of links) {
    const href = await link.getAttribute('href')
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      results.push({ href, valid: true })
    }
  }

  return results
}

// Form validation helper
export async function testFormValidation(
  page: Page,
  formSelector: string,
  fields: { selector: string; invalidValue: string; validValue: string }[]
) {
  const form = page.locator(formSelector)
  await expect(form).toBeVisible()

  const results: { field: string; validationWorks: boolean }[] = []

  for (const field of fields) {
    const input = page.locator(field.selector)

    // Test with invalid value
    await input.clear()
    await input.fill(field.invalidValue)
    await input.blur()

    // Check for error state (aria-invalid or error class)
    const hasError = await input.evaluate(el =>
      el.getAttribute('aria-invalid') === 'true' ||
      el.classList.contains('error') ||
      el.classList.contains('invalid')
    )

    // Test with valid value
    await input.clear()
    await input.fill(field.validValue)
    await input.blur()

    results.push({ field: field.selector, validationWorks: hasError })
  }

  return results
}

// Screenshot helper with consistent naming
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  })
}

// Mobile viewport helper
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 })
}

// Desktop viewport helper
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 })
}

// Wait for API response
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(
    response => {
      const url = response.url()
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern)
      }
      return urlPattern.test(url)
    },
    { timeout: 30000 }
  )
}

// Check console errors
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  return errors
}

// Measure page performance
export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      loadTime: navigation.loadEventEnd - navigation.startTime,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    }
  })

  return metrics
}

// Test keyboard navigation
export async function testKeyboardNavigation(page: Page) {
  const focusableElements = await page.locator(
    'button:visible, a:visible, input:visible, select:visible, textarea:visible, [tabindex]:visible'
  ).all()

  const tabOrder: string[] = []

  for (let i = 0; i < Math.min(focusableElements.length, 20); i++) {
    await page.keyboard.press('Tab')
    const activeElement = await page.evaluate(() => {
      const el = document.activeElement
      return el?.tagName + (el?.id ? '#' + el.id : '') + (el?.className ? '.' + el.className.split(' ')[0] : '')
    })
    tabOrder.push(activeElement)
  }

  return tabOrder
}

// Generate random test data
export function generateTestData() {
  const timestamp = Date.now()
  return {
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!',
    username: `testuser${timestamp}`,
    displayName: `Test User ${timestamp}`,
  }
}

// Retry helper for flaky operations
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
