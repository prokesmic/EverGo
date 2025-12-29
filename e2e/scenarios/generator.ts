#!/usr/bin/env tsx
/**
 * EverGo Scenario Generator
 *
 * Generates test scenarios programmatically for comprehensive coverage.
 * Produces JSON scenario files that can be executed by the scenario runner.
 *
 * Usage:
 *   npx tsx e2e/scenarios/generator.ts
 *   npx tsx e2e/scenarios/generator.ts --agents atlas,hermes --max 100
 */

import * as fs from 'fs'
import * as path from 'path'
import { ROUTES, getAllRoutes } from '../../lib/routes'
import { TEST_IDS } from '../../lib/test-ids'
import type {
  Scenario,
  ScenarioFile,
  GeneratorConfig,
  Agent,
  ScenarioCategory,
  Priority,
} from './types'
import { DEFAULT_GENERATOR_CONFIG } from './types'

// Parse command line arguments
function parseArgs(): GeneratorConfig {
  const args = process.argv.slice(2)
  const config: GeneratorConfig = { ...DEFAULT_GENERATOR_CONFIG }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const value = args[i + 1]

    switch (arg) {
      case '--agents':
        config.agents = value.split(',') as Agent[]
        i++
        break
      case '--categories':
        config.categories = value.split(',') as ScenarioCategory[]
        i++
        break
      case '--max':
        config.maxScenarios = parseInt(value, 10)
        i++
        break
      case '--no-smoke':
        config.includeSmoke = false
        break
      case '--no-edge-cases':
        config.includeEdgeCases = false
        break
    }
  }

  return config
}

// Generate navigation scenarios (Atlas)
function generateNavigationScenarios(): Scenario[] {
  const scenarios: Scenario[] = []
  const routes = getAllRoutes()

  // Basic page load tests
  for (const route of routes) {
    scenarios.push({
      id: `nav-load-${route.testId}`,
      name: `Load ${route.title} page`,
      description: `Verify ${route.path} loads correctly`,
      agent: 'atlas',
      category: 'navigation',
      priority: route.auth === 'authenticated' ? 'high' : 'medium',
      tags: ['navigation', 'page-load', route.auth],
      requiresAuth: route.auth === 'authenticated',
      steps: [
        { action: 'goto', target: route.path, description: `Navigate to ${route.path}` },
        { action: 'wait', value: 500, description: 'Wait for page to settle' },
      ],
      assertions: [
        { type: 'url', expected: route.path.replace(/:[^/]+/g, '[^/]+') },
      ],
    })
  }

  // Navigation link tests
  const navLinks = [
    { from: '/home', to: '/calendar', testId: TEST_IDS.nav.calendar },
    { from: '/home', to: '/challenges', testId: TEST_IDS.nav.challenges },
    { from: '/home', to: '/teams', testId: TEST_IDS.nav.teams },
    { from: '/settings', to: '/settings/profile', testId: 'settings-profile-link' },
  ]

  for (const link of navLinks) {
    scenarios.push({
      id: `nav-link-${link.from.replace(/\//g, '-')}-to-${link.to.replace(/\//g, '-')}`,
      name: `Navigate from ${link.from} to ${link.to}`,
      description: `Click navigation link to go from ${link.from} to ${link.to}`,
      agent: 'atlas',
      category: 'navigation',
      priority: 'medium',
      tags: ['navigation', 'links'],
      requiresAuth: true,
      steps: [
        { action: 'goto', target: link.from },
        { action: 'click', target: `[data-testid="${link.testId}"]` },
        { action: 'wait', value: 500 },
      ],
      assertions: [
        { type: 'url', expected: link.to },
      ],
    })
  }

  // Route protection tests
  const protectedRoutes = routes.filter(r => r.auth === 'authenticated')
  for (const route of protectedRoutes.slice(0, 5)) {
    scenarios.push({
      id: `nav-protect-${route.testId}`,
      name: `Protected route ${route.path} redirects when unauthenticated`,
      description: `Verify ${route.path} redirects to login when not authenticated`,
      agent: 'atlas',
      category: 'navigation',
      priority: 'critical',
      tags: ['navigation', 'security', 'route-protection'],
      requiresAuth: false,
      steps: [
        { action: 'goto', target: route.path },
        { action: 'wait', value: 1000 },
      ],
      assertions: [
        { type: 'url', expected: '/login' },
      ],
    })
  }

  return scenarios
}

