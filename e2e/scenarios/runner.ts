#!/usr/bin/env tsx
/**
 * EverGo Scenario Runner
 *
 * Executes test scenarios from JSON files with Playwright.
 * Supports parallel execution, filtering, and detailed reporting.
 *
 * Usage:
 *   npx tsx e2e/scenarios/runner.ts
 *   npx tsx e2e/scenarios/runner.ts --file scenarios.json --agent atlas
 *   npx tsx e2e/scenarios/runner.ts --category smoke --parallel 4
 */

import * as fs from 'fs'
import * as path from 'path'
import { chromium, Browser, Page, BrowserContext } from 'playwright'
import type {
  Scenario,
  ScenarioFile,
  ScenarioResult,
  RunSummary,
  ScenarioStep,
  Assertion,
  Agent,
  ScenarioCategory,
} from './types'

// Environment variables
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'e2e-test@evergo.app'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!'
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const E2E_SECRET = process.env.E2E_TEST_SECRET || ''

interface RunnerConfig {
  scenarioFile: string
  agent?: Agent
  category?: ScenarioCategory
  parallel: number
  retries: number
  timeout: number
  headless: boolean
  baseUrl: string
}

function parseArgs(): RunnerConfig {
  const args = process.argv.slice(2)
  const config: RunnerConfig = {
    scenarioFile: path.join(__dirname, 'generated-scenarios.json'),
    parallel: 1,
    retries: 1,
    timeout: 30000,
    headless: true,
    baseUrl: BASE_URL,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const value = args[i + 1]

    switch (arg) {
      case '--file':
        config.scenarioFile = value
        i++
        break
      case '--agent':
        config.agent = value as Agent
        i++
        break
      case '--category':
        config.category = value as ScenarioCategory
        i++
        break
      case '--parallel':
        config.parallel = parseInt(value, 10)
        i++
        break
      case '--retries':
        config.retries = parseInt(value, 10)
        i++
        break
      case '--timeout':
        config.timeout = parseInt(value, 10)
        i++
        break
      case '--headed':
        config.headless = false
        break
      case '--url':
        config.baseUrl = value
        i++
        break
    }
  }

  return config
}

// Replace template variables in strings
function replaceTemplates(value: string): string {
  return value
    .replace('{{TEST_EMAIL}}', TEST_EMAIL)
    .replace('{{TEST_PASSWORD}}', TEST_PASSWORD)
}

// Execute a single step
async function executeStep(page: Page, step: ScenarioStep): Promise<{ passed: boolean; error?: string }> {
  try {
    switch (step.action) {
      case 'goto':
        await page.goto(step.target!, { waitUntil: 'domcontentloaded' })
        break

      case 'click':
        await page.click(step.target!)
        break

      case 'fill':
        const fillValue = typeof step.value === 'string' ? replaceTemplates(step.value) : String(step.value)
        await page.fill(step.target!, fillValue)
        break

      case 'select':
        await page.selectOption(step.target!, String(step.value))
        break

      case 'wait':
        if (typeof step.value === 'number') {
          await page.waitForTimeout(step.value)
        } else if (step.value === 'networkidle') {
          await page.waitForLoadState('networkidle')
        }
        break

      case 'screenshot':
        await page.screenshot({ path: `test-results/${step.value}`, fullPage: true })
        break

      case 'assert':
        // Handled separately in assertions
        break

      case 'custom':
        // Custom actions are evaluated but with safety restrictions
        console.log(`Custom action: ${step.value}`)
        if (String(step.value).includes('page.reload()')) {
          await page.reload()
        }
        break

      default:
        console.warn(`Unknown action: ${step.action}`)
    }

    return { passed: true }
  } catch (error) {
    return { passed: false, error: String(error) }
  }
}

