/**
 * Scenario Generator Module
 * Generates comprehensive test scenarios from discovered elements
 */

import { v4 as uuidv4 } from 'uuid'
import {
  DiscoveredElement,
  TestScenario,
  TestStep,
  MikeConfig,
  ScenarioCategory,
  ExpectedOutcome
} from '../core/types'

export class ScenarioGenerator {
  private config: MikeConfig

  constructor(config: MikeConfig) {
    this.config = config
  }

  /**
   * Generate test scenarios from discovered elements
   */
  async generateScenarios(elements: DiscoveredElement[]): Promise<TestScenario[]> {
    const scenarios: TestScenario[] = []

    // Group elements by page
    const elementsByPage = this.groupByPage(elements)

    // Generate navigation scenarios
    scenarios.push(...this.generateNavigationScenarios(elements))

    // Generate button click scenarios
    scenarios.push(...this.generateButtonScenarios(elements))

    // Generate link click scenarios
    scenarios.push(...this.generateLinkScenarios(elements))

    // Generate form submission scenarios
    scenarios.push(...this.generateFormScenarios(elements))

    // Generate input validation scenarios
    scenarios.push(...this.generateInputValidationScenarios(elements))

    // Generate user flow scenarios
    scenarios.push(...this.generateUserFlowScenarios(elementsByPage))

    // Generate accessibility scenarios
    scenarios.push(...this.generateAccessibilityScenarios(elements))

    // Generate error handling scenarios
    scenarios.push(...this.generateErrorHandlingScenarios(elements))

    return scenarios
  }