// Generate form scenarios (Hermes)
function generateFormScenarios(): Scenario[] {
  const scenarios: Scenario[] = []

  // Activity form tests
  const activityFormTests = [
    {
      id: 'form-activity-valid',
      name: 'Submit valid activity form',
      description: 'Fill and submit activity form with valid data',
      steps: [
        { action: 'goto' as const, target: '/activity/create' },
        { action: 'click' as const, target: `[data-testid="${TEST_IDS.activity.sportSelect}"]` },
        { action: 'click' as const, target: '[role="option"]:first-child' },
        { action: 'fill' as const, target: `[data-testid="${TEST_IDS.activity.durationInput}"]`, value: '30' },
        { action: 'fill' as const, target: `[data-testid="${TEST_IDS.activity.distanceInput}"]`, value: '5' },
        { action: 'click' as const, target: `[data-testid="${TEST_IDS.activity.submitBtn}"]` },
      ],
      assertions: [{ type: 'url' as const, expected: '/home|/activity/' }],
    },
    {
      id: 'form-activity-empty',
      name: 'Activity form validates empty submission',
      description: 'Verify empty activity form shows validation errors',
      steps: [
        { action: 'goto' as const, target: '/activity/create' },
        { action: 'click' as const, target: `[data-testid="${TEST_IDS.activity.submitBtn}"]` },
      ],
      assertions: [{ type: 'url' as const, expected: '/activity/create' }],
    },
  ]

  for (const test of activityFormTests) {
    scenarios.push({
      ...test,
      agent: 'hermes',
      category: 'forms',
      priority: 'high',
      tags: ['forms', 'activity', 'validation'],
      requiresAuth: true,
    })
  }

  // Settings form tests
  scenarios.push({
    id: 'form-settings-profile',
    name: 'Update profile settings',
    description: 'Fill and save profile settings form',
    agent: 'hermes',
    category: 'forms',
    priority: 'high',
    tags: ['forms', 'settings', 'profile'],
    requiresAuth: true,
    steps: [
      { action: 'goto', target: '/settings/profile' },
      { action: 'fill', target: `[data-testid="${TEST_IDS.settings.displayNameInput}"]`, value: 'E2E Test User' },
      { action: 'click', target: `[data-testid="${TEST_IDS.settings.saveBtn}"]` },
      { action: 'wait', value: 1000 },
    ],
    assertions: [
      { type: 'visible', target: `[data-testid="${TEST_IDS.ui.successToast}"]` },
    ],
  })

  return scenarios
}

// Generate auth scenarios (Nyx)
function generateAuthScenarios(): Scenario[] {
  const scenarios: Scenario[] = []

  // Login tests
  scenarios.push({
    id: 'auth-login-valid',
    name: 'Login with valid credentials',
    description: 'Verify successful login with valid credentials',
    agent: 'nyx',
    category: 'auth',
    priority: 'critical',
    tags: ['auth', 'login'],
    requiresAuth: false,
    steps: [
      { action: 'goto', target: '/login' },
      { action: 'fill', target: `[data-testid="${TEST_IDS.auth.emailInput}"]`, value: '{{TEST_EMAIL}}' },
      { action: 'fill', target: `[data-testid="${TEST_IDS.auth.passwordInput}"]`, value: '{{TEST_PASSWORD}}' },
      { action: 'click', target: `[data-testid="${TEST_IDS.auth.submitBtn}"]` },
      { action: 'wait', value: 2000 },
    ],
    assertions: [
      { type: 'url', expected: '/home|/onboarding' },
    ],
  })

  scenarios.push({
    id: 'auth-login-invalid',
    name: 'Login with invalid credentials shows error',
    description: 'Verify error message for invalid credentials',
    agent: 'nyx',
    category: 'auth',
    priority: 'critical',
    tags: ['auth', 'login', 'error'],
    requiresAuth: false,
    steps: [
      { action: 'goto', target: '/login' },
      { action: 'fill', target: `[data-testid="${TEST_IDS.auth.emailInput}"]`, value: 'invalid@test.com' },
      { action: 'fill', target: `[data-testid="${TEST_IDS.auth.passwordInput}"]`, value: 'wrongpassword' },
      { action: 'click', target: `[data-testid="${TEST_IDS.auth.submitBtn}"]` },
      { action: 'wait', value: 1000 },
    ],
    assertions: [
      { type: 'url', expected: '/login' },
      { type: 'visible', target: `[data-testid="${TEST_IDS.auth.errorMessage}"]` },
    ],
  })

  // Session tests
  scenarios.push({
    id: 'auth-session-persist',
    name: 'Session persists after page reload',
    description: 'Verify session is maintained after browser refresh',
    agent: 'nyx',
    category: 'auth',
    priority: 'high',
    tags: ['auth', 'session'],
    requiresAuth: true,
    steps: [
      { action: 'goto', target: '/home' },
      { action: 'custom', value: 'page.reload()' },
      { action: 'wait', value: 1000 },
    ],
    assertions: [
      { type: 'url', expected: '/home' },
    ],
  })

  return scenarios
}

