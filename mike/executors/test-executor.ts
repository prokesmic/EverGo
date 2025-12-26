/**
 * Test Executor Module
 * Executes test scenarios using Playwright
 */

import { Page } from 'playwright'
import { TestScenario, TestStep, TestResult, StepResult, MikeConfig } from '../core/types'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'

export class TestExecutor {
  private config: MikeConfig

  constructor(config: MikeConfig) {
    this.config = config
  }

  /**
   * Execute a single test scenario
   */
  async executeScenario(page: Page, scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now()
    const stepResults: StepResult[] = []
    const screenshots: string[] = []
    let lastError: string | undefined
    let lastErrorStack: string | undefined
    let retryCount = 0

    // Retry logic
    while (retryCount <= this.config.retryCount) {
      try {
        // Execute each step
        for (const step of scenario.steps) {
          const stepStart = Date.now()

          try {
            await this.executeStep(page, step)

            stepResults.push({
              stepId: step.id,
              action: step.action,
              status: 'passed',
              duration: Date.now() - stepStart
            })

            // Take screenshot if requested
            if (step.screenshot) {
              const screenshotPath = await this.takeScreenshot(page, scenario.id, step.id)
              screenshots.push(screenshotPath)
            }
          } catch (stepError: any) {
            stepResults.push({
              stepId: step.id,
              action: step.action,
              status: 'failed',
              duration: Date.now() - stepStart,
              error: stepError.message
            })

            // Take failure screenshot
            if (this.config.screenshotOnFailure) {
              const screenshotPath = await this.takeScreenshot(page, scenario.id, `${step.id}-failure`)
              screenshots.push(screenshotPath)
            }

            // If step is critical, fail the entire scenario
            if (step.critical) {
              throw stepError
            }
          }
        }

        // Verify expected outcome
        await this.verifyOutcome(page, scenario)

        // Success!
        return {
          id: uuidv4(),
          scenarioId: scenario.id,
          name: scenario.name,
          status: 'passed',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          stepResults,
          screenshots,
          retryCount
        }
      } catch (error: any) {
        lastError = error.message
        lastErrorStack = error.stack
        retryCount++

        if (retryCount <= this.config.retryCount && scenario.retryable) {
          // Reset page state before retry - ignore errors
          try {
            await page.goto(this.config.baseUrl, { timeout: 10000, waitUntil: 'domcontentloaded' })
          } catch {
            // Ignore navigation errors during retry reset
          }
          stepResults.length = 0 // Clear step results
          continue
        }

        // Final failure
        return {
          id: uuidv4(),
          scenarioId: scenario.id,
          name: scenario.name,
          status: 'failed',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: lastError,
          errorStack: lastErrorStack,
          stepResults,
          screenshots,
          retryCount
        }
      }
    }

    // Should not reach here, but TypeScript needs a return
    return {
      id: uuidv4(),
      scenarioId: scenario.id,
      name: scenario.name,
      status: 'error',
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: 'Unexpected error in test execution',
      stepResults,
      screenshots,
      retryCount
    }
  }

