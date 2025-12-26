/**
 * Pre-built Test Scenarios for Evergo Application
 *
 * These scenarios can be run immediately without crawling.
 */

import { TestScenario } from '../core/types'
import { v4 as uuidv4 } from 'uuid'

const BASE_URL = process.env.MIKE_BASE_URL || 'http://localhost:3000'

export const evergoScenarios: TestScenario[] = [
  // ============================================
  // AUTHENTICATION SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: 'User can log in with valid credentials',
    description: 'Test the login flow with valid email and password',
    category: 'authentication',
    priority: 'critical',
    pageUrl: `${BASE_URL}/login`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/login`, description: 'Go to login page', critical: true },
      { id: uuidv4(), action: 'assertVisible', selector: 'form', description: 'Verify login form is visible', critical: true },
      { id: uuidv4(), action: 'fill', selector: 'input[type="email"], input[name="email"]', value: '${TEST_EMAIL}', description: 'Enter email', critical: true },
      { id: uuidv4(), action: 'fill', selector: 'input[type="password"], input[name="password"]', value: '${TEST_PASSWORD}', description: 'Enter password', critical: true },
      { id: uuidv4(), action: 'screenshot', description: 'Screenshot before submit', critical: false },
      { id: uuidv4(), action: 'click', selector: 'button[type="submit"]', description: 'Click login', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 10000 }, description: 'Wait for login', critical: true },
    ],
    expectedOutcome: { type: 'url_change', value: '/home' },
    tags: ['auth', 'login', 'critical', 'smoke'],
    retryable: true
  },
  {
    id: uuidv4(),
    name: 'Login fails with invalid credentials',
    description: 'Verify error message appears for wrong password',
    category: 'authentication',
    priority: 'high',
    pageUrl: `${BASE_URL}/login`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/login`, description: 'Go to login page', critical: true },
      { id: uuidv4(), action: 'fill', selector: 'input[type="email"]', value: 'wrong@example.com', description: 'Enter wrong email', critical: true },
      { id: uuidv4(), action: 'fill', selector: 'input[type="password"]', value: 'wrongpassword', description: 'Enter wrong password', critical: true },
      { id: uuidv4(), action: 'click', selector: 'button[type="submit"]', description: 'Click login', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'timeout', value: 2000 }, description: 'Wait for error', critical: false },
    ],
    expectedOutcome: { type: 'error_message' },
    tags: ['auth', 'login', 'error-handling'],
    retryable: true
  },
  {
    id: uuidv4(),
    name: 'Protected pages redirect to login',
    description: 'Verify unauthenticated users are redirected to login',
    category: 'authentication',
    priority: 'high',
    pageUrl: `${BASE_URL}/home`,
    preconditions: ['User is logged out'],
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/home`, description: 'Try to access dashboard', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 5000 }, description: 'Wait for redirect', critical: true },
      { id: uuidv4(), action: 'assertUrl', value: '/login', description: 'Verify redirect to login', critical: true },
    ],
    expectedOutcome: { type: 'url_change', value: '/login' },
    tags: ['auth', 'security'],
    retryable: true
  },

  // ============================================
  // NAVIGATION SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: 'Landing page loads correctly',
    description: 'Verify the landing page loads with expected elements',
    category: 'navigation',
    priority: 'critical',
    pageUrl: `${BASE_URL}/`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/`, description: 'Go to landing page', critical: true },
      { id: uuidv4(), action: 'assertVisible', selector: 'main, body', description: 'Verify main content', critical: true },
      { id: uuidv4(), action: 'screenshot', description: 'Screenshot landing page', critical: false },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'main' },
    tags: ['navigation', 'smoke', 'landing'],
    retryable: true
  },
  {
    id: uuidv4(),
    name: 'Dashboard loads after login',
    description: 'Verify dashboard page loads with all widgets',
    category: 'navigation',
    priority: 'critical',
    pageUrl: `${BASE_URL}/home`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/home`, description: 'Go to dashboard', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 10000 }, description: 'Wait for data', critical: false },
      { id: uuidv4(), action: 'assertVisible', selector: 'main', description: 'Verify main content', critical: true },
      { id: uuidv4(), action: 'screenshot', description: 'Screenshot dashboard', critical: false },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'main' },
    tags: ['navigation', 'smoke', 'dashboard'],
    retryable: true
  },
  {
    id: uuidv4(),
    name: 'Challenges page loads',
    description: 'Navigate to challenges and verify content',
    category: 'navigation',
    priority: 'high',
    pageUrl: `${BASE_URL}/challenges`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/challenges`, description: 'Go to challenges', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 10000 }, description: 'Wait for load', critical: false },
      { id: uuidv4(), action: 'assertVisible', selector: 'main', description: 'Verify main content', critical: true },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'main' },
    tags: ['navigation', 'challenges'],
    retryable: true
  },
  {
    id: uuidv4(),
    name: 'Rankings page loads',
    description: 'Navigate to rankings and verify leaderboard',
    category: 'navigation',
    priority: 'high',
    pageUrl: `${BASE_URL}/rankings`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/rankings`, description: 'Go to rankings', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 10000 }, description: 'Wait for load', critical: false },
      { id: uuidv4(), action: 'assertVisible', selector: 'main', description: 'Verify main content', critical: true },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'main' },
    tags: ['navigation', 'rankings'],
    retryable: true
  },
  {
    id: uuidv4(),
    name: 'Teams page loads',
    description: 'Navigate to teams page',
    category: 'navigation',
    priority: 'medium',
    pageUrl: `${BASE_URL}/teams`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/teams`, description: 'Go to teams', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 10000 }, description: 'Wait for load', critical: false },
      { id: uuidv4(), action: 'assertVisible', selector: 'main', description: 'Verify main content', critical: true },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'main' },
    tags: ['navigation', 'teams'],
    retryable: true
  },

  // ============================================
  // ACTIVITY SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: 'Activity creation page loads',
    description: 'Navigate to activity creation form',
    category: 'navigation',
    priority: 'high',
    pageUrl: `${BASE_URL}/activity/create`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/activity/create`, description: 'Go to create activity', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 5000 }, description: 'Wait for load', critical: false },
      { id: uuidv4(), action: 'assertVisible', selector: 'form, main', description: 'Verify form exists', critical: true },
      { id: uuidv4(), action: 'screenshot', description: 'Screenshot form', critical: false },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'form' },
    tags: ['activity', 'form'],
    retryable: true
  },

  // ============================================
  // USER FLOW SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: 'Complete user onboarding flow',
    description: 'New user completes the full onboarding process',
    category: 'user_flow',
    priority: 'high',
    pageUrl: `${BASE_URL}/register`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/register`, description: 'Go to register', critical: true },
      { id: uuidv4(), action: 'assertVisible', selector: 'form', description: 'Verify register form', critical: true },
      { id: uuidv4(), action: 'screenshot', description: 'Screenshot register', critical: false },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'form' },
    tags: ['user-flow', 'onboarding'],
    retryable: true
  },

  // ============================================
  // BUTTON CLICK SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: 'Log Activity CTA button works',
    description: 'Click the Log Activity button on dashboard',
    category: 'button_click',
    priority: 'high',
    pageUrl: `${BASE_URL}/home`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/home`, description: 'Go to dashboard', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 5000 }, description: 'Wait for load', critical: false },
      { id: uuidv4(), action: 'click', selector: 'a[href="/activity/create"], button:has-text("Log Activity")', description: 'Click Log Activity', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 5000 }, description: 'Wait for navigation', critical: false },
      { id: uuidv4(), action: 'assertUrl', value: '/activity', description: 'Verify navigation', critical: true },
    ],
    expectedOutcome: { type: 'url_change', value: '/activity' },
    tags: ['button', 'cta', 'activity'],
    retryable: true
  },

  // ============================================
  // ERROR HANDLING SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: '404 page displays correctly',
    description: 'Non-existent page shows 404 error',
    category: 'error_handling',
    priority: 'medium',
    pageUrl: `${BASE_URL}/nonexistent-page-${Date.now()}`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/nonexistent-page-${Date.now()}`, description: 'Go to invalid page', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'timeout', value: 2000 }, description: 'Wait for response', critical: false },
      { id: uuidv4(), action: 'screenshot', description: 'Screenshot 404 page', critical: false },
    ],
    expectedOutcome: { type: 'text_present', value: '404' },
    tags: ['error', '404'],
    retryable: true
  },

  // ============================================
  // RESPONSIVE DESIGN SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: 'Dashboard is mobile responsive',
    description: 'Verify dashboard layout on mobile viewport',
    category: 'responsive',
    priority: 'medium',
    pageUrl: `${BASE_URL}/home`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/home`, description: 'Go to dashboard', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 5000 }, description: 'Wait for load', critical: false },
      { id: uuidv4(), action: 'assertVisible', selector: 'main', description: 'Verify content visible', critical: true },
      { id: uuidv4(), action: 'screenshot', description: 'Screenshot mobile view', critical: false },
    ],
    expectedOutcome: { type: 'element_visible', selector: 'main' },
    tags: ['responsive', 'mobile'],
    retryable: true
  },

  // ============================================
  // ACCESSIBILITY SCENARIOS
  // ============================================
  {
    id: uuidv4(),
    name: 'Dashboard passes accessibility checks',
    description: 'Run basic accessibility audit on dashboard',
    category: 'accessibility',
    priority: 'medium',
    pageUrl: `${BASE_URL}/home`,
    steps: [
      { id: uuidv4(), action: 'navigate', value: `${BASE_URL}/home`, description: 'Go to dashboard', critical: true },
      { id: uuidv4(), action: 'wait', waitFor: { type: 'networkidle', value: 5000 }, description: 'Wait for load', critical: false },
      { id: uuidv4(), action: 'custom', value: 'checkAccessibility', description: 'Run accessibility audit', critical: true },
    ],
    expectedOutcome: { type: 'custom', value: 'no critical accessibility violations' },
    tags: ['accessibility', 'a11y'],
    retryable: true
  },
]

export default evergoScenarios