// Execute assertions
async function executeAssertion(page: Page, assertion: Assertion): Promise<{ passed: boolean; error?: string }> {
  try {
    switch (assertion.type) {
      case 'visible':
        await page.waitForSelector(assertion.target!, { state: 'visible', timeout: assertion.timeout || 5000 })
        break

      case 'hidden':
        await page.waitForSelector(assertion.target!, { state: 'hidden', timeout: assertion.timeout || 5000 })
        break

      case 'text':
        const textContent = await page.textContent(assertion.target!)
        if (!textContent?.includes(String(assertion.expected))) {
          throw new Error(`Text mismatch: expected "${assertion.expected}", got "${textContent}"`)
        }
        break

      case 'url':
        const url = page.url()
        const expectedPattern = assertion.expected instanceof RegExp
          ? assertion.expected
          : new RegExp(String(assertion.expected))
        if (!expectedPattern.test(url)) {
          throw new Error(`URL mismatch: expected ${assertion.expected}, got ${url}`)
        }
        break

      case 'value':
        const inputValue = await page.inputValue(assertion.target!)
        if (inputValue !== assertion.expected) {
          throw new Error(`Value mismatch: expected "${assertion.expected}", got "${inputValue}"`)
        }
        break

      case 'exists':
        await page.waitForSelector(assertion.target!, { timeout: assertion.timeout || 5000 })
        break

      case 'enabled':
        const isEnabled = await page.isEnabled(assertion.target!)
        if (!isEnabled) {
          throw new Error(`Element is not enabled: ${assertion.target}`)
        }
        break

      case 'disabled':
        const isDisabled = await page.isDisabled(assertion.target!)
        if (!isDisabled) {
          throw new Error(`Element is not disabled: ${assertion.target}`)
        }
        break
    }

    return { passed: true }
  } catch (error) {
    return { passed: false, error: String(error) }
  }
}

// Execute a single scenario
async function executeScenario(
  browser: Browser,
  scenario: Scenario,
  config: RunnerConfig
): Promise<ScenarioResult> {
  const startTime = Date.now()
  const result: ScenarioResult = {
    scenarioId: scenario.id,
    passed: true,
    duration: 0,
    steps: [],
    assertions: [],
  }

  let context: BrowserContext | null = null
  let page: Page | null = null

  try {
    // Create browser context
    context = await browser.newContext({
      baseURL: config.baseUrl,
      ignoreHTTPSErrors: true,
    })

    page = await context.newPage()
    page.setDefaultTimeout(scenario.timeout || config.timeout)

    // Handle authentication if required
    if (scenario.requiresAuth) {
      // Login first
      await page.goto('/login')
      await page.fill('[data-testid="auth-email-input"]', TEST_EMAIL)
      await page.fill('[data-testid="auth-password-input"]', TEST_PASSWORD)
      await page.click('[data-testid="auth-submit-btn"]')
      await page.waitForURL(/home|onboarding/, { timeout: 10000 })
    }

    // Execute steps
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i]
      const stepResult = await executeStep(page, step)

      result.steps.push({
        step: i,
        action: step.action,
        passed: stepResult.passed,
        error: stepResult.error,
      })

      if (!stepResult.passed) {
        result.passed = false
        result.error = `Step ${i} failed: ${stepResult.error}`
        break
      }
    }

    // Execute assertions (only if all steps passed)
    if (result.passed) {
      for (let i = 0; i < scenario.assertions.length; i++) {
        const assertion = scenario.assertions[i]
        const assertResult = await executeAssertion(page, assertion)

        result.assertions.push({
          index: i,
          passed: assertResult.passed,
          error: assertResult.error,
        })

        if (!assertResult.passed) {
          result.passed = false
          result.error = `Assertion ${i} failed: ${assertResult.error}`
          break
        }
      }
    }

    // Capture screenshot on failure
    if (!result.passed && page) {
      const screenshotPath = `test-results/failure-${scenario.id}.png`
      await page.screenshot({ path: screenshotPath, fullPage: true })
      result.screenshot = screenshotPath
    }

  } catch (error) {
    result.passed = false
    result.error = String(error)
  } finally {
    if (context) {
      await context.close()
    }
  }

  result.duration = Date.now() - startTime
  return result
}