// Generate visual/a11y scenarios (Iris)
function generateVisualScenarios(): Scenario[] {
  const scenarios: Scenario[] = []
  const pagesToTest = ['/home', '/calendar', '/challenges', '/settings', '/rankings']

  // Visual regression tests
  for (const page of pagesToTest) {
    scenarios.push({
      id: `visual-snapshot-${page.replace(/\//g, '-')}`,
      name: `Visual snapshot for ${page}`,
      description: `Capture visual snapshot of ${page} for regression testing`,
      agent: 'iris',
      category: 'visual',
      priority: 'medium',
      tags: ['visual', 'snapshot'],
      requiresAuth: true,
      steps: [
        { action: 'goto', target: page },
        { action: 'wait', value: 1000 },
        { action: 'screenshot', value: `${page.replace(/\//g, '-')}.png` },
      ],
      assertions: [],
    })
  }

  // Accessibility tests
  for (const page of pagesToTest) {
    scenarios.push({
      id: `a11y-check-${page.replace(/\//g, '-')}`,
      name: `Accessibility check for ${page}`,
      description: `Run axe accessibility scan on ${page}`,
      agent: 'iris',
      category: 'a11y',
      priority: 'high',
      tags: ['a11y', 'accessibility', 'wcag'],
      requiresAuth: true,
      steps: [
        { action: 'goto', target: page },
        { action: 'wait', value: 1000 },
        { action: 'custom', value: 'axe.analyze()' },
      ],
      assertions: [],
    })
  }

  // Responsive tests
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ]

  for (const viewport of viewports) {
    scenarios.push({
      id: `responsive-${viewport.name}-home`,
      name: `Responsive layout on ${viewport.name}`,
      description: `Verify home page renders correctly on ${viewport.name} viewport`,
      agent: 'iris',
      category: 'visual',
      priority: 'medium',
      tags: ['visual', 'responsive', viewport.name],
      requiresAuth: true,
      viewports: [viewport.name as 'mobile' | 'tablet' | 'desktop'],
      steps: [
        { action: 'custom', value: `page.setViewportSize({ width: ${viewport.width}, height: ${viewport.height} })` },
        { action: 'goto', target: '/home' },
        { action: 'wait', value: 1000 },
        { action: 'screenshot', value: `home-${viewport.name}.png` },
      ],
      assertions: [],
    })
  }

  return scenarios
}

// Generate performance scenarios (Kronos)
function generatePerformanceScenarios(): Scenario[] {
  const scenarios: Scenario[] = []
  const pagesToTest = ['/home', '/calendar', '/challenges', '/rankings']

  // Page load performance
  for (const page of pagesToTest) {
    scenarios.push({
      id: `perf-load-${page.replace(/\//g, '-')}`,
      name: `Performance: ${page} load time`,
      description: `Measure load time for ${page}`,
      agent: 'kronos',
      category: 'performance',
      priority: 'medium',
      tags: ['performance', 'load-time'],
      requiresAuth: true,
      timeout: 60000,
      steps: [
        { action: 'custom', value: 'const start = Date.now()' },
        { action: 'goto', target: page },
        { action: 'wait', value: 100, description: 'networkidle' },
        { action: 'custom', value: 'const loadTime = Date.now() - start; console.log(`Load time: ${loadTime}ms`)' },
      ],
      assertions: [],
    })
  }

  // API response time
  scenarios.push({
    id: 'perf-api-response',
    name: 'API response times under threshold',
    description: 'Verify API calls complete within acceptable time',
    agent: 'kronos',
    category: 'performance',
    priority: 'high',
    tags: ['performance', 'api'],
    requiresAuth: true,
    timeout: 60000,
    steps: [
      { action: 'goto', target: '/home' },
      { action: 'wait', value: 2000, description: 'networkidle' },
    ],
    assertions: [],
  })

  // Stress test
  scenarios.push({
    id: 'perf-rapid-navigation',
    name: 'Handle rapid navigation',
    description: 'Verify app handles rapid page changes without errors',
    agent: 'kronos',
    category: 'performance',
    priority: 'medium',
    tags: ['performance', 'stress'],
    requiresAuth: true,
    timeout: 60000,
    steps: [
      { action: 'goto', target: '/home' },
      { action: 'goto', target: '/calendar' },
      { action: 'goto', target: '/challenges' },
      { action: 'goto', target: '/home' },
      { action: 'goto', target: '/teams' },
      { action: 'goto', target: '/settings' },
    ],
    assertions: [
      { type: 'url', expected: '/settings' },
    ],
  })

  return scenarios
}

