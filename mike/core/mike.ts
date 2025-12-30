/**
 * MIKE - Master Intelligent Knowledge Engine for Testing
 *
 * Mike is an AI-powered testing agent that:
 * 1. Discovers all interactive elements (buttons, links, forms, inputs)
 * 2. Generates comprehensive test scenarios
 * 3. Executes tests using Playwright
 * 4. Reports results with detailed analytics
 * 5. Self-heals broken tests by adapting to UI changes
 *
 * @author Claude AI
 * @version 1.0.0
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright'
import { ElementDiscovery } from '../discovery/element-discovery'
import { PageCrawler } from '../discovery/page-crawler'
import { ScenarioGenerator } from '../generators/scenario-generator'
import { TestExecutor } from '../executors/test-executor'
import { TestReporter } from '../reporters/test-reporter'
import { MikeConfig, TestScenario, TestResult, DiscoveredElement, CrawlResult } from './types'
import chalk from 'chalk'
import ora from 'ora'

export class Mike {
  private config: MikeConfig
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private discovery: ElementDiscovery
  private crawler: PageCrawler
  private generator: ScenarioGenerator
  private executor: TestExecutor
  private reporter: TestReporter
  private discoveredElements: DiscoveredElement[] = []
  private scenarios: TestScenario[] = []
  private results: TestResult[] = []

  constructor(config: Partial<MikeConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3000',
      headless: config.headless ?? true,
      timeout: config.timeout || 30000,
      maxConcurrency: config.maxConcurrency || 3,
      screenshotOnFailure: config.screenshotOnFailure ?? true,
      videoOnFailure: config.videoOnFailure ?? false,
      retryCount: config.retryCount || 2,
      testUser: config.testUser || {
        email: process.env.TEST_USER_EMAIL || 'playwright@test.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      },
      excludePaths: config.excludePaths || ['/api/', '/logout', '/_next/'],
      maxDepth: config.maxDepth || 5,
      outputDir: config.outputDir || './mike/results',
      verbose: config.verbose ?? false,
    }

    this.discovery = new ElementDiscovery(this.config)
    this.crawler = new PageCrawler(this.config)
    this.generator = new ScenarioGenerator(this.config)
    this.executor = new TestExecutor(this.config)
    this.reporter = new TestReporter(this.config)
  }

  /**
   * Initialize Mike - start browser and prepare for testing
   */
  async initialize(): Promise<void> {
    const spinner = ora('Mike is waking up...').start()

    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mike Testing Agent/1.0',
        recordVideo: this.config.videoOnFailure ? { dir: `${this.config.outputDir}/videos` } : undefined
      })

      spinner.succeed(chalk.green('Mike is ready to test!'))
      this.log('\n' + chalk.cyan.bold(`
  ███╗   ███╗██╗██╗  ██╗███████╗
  ████╗ ████║██║██║ ██╔╝██╔════╝
  ██╔████╔██║██║█████╔╝ █████╗
  ██║╚██╔╝██║██║██╔═██╗ ██╔══╝
  ██║ ╚═╝ ██║██║██║  ██╗███████╗
  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚══════╝
  Master Intelligent Knowledge Engine for Testing
      `))
    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize Mike'))
      throw error
    }
  }

  /**
   * Run full test suite - discover, generate, execute, report
   */
  async runFullSuite(): Promise<TestResult[]> {
    const startTime = Date.now()

    console.log(chalk.blue.bold('\n📋 Starting Full Test Suite\n'))

    // Phase 1: Crawl and Discover
    await this.crawlApplication()

    // Phase 2: Generate Scenarios
    await this.generateScenarios()

    // Phase 3: Execute Tests
    await this.executeTests()

    // Phase 4: Generate Report
    await this.generateReport()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(chalk.green.bold(`\n✅ Full test suite completed in ${duration}s\n`))

    return this.results
  }

  /**
   * Phase 1: Crawl the application and discover all elements
   */
  async crawlApplication(): Promise<CrawlResult> {
    const spinner = ora('Phase 1: Crawling application...').start()

    try {
      const page = await this.context!.newPage()

      // First, authenticate
      await this.authenticate(page)

      // Crawl all pages
      const crawlResult = await this.crawler.crawl(page, this.config.baseUrl)

      // Discover elements on each page
      for (const pageUrl of crawlResult.visitedUrls) {
        spinner.text = `Discovering elements on ${pageUrl}...`
        await page.goto(pageUrl, { waitUntil: 'networkidle' })
        const elements = await this.discovery.discoverElements(page, pageUrl)
        this.discoveredElements.push(...elements)
      }

      await page.close()

      spinner.succeed(chalk.green(`Phase 1 Complete: Found ${this.discoveredElements.length} interactive elements across ${crawlResult.visitedUrls.length} pages`))

      this.log(`\n${chalk.cyan('Discovered Elements Summary:')}`)
      this.log(`  • Buttons: ${this.discoveredElements.filter(e => e.type === 'button').length}`)
      this.log(`  • Links: ${this.discoveredElements.filter(e => e.type === 'link').length}`)
      this.log(`  • Forms: ${this.discoveredElements.filter(e => e.type === 'form').length}`)
      this.log(`  • Inputs: ${this.discoveredElements.filter(e => e.type === 'input').length}`)
      this.log(`  • Selects: ${this.discoveredElements.filter(e => e.type === 'select').length}`)

      return crawlResult
    } catch (error) {
      spinner.fail(chalk.red('Phase 1 Failed: Crawling error'))
      throw error
    }
  }

  /**
   * Phase 2: Generate test scenarios based on discovered elements
   */
  async generateScenarios(): Promise<TestScenario[]> {
    const spinner = ora('Phase 2: Generating test scenarios...').start()

    try {
      this.scenarios = await this.generator.generateScenarios(this.discoveredElements)

      spinner.succeed(chalk.green(`Phase 2 Complete: Generated ${this.scenarios.length} test scenarios`))

      this.log(`\n${chalk.cyan('Scenario Categories:')}`)
      const categories = this.groupBy(this.scenarios, 'category')
      Object.entries(categories).forEach(([cat, scenarios]) => {
        this.log(`  • ${cat}: ${(scenarios as TestScenario[]).length} scenarios`)
      })

      return this.scenarios
    } catch (error) {
      spinner.fail(chalk.red('Phase 2 Failed: Scenario generation error'))
      throw error
    }
  }

  /**
   * Phase 3: Execute all test scenarios
   */
  async executeTests(): Promise<TestResult[]> {
    const spinner = ora('Phase 3: Executing tests...').start()
    const totalTests = this.scenarios.length
    let completed = 0
    let passed = 0
    let failed = 0
    let skipped = 0

    for (const scenario of this.scenarios) {
      spinner.text = `Executing: ${scenario.name} (${completed + 1}/${totalTests})`

      let page = null
      try {
        page = await this.context!.newPage()

        try {
          await this.authenticate(page)
        } catch (authError: any) {
          // If authentication fails, mark test as skipped
          this.results.push({
            id: `skip-${scenario.id}`,
            scenarioId: scenario.id,
            name: scenario.name,
            status: 'skipped',
            duration: 0,
            timestamp: new Date().toISOString(),
            error: `Authentication failed: ${authError.message}`
          })
          completed++
          skipped++
          await page.close()
          continue
        }

        const result = await this.executor.executeScenario(page, scenario)
        this.results.push(result)

        completed++
        if (result.status === 'passed') passed++
        else if (result.status === 'failed') failed++

      } catch (error: any) {
        // Log the error but continue with other tests
        this.results.push({
          id: `error-${scenario.id}`,
          scenarioId: scenario.id,
          name: scenario.name,
          status: 'failed',
          duration: 0,
          timestamp: new Date().toISOString(),
          error: `Execution error: ${error.message}`
        })
        completed++
        failed++
      } finally {
        if (page) {
          try {
            await page.close()
          } catch {
            // Ignore close errors
          }
        }
      }
    }

    spinner.succeed(chalk.green(`Phase 3 Complete: ${passed}/${totalTests} passed, ${failed} failed, ${skipped} skipped`))

    return this.results
  }

  /**
   * Phase 4: Generate comprehensive test report
   */
  async generateReport(): Promise<void> {
    const spinner = ora('Phase 4: Generating report...').start()

    try {
      await this.reporter.generateReport({
        results: this.results,
        scenarios: this.scenarios,
        discoveredElements: this.discoveredElements,
        config: this.config
      })

      spinner.succeed(chalk.green(`Phase 4 Complete: Report saved to ${this.config.outputDir}`))
    } catch (error) {
      spinner.fail(chalk.red('Phase 4 Failed: Report generation error'))
      throw error
    }
  }

  /**
   * Authenticate with the application
   */
  private async authenticate(page: Page): Promise<void> {
    try {
      await page.goto(`${this.config.baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 10000 })
    } catch {
      // If page fails to load, try without waiting
      await page.goto(`${this.config.baseUrl}/login`, { timeout: 10000 })
    }

    // Wait for JavaScript hydration (shorter timeout)
    await page.waitForTimeout(1000)

    // Check if already logged in (redirected away from login)
    const currentUrl = page.url()
    if (!currentUrl.includes('/login')) {
      return // Already authenticated
    }

    // Wait for form with shorter timeout
    try {
      await page.waitForSelector('form', { timeout: 5000, state: 'attached' })
    } catch {
      // Take screenshot for debugging
      try {
        await page.screenshot({ path: `${this.config.outputDir}/login-debug.png`, fullPage: true })
      } catch { /* ignore */ }
      throw new Error('Login form not found on page')
    }

    // Wait for email input to be present with explicit wait
    const emailSelectors = ['#email', 'input[id="email"]', 'input[type="email"]', 'input[name="email"]']
    let emailFilled = false

    for (const selector of emailSelectors) {
      try {
        // Wait for the element to be visible and attached
        await page.waitForSelector(selector, { state: 'visible', timeout: 3000 })
        await page.fill(selector, this.config.testUser.email, { timeout: 3000 })
        emailFilled = true
        break
      } catch {
        // Try next selector
      }
    }

    if (!emailFilled) {
      // Debug: log what's on the page
      const pageContent = await page.content()
      const hasEmailInput = pageContent.includes('id="email"') || pageContent.includes('type="email"')
      throw new Error(`Could not find email input field. Page has email input: ${hasEmailInput}`)
    }

    // Wait for password input and fill
    const passwordSelectors = ['#password', 'input[id="password"]', 'input[type="password"]', 'input[name="password"]']
    let passwordFilled = false

    for (const selector of passwordSelectors) {
      try {
        await page.waitForSelector(selector, { state: 'visible', timeout: 3000 })
        await page.fill(selector, this.config.testUser.password, { timeout: 3000 })
        passwordFilled = true
        break
      } catch {
        // Try next selector
      }
    }

    if (!passwordFilled) {
      throw new Error('Could not find password input field')
    }

    // Click submit button
    const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Sign In")', 'button:has-text("Login")']
    let clicked = false

    for (const selector of submitSelectors) {
      try {
        await page.waitForSelector(selector, { state: 'visible', timeout: 3000 })
        await page.click(selector, { timeout: 3000 })
        clicked = true
        break
      } catch {
        // Try next selector
      }
    }

    if (!clicked) {
      throw new Error('Could not find submit button')
    }

    // Wait for navigation away from login page or error message
    try {
      await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 8000 })
    } catch {
      // Check if there's an error message on the page
      const pageContent = await page.content()
      if (pageContent.includes('Invalid credentials') || pageContent.includes('error')) {
        throw new Error('Login failed - invalid credentials')
      }
      // Check current URL
      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        throw new Error('Login did not redirect away from login page')
      }
    }
  }

  /**
   * Run specific test category
   */
  async runCategory(category: string): Promise<TestResult[]> {
    const categoryScenarios = this.scenarios.filter(s => s.category === category)

    if (categoryScenarios.length === 0) {
      console.log(chalk.yellow(`No scenarios found for category: ${category}`))
      return []
    }

    console.log(chalk.blue.bold(`\n📋 Running ${categoryScenarios.length} ${category} tests\n`))

    const results: TestResult[] = []

    for (const scenario of categoryScenarios) {
      const page = await this.context!.newPage()
      await this.authenticate(page)
      const result = await this.executor.executeScenario(page, scenario)
      results.push(result)
      await page.close()
    }

    return results
  }

  /**
   * Quick smoke test - test critical paths only
   */
  async smokeTest(): Promise<TestResult[]> {
    console.log(chalk.blue.bold('\n🔥 Running Smoke Tests\n'))

    const criticalPaths = [
      { name: 'Homepage loads', path: '/', expectedElement: 'main, body', requiresAuth: false },
      { name: 'Login page accessible', path: '/login', expectedElement: 'form, main', requiresAuth: false },
      { name: 'Dashboard accessible (auth)', path: '/home', expectedElement: 'main', requiresAuth: true },
      { name: 'Activity creation accessible', path: '/activity/create', expectedElement: 'form, main', requiresAuth: true },
      { name: 'Challenges page loads', path: '/challenges', expectedElement: 'main', requiresAuth: true },
      { name: 'Rankings page loads', path: '/rankings', expectedElement: 'main', requiresAuth: true },
    ]

    const results: TestResult[] = []
    let authenticated = false

    for (const test of criticalPaths) {
      const page = await this.context!.newPage()
      const startTime = Date.now()

      try {
        // Only authenticate once, and only for tests that require it
        if (test.requiresAuth && !authenticated) {
          try {
            await this.authenticate(page)
            authenticated = true
          } catch (authError: any) {
            // If auth fails, mark all auth-required tests as skipped
            console.log(chalk.yellow(`  ⊘ ${test.name}: Auth failed - ${authError.message}`))
            results.push({
              id: `smoke-${test.path}`,
              scenarioId: `smoke-${test.path}`,
              name: test.name,
              status: 'skipped',
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
              error: `Authentication failed: ${authError.message}`
            })
            await page.close()
            continue
          }
        }

        await page.goto(`${this.config.baseUrl}${test.path}`, { waitUntil: 'networkidle', timeout: 15000 })

        // Check for any of the expected elements
        const selectors = test.expectedElement.split(',').map(s => s.trim())
        let found = false
        for (const selector of selectors) {
          const element = await page.$(selector)
          if (element) {
            found = true
            break
          }
        }

        results.push({
          id: `smoke-${test.path}`,
          scenarioId: `smoke-${test.path}`,
          name: test.name,
          status: found ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: found ? undefined : `Expected element "${test.expectedElement}" not found`
        })

        console.log(found
          ? chalk.green(`  ✓ ${test.name}`)
          : chalk.red(`  ✗ ${test.name}`)
        )
      } catch (error: any) {
        results.push({
          id: `smoke-${test.path}`,
          scenarioId: `smoke-${test.path}`,
          name: test.name,
          status: 'failed',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: error.message
        })
        console.log(chalk.red(`  ✗ ${test.name}: ${error.message.slice(0, 60)}`))
      }

      await page.close()
    }

    const passed = results.filter(r => r.status === 'passed').length
    const skipped = results.filter(r => r.status === 'skipped').length
    console.log(chalk.blue(`\nSmoke Tests: ${passed}/${results.length} passed, ${skipped} skipped\n`))

    return results
  }

  /**
   * Cleanup and close browser
   */
  async shutdown(): Promise<void> {
    const spinner = ora('Mike is going to sleep...').start()

    if (this.context) await this.context.close()
    if (this.browser) await this.browser.close()

    spinner.succeed(chalk.green('Mike has finished. Goodbye!'))
  }

  /**
   * Helper: Group array by key
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) result[groupKey] = []
      result[groupKey].push(item)
      return result
    }, {} as Record<string, T[]>)
  }

  /**
   * Helper: Log if verbose mode
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(message)
    }
  }

  // Getters for external access
  getDiscoveredElements(): DiscoveredElement[] { return this.discoveredElements }
  getScenarios(): TestScenario[] { return this.scenarios }
  getResults(): TestResult[] { return this.results }
}

export default Mike
