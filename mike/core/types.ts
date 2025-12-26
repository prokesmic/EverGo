/**
 * Mike Testing Agent - Type Definitions
 */

export interface MikeConfig {
  baseUrl: string
  headless: boolean
  timeout: number
  maxConcurrency: number
  screenshotOnFailure: boolean
  videoOnFailure: boolean
  retryCount: number
  testUser: {
    email: string
    password: string
  }
  excludePaths: string[]
  maxDepth: number
  outputDir: string
  verbose: boolean
}

export interface DiscoveredElement {
  id: string
  type: 'button' | 'link' | 'form' | 'input' | 'select' | 'textarea' | 'checkbox' | 'radio'
  selector: string
  text?: string
  name?: string
  placeholder?: string
  href?: string
  action?: string
  method?: string
  ariaLabel?: string
  dataTestId?: string
  pageUrl: string
  xpath: string
  attributes: Record<string, string>
  isVisible: boolean
  isEnabled: boolean
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  children?: DiscoveredElement[]
  parentForm?: string
}

export interface CrawlResult {
  visitedUrls: string[]
  skippedUrls: string[]
  errors: Array<{ url: string; error: string }>
  totalLinks: number
  duration: number
}

export interface TestScenario {
  id: string
  name: string
  description: string
  category: ScenarioCategory
  priority: 'critical' | 'high' | 'medium' | 'low'
  pageUrl: string
  steps: TestStep[]
  expectedOutcome: ExpectedOutcome
  preconditions?: string[]
  tags: string[]
  timeout?: number
  retryable: boolean
}

export type ScenarioCategory =
  | 'navigation'
  | 'authentication'
  | 'form_submission'
  | 'button_click'
  | 'link_click'
  | 'data_validation'
  | 'error_handling'
  | 'accessibility'
  | 'responsive'
  | 'performance'
  | 'api'
  | 'user_flow'

export interface TestStep {
  id: string
  action: StepAction
  selector?: string
  value?: string
  waitFor?: WaitCondition
  timeout?: number
  description: string
  screenshot?: boolean
  critical: boolean
}

export type StepAction =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'select'
  | 'check'
  | 'uncheck'
  | 'hover'
  | 'scroll'
  | 'wait'
  | 'screenshot'
  | 'assertVisible'
  | 'assertText'
  | 'assertUrl'
  | 'assertValue'
  | 'assertEnabled'
  | 'assertDisabled'
  | 'pressKey'
  | 'upload'
  | 'clearAndFill'
  | 'doubleClick'
  | 'rightClick'
  | 'dragAndDrop'
  | 'custom'

export interface WaitCondition {
  type: 'selector' | 'url' | 'networkidle' | 'timeout' | 'function'
  value: string | number
}

export interface ExpectedOutcome {
  type: 'url_change' | 'element_visible' | 'element_hidden' | 'text_present' | 'form_submitted' | 'error_message' | 'success_message' | 'no_change' | 'custom'
  value?: string
  selector?: string
  timeout?: number
}

export interface TestResult {
  id: string
  scenarioId: string
  name: string
  status: 'passed' | 'failed' | 'skipped' | 'error'
  duration: number
  timestamp: string
  error?: string
  errorStack?: string
  screenshots?: string[]
  videoPath?: string
  stepResults?: StepResult[]
  retryCount?: number
  metadata?: Record<string, any>
}

export interface StepResult {
  stepId: string
  action: StepAction
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  screenshot?: string
}

export interface TestReport {
  id: string
  timestamp: string
  duration: number
  environment: {
    baseUrl: string
    browser: string
    viewport: string
    nodeVersion: string
    platform: string
  }
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
    passRate: number
  }
  byCategory: Record<ScenarioCategory, {
    total: number
    passed: number
    failed: number
  }>
  byPriority: Record<string, {
    total: number
    passed: number
    failed: number
  }>
  results: TestResult[]
  discoveredElements: number
  scenarios: number
  coverageEstimate: number
  recommendations: string[]
}

export interface FormField {
  element: DiscoveredElement
  fieldType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime' | 'file' | 'hidden' | 'checkbox' | 'radio' | 'select' | 'textarea'
  required: boolean
  validation?: {
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
  }
  options?: string[] // For select/radio
  testValues: {
    valid: string[]
    invalid: string[]
    edge: string[]
  }
}

export interface FormAnalysis {
  formElement: DiscoveredElement
  fields: FormField[]
  submitButton?: DiscoveredElement
  hasValidation: boolean
  isMultiStep: boolean
  estimatedTestCases: number
}

export interface PageAnalysis {
  url: string
  title: string
  elements: DiscoveredElement[]
  forms: FormAnalysis[]
  interactiveCount: number
  hasAuth: boolean
  loadTime: number
  accessibility: {
    missingAltText: number
    missingLabels: number
    contrastIssues: number
  }
}

export interface TestSuite {
  id: string
  name: string
  description: string
  scenarios: TestScenario[]
  setupSteps?: TestStep[]
  teardownSteps?: TestStep[]
  config?: Partial<MikeConfig>
}

export interface MikeState {
  isRunning: boolean
  currentPhase: 'idle' | 'crawling' | 'discovering' | 'generating' | 'executing' | 'reporting'
  progress: {
    current: number
    total: number
    percentage: number
  }
  startTime?: Date
  lastError?: string
}