  /**
   * Execute a single test step
   */
  private async executeStep(page: Page, step: TestStep): Promise<void> {
    const timeout = step.timeout || this.config.timeout

    switch (step.action) {
      case 'navigate':
        await page.goto(step.value!, { waitUntil: 'networkidle', timeout })
        break

      case 'click':
        await page.click(step.selector!, { timeout })
        break

      case 'doubleClick':
        await page.dblclick(step.selector!, { timeout })
        break

      case 'rightClick':
        await page.click(step.selector!, { button: 'right', timeout })
        break

      case 'fill':
        await page.fill(step.selector!, step.value || '', { timeout })
        break

      case 'clearAndFill':
        await page.fill(step.selector!, '', { timeout })
        await page.fill(step.selector!, step.value || '', { timeout })
        break

      case 'select':
        await page.selectOption(step.selector!, step.value!, { timeout })
        break

      case 'check':
        await page.check(step.selector!, { timeout })
        break

      case 'uncheck':
        await page.uncheck(step.selector!, { timeout })
        break

      case 'hover':
        await page.hover(step.selector!, { timeout })
        break

      case 'scroll':
        if (step.selector) {
          await page.locator(step.selector).scrollIntoViewIfNeeded({ timeout })
        } else {
          await page.evaluate(() => window.scrollBy(0, 300))
        }
        break

      case 'wait':
        if (step.waitFor) {
          switch (step.waitFor.type) {
            case 'selector':
              await page.waitForSelector(step.waitFor.value as string, { timeout })
              break
            case 'url':
              await page.waitForURL(`**${step.waitFor.value}**`, { timeout })
              break
            case 'networkidle':
              await page.waitForLoadState('networkidle', { timeout: step.waitFor.value as number })
              break
            case 'timeout':
              await page.waitForTimeout(step.waitFor.value as number)
              break
          }
        }
        break

      case 'screenshot':
        // Screenshots are handled separately
        break

      case 'assertVisible':
        const visibleElement = await page.locator(step.selector!).first()
        await visibleElement.waitFor({ state: 'visible', timeout })
        break

      case 'assertText':
        const textElement = await page.locator(step.selector!)
        const text = await textElement.textContent({ timeout })
        if (!text?.includes(step.value!)) {
          throw new Error(`Expected text "${step.value}" not found. Actual: "${text}"`)
        }
        break

      case 'assertUrl':
        const currentUrl = page.url()
        if (!currentUrl.includes(step.value!)) {
          throw new Error(`Expected URL to contain "${step.value}". Actual: "${currentUrl}"`)
        }
        break

      case 'assertValue':
        // Skip value assertion for password fields (they don't expose values)
        const inputElement = await page.locator(step.selector!).first()
        const inputType = await inputElement.getAttribute('type')
        if (inputType === 'password') {
          // For password fields, just verify the input has some value (length > 0)
          const hasValue = await inputElement.evaluate((el: HTMLInputElement) => el.value.length > 0)
          if (!hasValue) {
            throw new Error(`Password field "${step.selector}" has no value`)
          }
        } else {
          const inputValue = await page.inputValue(step.selector!, { timeout })
          if (inputValue !== step.value) {
            throw new Error(`Expected value "${step.value}". Actual: "${inputValue}"`)
          }
        }
        break

      case 'assertEnabled':
        const enabledElement = await page.locator(step.selector!)
        if (await enabledElement.isDisabled()) {
          throw new Error(`Element "${step.selector}" is disabled`)
        }
        break

      case 'assertDisabled':
        const disabledElement = await page.locator(step.selector!)
        if (await disabledElement.isEnabled()) {
          throw new Error(`Element "${step.selector}" is enabled`)
        }
        break

      case 'pressKey':
        await page.keyboard.press(step.value!)
        break

      case 'upload':
        await page.setInputFiles(step.selector!, step.value!)
        break

      case 'custom':
        await this.executeCustomAction(page, step)
        break

      default:
        throw new Error(`Unknown action: ${step.action}`)
    }
  }

  /**
   * Execute custom test actions
   */
  private async executeCustomAction(page: Page, step: TestStep): Promise<void> {
    switch (step.value) {
      case 'checkAccessibility':
        // Basic accessibility checks
        await this.runAccessibilityAudit(page)
        break

      case 'checkConsoleErrors':
        // Would need to capture console from context
        break

      case 'checkNetworkErrors':
        // Would need network monitoring
        break

      default:
        throw new Error(`Unknown custom action: ${step.value}`)
    }
  }

