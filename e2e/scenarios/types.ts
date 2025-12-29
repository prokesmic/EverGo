/**
 * EverGo Test Scenario Types
 *
 * Defines the structure for test scenarios that can be:
 * - Generated programmatically
 * - Written manually
 * - Executed by the scenario runner
 */

// Test agent types
export type Agent = 'atlas' | 'hermes' | 'nyx' | 'iris' | 'kronos'

// Test categories
export type ScenarioCategory =
  | 'navigation'
  | 'forms'
  | 'auth'
  | 'visual'
  | 'a11y'
  | 'performance'
  | 'api'
  | 'data'
  | 'error'
  | 'smoke'

// Priority levels
export type Priority = 'critical' | 'high' | 'medium' | 'low'

// Test step actions
export type StepAction =
  | 'goto'
  | 'click'
  | 'fill'
  | 'select'
  | 'wait'
  | 'screenshot'
  | 'assert'
  | 'api_call'
  | 'custom'

// Single test step
export interface ScenarioStep {
  action: StepAction
  target?: string // CSS selector, test ID, or URL
  value?: string | number | boolean | Record<string, unknown>
  timeout?: number
  description?: string
}

// Assertion types
export interface Assertion {
  type: 'visible' | 'hidden' | 'text' | 'url' | 'value' | 'count' | 'exists' | 'enabled' | 'disabled'
  target?: string
  expected?: string | number | boolean | RegExp
  timeout?: number
}

// Seed data configuration
export interface SeedConfig {
  scenario: 'minimal_user' | 'user_with_activities' | 'user_with_team' | 'user_with_benchmarks' | 'full_user'
  email?: string
  password?: string
  sportId?: string
}

// Full scenario definition
export interface Scenario {
  id: string
  name: string
  description: string
  agent: Agent
  category: ScenarioCategory
  priority: Priority
  tags: string[]

  // Authentication
  requiresAuth: boolean
  authCredentials?: {
    email: string
    password: string
  }

  // Seed data
  seed?: SeedConfig

  // Test steps
  steps: ScenarioStep[]

  // Assertions after all steps
  assertions: Assertion[]

  // Cleanup actions
  cleanup?: ScenarioStep[]

  // Metadata
  timeout?: number
  retries?: number
  skip?: boolean
  skipReason?: string
  browsers?: ('chromium' | 'firefox' | 'webkit')[]
  viewports?: ('desktop' | 'tablet' | 'mobile')[]
}

// Scenario file format
export interface ScenarioFile {
  version: '1.0'
  generatedAt: string
  scenarios: Scenario[]
}

// Scenario execution result
export interface ScenarioResult {
  scenarioId: string
  passed: boolean
  duration: number
  steps: {
    step: number
    action: StepAction
    passed: boolean
    error?: string
    screenshot?: string
  }[]
  assertions: {
    index: number
    passed: boolean
    error?: string
  }[]
  error?: string
  screenshot?: string
  trace?: string
  video?: string
}

// Scenario run summary
export interface RunSummary {
  totalScenarios: number
  passed: number
  failed: number
  skipped: number
  duration: number
  startedAt: string
  completedAt: string
  results: ScenarioResult[]
}

// Generator configuration
export interface GeneratorConfig {
  agents?: Agent[]
  categories?: ScenarioCategory[]
  priorities?: Priority[]
  maxScenarios?: number
  includeSmoke?: boolean
  includeEdgeCases?: boolean
}

// Default generator config
export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  agents: ['atlas', 'hermes', 'nyx', 'iris', 'kronos'],
  categories: ['navigation', 'forms', 'auth', 'visual', 'a11y', 'performance', 'smoke'],
  priorities: ['critical', 'high', 'medium'],
  maxScenarios: 500,
  includeSmoke: true,
  includeEdgeCases: true,
}