// Generate smoke test scenarios
function generateSmokeScenarios(): Scenario[] {
  return [
    {
      id: 'smoke-critical-path',
      name: 'Smoke: Critical user path',
      description: 'Verify critical user journey works',
      agent: 'atlas',
      category: 'smoke',
      priority: 'critical',
      tags: ['smoke', 'critical-path'],
      requiresAuth: true,
      steps: [
        { action: 'goto', target: '/home' },
        { action: 'wait', value: 500 },
        { action: 'goto', target: '/activity/create' },
        { action: 'wait', value: 500 },
        { action: 'goto', target: '/challenges' },
        { action: 'wait', value: 500 },
        { action: 'goto', target: '/settings' },
      ],
      assertions: [
        { type: 'url', expected: '/settings' },
      ],
    },
    {
      id: 'smoke-auth-flow',
      name: 'Smoke: Auth flow works',
      description: 'Verify basic auth flow is functional',
      agent: 'nyx',
      category: 'smoke',
      priority: 'critical',
      tags: ['smoke', 'auth'],
      requiresAuth: false,
      steps: [
        { action: 'goto', target: '/login' },
        { action: 'wait', value: 500 },
      ],
      assertions: [
        { type: 'visible', target: `[data-testid="${TEST_IDS.auth.loginForm}"]` },
      ],
    },
  ]
}

// Main generator function
function generateScenarios(config: GeneratorConfig): ScenarioFile {
  let allScenarios: Scenario[] = []

  if (config.agents?.includes('atlas')) {
    allScenarios = allScenarios.concat(generateNavigationScenarios())
  }

  if (config.agents?.includes('hermes')) {
    allScenarios = allScenarios.concat(generateFormScenarios())
  }

  if (config.agents?.includes('nyx')) {
    allScenarios = allScenarios.concat(generateAuthScenarios())
  }

  if (config.agents?.includes('iris')) {
    allScenarios = allScenarios.concat(generateVisualScenarios())
  }

  if (config.agents?.includes('kronos')) {
    allScenarios = allScenarios.concat(generatePerformanceScenarios())
  }

  if (config.includeSmoke) {
    allScenarios = allScenarios.concat(generateSmokeScenarios())
  }

  // Filter by priority if specified
  if (config.priorities) {
    allScenarios = allScenarios.filter(s => config.priorities!.includes(s.priority))
  }

  // Filter by category if specified
  if (config.categories) {
    allScenarios = allScenarios.filter(s => config.categories!.includes(s.category))
  }

  // Limit total scenarios
  if (config.maxScenarios && allScenarios.length > config.maxScenarios) {
    // Prioritize critical and high priority scenarios
    allScenarios.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    allScenarios = allScenarios.slice(0, config.maxScenarios)
  }

  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    scenarios: allScenarios,
  }
}

// Main execution
async function main() {
  const config = parseArgs()

  console.log('Generating test scenarios...')
  console.log(`Config: ${JSON.stringify(config, null, 2)}`)

  const scenarioFile = generateScenarios(config)

  console.log(`\nGenerated ${scenarioFile.scenarios.length} scenarios`)

  // Group by agent
  const byAgent = scenarioFile.scenarios.reduce((acc, s) => {
    acc[s.agent] = (acc[s.agent] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('By agent:')
  for (const [agent, count] of Object.entries(byAgent)) {
    console.log(`  ${agent}: ${count}`)
  }

  // Group by category
  const byCategory = scenarioFile.scenarios.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('By category:')
  for (const [category, count] of Object.entries(byCategory)) {
    console.log(`  ${category}: ${count}`)
  }

  // Write to file
  const outputPath = path.join(__dirname, 'generated-scenarios.json')
  fs.writeFileSync(outputPath, JSON.stringify(scenarioFile, null, 2))
  console.log(`\nWritten to: ${outputPath}`)
}

main().catch(console.error)