// Execute scenarios with retries
async function executeWithRetries(
  browser: Browser,
  scenario: Scenario,
  config: RunnerConfig
): Promise<ScenarioResult> {
  const maxRetries = scenario.retries ?? config.retries

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await executeScenario(browser, scenario, config)

    if (result.passed || attempt === maxRetries) {
      return result
    }

    console.log(`  Retry ${attempt + 1}/${maxRetries} for ${scenario.id}`)
  }

  // This shouldn't be reached, but TypeScript needs it
  return await executeScenario(browser, scenario, config)
}

// Run scenarios in parallel batches
async function runScenarios(scenarios: Scenario[], config: RunnerConfig): Promise<RunSummary> {
  const startTime = Date.now()
  const results: ScenarioResult[] = []

  console.log(`\nRunning ${scenarios.length} scenarios with parallelism ${config.parallel}`)

  const browser = await chromium.launch({ headless: config.headless })

  try {
    // Process in batches
    for (let i = 0; i < scenarios.length; i += config.parallel) {
      const batch = scenarios.slice(i, i + config.parallel)

      console.log(`\nBatch ${Math.floor(i / config.parallel) + 1}/${Math.ceil(scenarios.length / config.parallel)}`)

      const batchResults = await Promise.all(
        batch.map(async (scenario) => {
          console.log(`  Running: ${scenario.name}`)
          const result = await executeWithRetries(browser, scenario, config)
          console.log(`  ${result.passed ? 'PASS' : 'FAIL'}: ${scenario.name} (${result.duration}ms)`)
          return result
        })
      )

      results.push(...batchResults)
    }
  } finally {
    await browser.close()
  }

  const summary: RunSummary = {
    totalScenarios: scenarios.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    skipped: 0,
    duration: Date.now() - startTime,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    results,
  }

  return summary
}

// Main execution
async function main() {
  const config = parseArgs()

  console.log('EverGo Scenario Runner')
  console.log('='.repeat(50))
  console.log(`Scenario file: ${config.scenarioFile}`)
  console.log(`Base URL: ${config.baseUrl}`)
  console.log(`Parallel: ${config.parallel}`)
  console.log(`Headless: ${config.headless}`)

  // Load scenarios
  if (!fs.existsSync(config.scenarioFile)) {
    console.error(`Scenario file not found: ${config.scenarioFile}`)
    console.log('Run the generator first: npx tsx e2e/scenarios/generator.ts')
    process.exit(1)
  }

  const scenarioFile: ScenarioFile = JSON.parse(fs.readFileSync(config.scenarioFile, 'utf-8'))

  // Filter scenarios
  let scenarios = scenarioFile.scenarios

  if (config.agent) {
    scenarios = scenarios.filter((s) => s.agent === config.agent)
    console.log(`Filtered to agent: ${config.agent} (${scenarios.length} scenarios)`)
  }

  if (config.category) {
    scenarios = scenarios.filter((s) => s.category === config.category)
    console.log(`Filtered to category: ${config.category} (${scenarios.length} scenarios)`)
  }

  // Remove skipped scenarios
  scenarios = scenarios.filter((s) => !s.skip)

  if (scenarios.length === 0) {
    console.log('No scenarios to run')
    process.exit(0)
  }

  // Run scenarios
  const summary = await runScenarios(scenarios, config)

  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total:   ${summary.totalScenarios}`)
  console.log(`Passed:  ${summary.passed}`)
  console.log(`Failed:  ${summary.failed}`)
  console.log(`Skipped: ${summary.skipped}`)
  console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`)

  // Print failed scenarios
  if (summary.failed > 0) {
    console.log('\nFailed scenarios:')
    for (const result of summary.results.filter((r) => !r.passed)) {
      console.log(`  - ${result.scenarioId}: ${result.error}`)
    }
  }

  // Write results to file
  const resultsPath = path.join(__dirname, '../../test-results/scenario-results.json')
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true })
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2))
  console.log(`\nResults written to: ${resultsPath}`)

  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Runner failed:', error)
  process.exit(1)
})
