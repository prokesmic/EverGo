/**
 * Mike - Master Intelligent Knowledge Engine for Testing
 *
 * A comprehensive AI-powered testing agent for web applications.
 *
 * Features:
 * - Automatic element discovery (buttons, links, forms, inputs)
 * - Intelligent test scenario generation
 * - Playwright-based test execution
 * - Comprehensive HTML/JSON/Markdown reports
 * - Self-healing test capabilities
 * - CI/CD integration (JUnit XML output)
 *
 * @example
 * ```typescript
 * import { Mike } from './mike'
 *
 * const mike = new Mike({
 *   baseUrl: 'http://localhost:3000',
 *   headless: true,
 *   testUser: {
 *     email: 'test@example.com',
 *     password: 'password123'
 *   }
 * })
 *
 * await mike.initialize()
 * const results = await mike.runFullSuite()
 * await mike.shutdown()
 * ```
 */

// Core
export { Mike } from './core/mike'
export type {
  MikeConfig,
  TestScenario,
  TestStep,
  TestResult,
  StepResult,
  DiscoveredElement,
  CrawlResult,
  TestReport,
  ScenarioCategory,
  StepAction,
  ExpectedOutcome,
  FormAnalysis,
  FormField,
  PageAnalysis,
  TestSuite,
  MikeState
} from './core/types'

// Discovery
export { ElementDiscovery } from './discovery/element-discovery'
export { PageCrawler } from './discovery/page-crawler'

// Generators
export { ScenarioGenerator } from './generators/scenario-generator'

// Executors
export { TestExecutor } from './executors/test-executor'

// Reporters
export { TestReporter } from './reporters/test-reporter'

// Default export
export { Mike as default } from './core/mike'