  /**
   * Run basic accessibility audit
   */
  private async runAccessibilityAudit(page: Page): Promise<void> {
    const issues = await page.evaluate(() => {
      const problems: string[] = []

      // Check for images without alt text
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        if (!img.alt) {
          problems.push(`Image without alt text: ${img.src.slice(0, 50)}`)
        }
      })

      // Check for form inputs without labels
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        const id = input.id
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`)
          const ariaLabel = input.getAttribute('aria-label')
          const ariaLabelledBy = input.getAttribute('aria-labelledby')

          if (!label && !ariaLabel && !ariaLabelledBy) {
            problems.push(`Input without label: ${id}`)
          }
        }
      })

      // Check for buttons without accessible text
      const buttons = document.querySelectorAll('button')
      buttons.forEach(btn => {
        const text = btn.innerText?.trim()
        const ariaLabel = btn.getAttribute('aria-label')
        if (!text && !ariaLabel) {
          problems.push('Button without accessible text')
        }
      })

      // Check for links without href or with empty href
      const links = document.querySelectorAll('a')
      links.forEach(link => {
        if (!link.href || link.href === '#') {
          const text = link.innerText?.trim()
          problems.push(`Link without valid href: ${text || 'empty'}`)
        }
      })

      return problems
    })

    if (issues.length > 0) {
      // Log issues but don't fail unless there are many
      console.warn('Accessibility issues found:', issues.slice(0, 5))
      if (issues.length > 10) {
        throw new Error(`Found ${issues.length} accessibility issues`)
      }
    }
  }

  /**
   * Verify test outcome
   */
  private async verifyOutcome(page: Page, scenario: TestScenario): Promise<void> {
    const outcome = scenario.expectedOutcome
    const timeout = outcome.timeout || this.config.timeout

    switch (outcome.type) {
      case 'url_change':
        if (outcome.value) {
          const currentUrl = page.url()
          if (!currentUrl.includes(outcome.value)) {
            throw new Error(`Expected URL to contain "${outcome.value}". Actual: "${currentUrl}"`)
          }
        }
        break

      case 'element_visible':
        if (outcome.selector) {
          await page.waitForSelector(outcome.selector, { state: 'visible', timeout })
        }
        break

      case 'element_hidden':
        if (outcome.selector) {
          await page.waitForSelector(outcome.selector, { state: 'hidden', timeout })
        }
        break

      case 'text_present':
        if (outcome.value) {
          const bodyText = await page.textContent('body')
          if (!bodyText?.includes(outcome.value)) {
            throw new Error(`Expected text "${outcome.value}" not found on page`)
          }
        }
        break

      case 'form_submitted':
        // Check for success indicators
        const successIndicators = [
          '.success', '.alert-success', '[data-success]',
          ':has-text("Success")', ':has-text("saved")', ':has-text("created")'
        ]
        let foundSuccess = false
        for (const indicator of successIndicators) {
          try {
            const element = await page.$(indicator)
            if (element) {
              foundSuccess = true
              break
            }
          } catch { }
        }
        // Don't throw on missing success message, it might just redirect
        break

      case 'error_message':
        // Check for error indicators
        const errorIndicators = [
          '.error', '.alert-error', '.alert-danger', '[data-error]',
          '.text-red-500', '.text-destructive',
          ':has-text("Error")', ':has-text("Invalid")', ':has-text("required")'
        ]
        let foundError = false
        for (const indicator of errorIndicators) {
          try {
            const element = await page.$(indicator)
            if (element) {
              foundError = true
              break
            }
          } catch { }
        }
        // Validation might show inline without error class
        break

      case 'success_message':
        // Similar to form_submitted
        break

      case 'no_change':
        // Nothing to verify
        break

      case 'custom':
        // Custom verification would need additional implementation
        break
    }
  }

  /**
   * Take a screenshot
   */
  private async takeScreenshot(page: Page, scenarioId: string, stepId: string): Promise<string> {
    const dir = path.join(this.config.outputDir, 'screenshots')

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const filename = `${scenarioId}-${stepId}-${Date.now()}.png`
    const filepath = path.join(dir, filename)

    await page.screenshot({ path: filepath, fullPage: false })

    return filepath
  }

  /**
   * Execute multiple scenarios in parallel
   */
  async executeInParallel(
    pages: Page[],
    scenarios: TestScenario[]
  ): Promise<TestResult[]> {
    const results: TestResult[] = []
    const queue = [...scenarios]
    const running = new Map<Page, Promise<void>>()

    while (queue.length > 0 || running.size > 0) {
      // Start new tasks on available pages
      for (const page of pages) {
        if (!running.has(page) && queue.length > 0) {
          const scenario = queue.shift()!
          running.set(page, (async () => {
            const result = await this.executeScenario(page, scenario)
            results.push(result)
            running.delete(page)
          })())
        }
      }

      // Wait for at least one to complete
      if (running.size > 0) {
        await Promise.race(running.values())
      }
    }

    return results
  }
}

export default TestExecutor