  /**
   * Generate navigation test scenarios
   */
  private generateNavigationScenarios(elements: DiscoveredElement[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const uniquePages = [...new Set(elements.map(e => e.pageUrl))]

    for (const pageUrl of uniquePages) {
      scenarios.push({
        id: uuidv4(),
        name: `Navigate to ${this.getPageName(pageUrl)}`,
        description: `Verify ${pageUrl} loads correctly with all expected elements`,
        category: 'navigation',
        priority: 'high',
        pageUrl: pageUrl,
        steps: [
          {
            id: uuidv4(),
            action: 'navigate',
            value: pageUrl,
            description: `Navigate to ${pageUrl}`,
            critical: true
          },
          {
            id: uuidv4(),
            action: 'assertVisible',
            selector: 'main, [role="main"], body',
            description: 'Verify main content is visible',
            critical: true
          },
          {
            id: uuidv4(),
            action: 'wait',
            waitFor: { type: 'networkidle', value: 5000 },
            description: 'Wait for page to fully load',
            critical: false
          }
        ],
        expectedOutcome: {
          type: 'element_visible',
          selector: 'main, [role="main"]'
        },
        tags: ['navigation', 'smoke'],
        retryable: true
      })
    }

    return scenarios
  }

  /**
   * Generate button click scenarios
   */
  private generateButtonScenarios(elements: DiscoveredElement[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const buttons = elements.filter(e => e.type === 'button' && e.isVisible && e.isEnabled)

    for (const button of buttons) {
      // Skip submit buttons in forms (covered by form scenarios)
      if (button.attributes['type'] === 'submit' && button.parentForm) continue

      const buttonName = button.text || button.ariaLabel || button.name || 'Button'
      const isDestructive = this.isDestructiveAction(buttonName)
      const isDangerous = ['delete', 'remove', 'cancel'].some(d =>
        buttonName.toLowerCase().includes(d)
      )

      scenarios.push({
        id: uuidv4(),
        name: `Click "${buttonName}" button on ${this.getPageName(button.pageUrl)}`,
        description: `Test clicking the "${buttonName}" button and verify expected behavior`,
        category: 'button_click',
        priority: isDangerous ? 'low' : 'medium',
        pageUrl: button.pageUrl,
        steps: [
          {
            id: uuidv4(),
            action: 'navigate',
            value: button.pageUrl,
            description: `Navigate to ${button.pageUrl}`,
            critical: true
          },
          {
            id: uuidv4(),
            action: 'assertVisible',
            selector: button.selector,
            description: `Verify "${buttonName}" button is visible`,
            critical: true
          },
          ...(isDestructive ? [] : [{
            id: uuidv4(),
            action: 'click' as const,
            selector: button.selector,
            description: `Click "${buttonName}" button`,
            critical: true,
            screenshot: true
          }]),
          {
            id: uuidv4(),
            action: 'wait',
            waitFor: { type: 'timeout' as const, value: 1000 },
            description: 'Wait for action to complete',
            critical: false
          }
        ],
        expectedOutcome: this.inferButtonOutcome(button),
        tags: ['button', this.getPageName(button.pageUrl).toLowerCase()],
        retryable: !isDestructive
      })
    }

    return scenarios
  }

  /**
   * Generate link click scenarios
   */
  private generateLinkScenarios(elements: DiscoveredElement[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const links = elements.filter(e => e.type === 'link' && e.isVisible && e.href)

    // Group links to avoid duplicates
    const uniqueLinks = new Map<string, DiscoveredElement>()
    for (const link of links) {
      const key = link.href || link.text || link.id || 'default'
      if (!uniqueLinks.has(key)) {
        uniqueLinks.set(key, link)
      }
    }

    for (const link of uniqueLinks.values()) {
      const linkName = link.text || link.ariaLabel || link.href || 'Link'

      scenarios.push({
        id: uuidv4(),
        name: `Click "${linkName.slice(0, 50)}" link`,
        description: `Test navigation via "${linkName}" link`,
        category: 'link_click',
        priority: 'medium',
        pageUrl: link.pageUrl,
        steps: [
          {
            id: uuidv4(),
            action: 'navigate',
            value: link.pageUrl,
            description: `Navigate to ${link.pageUrl}`,
            critical: true
          },
          {
            id: uuidv4(),
            action: 'assertVisible',
            selector: link.selector,
            description: `Verify link is visible`,
            critical: true
          },
          {
            id: uuidv4(),
            action: 'click',
            selector: link.selector,
            description: `Click "${linkName.slice(0, 30)}" link`,
            critical: true
          },
          {
            id: uuidv4(),
            action: 'wait',
            waitFor: { type: 'networkidle', value: 5000 },
            description: 'Wait for navigation',
            critical: false
          }
        ],
        expectedOutcome: {
          type: 'url_change',
          value: link.href
        },
        tags: ['link', 'navigation'],
        retryable: true
      })
    }

    return scenarios
  }

  /**
   * Generate form submission scenarios
   */
  private generateFormScenarios(elements: DiscoveredElement[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const forms = elements.filter(e => e.type === 'form')
    const inputs = elements.filter(e => ['input', 'select', 'textarea', 'checkbox', 'radio'].includes(e.type))

    for (const form of forms) {
      const formInputs = inputs.filter(i => i.parentForm === form.name || i.pageUrl === form.pageUrl)
      const formName = form.name || form.action || `Form on ${this.getPageName(form.pageUrl)}`

      // Valid submission scenario
      scenarios.push(this.createFormSubmissionScenario(form, formInputs, 'valid'))

      // Empty submission scenario (validation test)
      scenarios.push(this.createFormSubmissionScenario(form, formInputs, 'empty'))

      // Invalid data scenario
      scenarios.push(this.createFormSubmissionScenario(form, formInputs, 'invalid'))
    }

    return scenarios
  }

  /**
   * Create a form submission scenario
   */
  private createFormSubmissionScenario(
    form: DiscoveredElement,
    inputs: DiscoveredElement[],
    dataType: 'valid' | 'empty' | 'invalid'
  ): TestScenario {
    const formName = form.name || `Form on ${this.getPageName(form.pageUrl)}`
    const steps: TestStep[] = []

    // Navigate to page
    steps.push({
      id: uuidv4(),
      action: 'navigate',
      value: form.pageUrl,
      description: `Navigate to ${form.pageUrl}`,
      critical: true
    })

    // Fill in form fields based on data type
    for (const input of inputs) {
      if (!input.isVisible || !input.isEnabled) continue

      const value = this.getTestValue(input, dataType)
      if (value === null) continue

      if (input.type === 'checkbox' || input.type === 'radio') {
        if (dataType !== 'empty') {
          steps.push({
            id: uuidv4(),
            action: 'check',
            selector: input.selector,
            description: `Check ${input.name || input.text}`,
            critical: false
          })
        }
      } else if (input.type === 'select') {
        steps.push({
          id: uuidv4(),
          action: 'select',
          selector: input.selector,
          value: value,
          description: `Select "${value}" in ${input.name}`,
          critical: false
        })
      } else {
        steps.push({
          id: uuidv4(),
          action: 'fill',
          selector: input.selector,
          value: value,
          description: `Fill ${input.name || input.placeholder || 'field'} with "${value}"`,
          critical: false
        })
      }
    }

    // Submit form
    const submitButton = inputs.find(i =>
      i.type === 'button' && i.attributes['type'] === 'submit'
    )

    steps.push({
      id: uuidv4(),
      action: 'click',
      selector: submitButton?.selector || `${form.selector} button[type="submit"], ${form.selector} input[type="submit"]`,
      description: 'Submit form',
      critical: true,
      screenshot: true
    })

    // Wait for response
    steps.push({
      id: uuidv4(),
      action: 'wait',
      waitFor: { type: 'networkidle', value: 5000 },
      description: 'Wait for form submission',
      critical: false
    })

    return {
      id: uuidv4(),
      name: `${formName} - ${dataType} data submission`,
      description: `Test ${formName} submission with ${dataType} data`,
      category: 'form_submission',
      priority: dataType === 'valid' ? 'critical' : 'medium',
      pageUrl: form.pageUrl,
      steps,
      expectedOutcome: this.inferFormOutcome(dataType),
      tags: ['form', dataType, this.getPageName(form.pageUrl).toLowerCase()],
      retryable: dataType === 'valid'
    }
  }

  /**
   * Generate input validation scenarios
   * Tests that inputs can accept and display values correctly
   */
  private generateInputValidationScenarios(elements: DiscoveredElement[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const inputs = elements.filter(e => e.type === 'input' && e.isVisible)

    for (const input of inputs) {
      const inputType = input.attributes['type'] || 'text'

      // Generate input interaction tests for specific input types
      if (['email', 'password', 'number', 'tel', 'url'].includes(inputType)) {
        scenarios.push({
          id: uuidv4(),
          name: `Test ${input.name || inputType} input on ${this.getPageName(input.pageUrl)}`,
          description: `Test that ${inputType} input field accepts and displays values`,
          category: 'data_validation',
          priority: 'medium',
          pageUrl: input.pageUrl,
          steps: [
            {
              id: uuidv4(),
              action: 'navigate',
              value: input.pageUrl,
              description: `Navigate to ${input.pageUrl}`,
              critical: true
            },
            // Verify input is visible and interactable
            {
              id: uuidv4(),
              action: 'assertVisible',
              selector: input.selector,
              description: `Verify ${inputType} input is visible`,
              critical: true
            },
            // Enter a valid test value
            {
              id: uuidv4(),
              action: 'clearAndFill',
              selector: input.selector,
              value: this.getValidTestValue(inputType),
              description: `Enter valid ${inputType} value`,
              critical: true
            },
            {
              id: uuidv4(),
              action: 'wait',
              waitFor: { type: 'timeout', value: 300 },
              description: 'Wait for input to update',
              critical: false
            },
            // Verify the value was accepted
            {
              id: uuidv4(),
              action: 'assertValue',
              selector: input.selector,
              value: this.getValidTestValue(inputType),
              description: 'Verify value was entered correctly',
              critical: false
            },
            {
              id: uuidv4(),
              action: 'screenshot',
              description: 'Capture input state',
              critical: false
            }
          ],
          expectedOutcome: {
            type: 'no_change'
          },
          tags: ['validation', inputType],
          retryable: true
        })
      }
    }

    return scenarios
  }

  /**
   * Generate user flow scenarios
   */
  private generateUserFlowScenarios(elementsByPage: Map<string, DiscoveredElement[]>): TestScenario[] {
    const scenarios: TestScenario[] = []

    // Login flow
    if (elementsByPage.has(`${this.config.baseUrl}/login`)) {
      scenarios.push({
        id: uuidv4(),
        name: 'User Login Flow',
        description: 'Complete user login with valid credentials',
        category: 'user_flow',
        priority: 'critical',
        pageUrl: `${this.config.baseUrl}/login`,
        steps: [
          {
            id: uuidv4(),
            action: 'navigate',
            value: `${this.config.baseUrl}/login`,
            description: 'Navigate to login page',
            critical: true
          },
          {
            id: uuidv4(),
            action: 'fill',
            selector: 'input[type="email"], input[name="email"]',
            value: this.config.testUser.email,
            description: 'Enter email',
            critical: true
          },
          {
            id: uuidv4(),
            action: 'fill',
            selector: 'input[type="password"], input[name="password"]',
            value: this.config.testUser.password,
            description: 'Enter password',
            critical: true
          },
          {
            id: uuidv4(),
            action: 'click',
            selector: 'button[type="submit"]',
            description: 'Click login button',
            critical: true
          },
          {
            id: uuidv4(),
            action: 'wait',
            waitFor: { type: 'url', value: '/home' },
            description: 'Wait for redirect to dashboard',
            critical: true
          }
        ],
        expectedOutcome: {
          type: 'url_change',
          value: '/home'
        },
        tags: ['auth', 'login', 'user-flow', 'critical'],
        retryable: true
      })
    }

    // Activity creation flow
    scenarios.push({
      id: uuidv4(),
      name: 'Activity Creation Flow',
      description: 'Create a new activity with all required fields',
      category: 'user_flow',
      priority: 'high',
      pageUrl: `${this.config.baseUrl}/activity/create`,
      steps: [
        {
          id: uuidv4(),
          action: 'navigate',
          value: `${this.config.baseUrl}/activity/create`,
          description: 'Navigate to activity creation page',
          critical: true
        },
        {
          id: uuidv4(),
          action: 'assertVisible',
          selector: 'form',
          description: 'Verify form is present',
          critical: true
        },
        {
          id: uuidv4(),
          action: 'screenshot',
          description: 'Capture initial state',
          critical: false
        }
      ],
      expectedOutcome: {
        type: 'element_visible',
        selector: 'form'
      },
      tags: ['activity', 'create', 'user-flow'],
      retryable: true
    })

    return scenarios
  }

  /**
   * Generate accessibility scenarios
   */
  private generateAccessibilityScenarios(elements: DiscoveredElement[]): TestScenario[] {
    const scenarios: TestScenario[] = []
    const uniquePages = [...new Set(elements.map(e => e.pageUrl))]

    for (const pageUrl of uniquePages) {
      scenarios.push({
        id: uuidv4(),
        name: `Accessibility check for ${this.getPageName(pageUrl)}`,
        description: 'Verify basic accessibility requirements',
        category: 'accessibility',
        priority: 'medium',
        pageUrl: pageUrl,
        steps: [
          {
            id: uuidv4(),
            action: 'navigate',
            value: pageUrl,
            description: `Navigate to ${pageUrl}`,
            critical: true
          },
          {
            id: uuidv4(),
            action: 'custom',
            value: 'checkAccessibility',
            description: 'Run accessibility audit',
            critical: true
          }
        ],
        expectedOutcome: {
          type: 'custom',
          value: 'no critical accessibility violations'
        },
        tags: ['accessibility', 'a11y'],
        retryable: true
      })
    }

    return scenarios
  }

  /**
   * Generate error handling scenarios
   */
  private generateErrorHandlingScenarios(elements: DiscoveredElement[]): TestScenario[] {
    const scenarios: TestScenario[] = []

    // 404 error handling
    scenarios.push({
      id: uuidv4(),
      name: '404 Page Not Found Handling',
      description: 'Verify 404 page displays correctly for non-existent routes',
      category: 'error_handling',
      priority: 'medium',
      pageUrl: `${this.config.baseUrl}/non-existent-page-${Date.now()}`,
      steps: [
        {
          id: uuidv4(),
          action: 'navigate',
          value: `${this.config.baseUrl}/non-existent-page-${Date.now()}`,
          description: 'Navigate to non-existent page',
          critical: true
        },
        {
          id: uuidv4(),
          action: 'assertText',
          selector: 'body',
          value: '404',
          description: 'Verify 404 message is displayed',
          critical: false
        }
      ],
      expectedOutcome: {
        type: 'text_present',
        value: '404'
      },
      tags: ['error', '404'],
      retryable: true
    })

    // Authorized access - verify authenticated user can access protected pages
    scenarios.push({
      id: uuidv4(),
      name: 'Authorized Access Verification',
      description: 'Verify authenticated users can access protected pages',
      category: 'error_handling',
      priority: 'high',
      pageUrl: `${this.config.baseUrl}/home`,
      preconditions: ['User is logged in'],
      steps: [
        {
          id: uuidv4(),
          action: 'navigate',
          value: `${this.config.baseUrl}/home`,
          description: 'Navigate to protected home page',
          critical: true
        },
        {
          id: uuidv4(),
          action: 'assertUrl',
          value: '/home',
          description: 'Verify we stay on home page (not redirected)',
          critical: true
        },
        {
          id: uuidv4(),
          action: 'assertVisible',
          selector: 'main, [role="main"], body',
          description: 'Verify main content is visible',
          critical: true
        }
      ],
      expectedOutcome: {
        type: 'url_change',
        value: '/home'
      },
      tags: ['auth', 'security', 'access'],
      retryable: true
    })

    return scenarios
  }

  // ============ Helper Methods ============

  private groupByPage(elements: DiscoveredElement[]): Map<string, DiscoveredElement[]> {
    const grouped = new Map<string, DiscoveredElement[]>()
    for (const element of elements) {
      const existing = grouped.get(element.pageUrl) || []
      existing.push(element)
      grouped.set(element.pageUrl, existing)
    }
    return grouped
  }

  private getPageName(url: string): string {
    const path = new URL(url).pathname
    if (path === '/') return 'Home'
    return path.split('/').filter(Boolean).map(s =>
      s.charAt(0).toUpperCase() + s.slice(1)
    ).join(' ')
  }

  private isDestructiveAction(text: string): boolean {
    const destructiveWords = ['delete', 'remove', 'destroy', 'clear all', 'reset']
    return destructiveWords.some(word => text.toLowerCase().includes(word))
  }

  private inferButtonOutcome(button: DiscoveredElement): ExpectedOutcome {
    const text = (button.text || button.ariaLabel || '').toLowerCase()

    if (text.includes('submit') || text.includes('save') || text.includes('create')) {
      return { type: 'form_submitted' }
    }
    if (text.includes('cancel') || text.includes('close')) {
      return { type: 'element_hidden' }
    }
    if (text.includes('add') || text.includes('new')) {
      return { type: 'element_visible' }
    }
    return { type: 'no_change' }
  }

  private inferFormOutcome(dataType: 'valid' | 'empty' | 'invalid'): ExpectedOutcome {
    if (dataType === 'valid') {
      return { type: 'success_message' }
    }
    return { type: 'error_message' }
  }

  private getTestValue(input: DiscoveredElement, dataType: 'valid' | 'empty' | 'invalid'): string | null {
    if (dataType === 'empty') return ''

    const inputType = input.attributes['type'] || 'text'
    const name = (input.name || input.placeholder || '').toLowerCase()

    if (dataType === 'valid') {
      if (inputType === 'email' || name.includes('email')) return 'test@example.com'
      if (inputType === 'password' || name.includes('password')) return 'TestPassword123!'
      if (inputType === 'number') return '42'
      if (inputType === 'tel') return '+1234567890'
      if (inputType === 'url') return 'https://example.com'
      if (name.includes('name')) return 'Test User'
      if (name.includes('title')) return 'Test Title'
      if (name.includes('description') || name.includes('message')) return 'This is a test description'
      return 'Test Value'
    }

    // Invalid data
    return this.getInvalidValue(inputType)
  }

  private getInvalidValue(inputType: string): string {
    switch (inputType) {
      case 'email': return 'invalid-email'
      case 'number': return 'not-a-number'
      case 'tel': return 'invalid-phone'
      case 'url': return 'not-a-url'
      case 'password': return 'weak'
      default: return ''
    }
  }

  private getValidTestValue(inputType: string): string {
    switch (inputType) {
      case 'email': return 'test@example.com'
      case 'number': return '42'
      case 'tel': return '1234567890'
      case 'url': return 'https://example.com'
      case 'password': return 'TestPassword123!'
      default: return 'test value'
    }
  }
}

export default ScenarioGenerator
