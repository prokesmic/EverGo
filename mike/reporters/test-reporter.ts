/**
 * Test Reporter Module
 * Generates comprehensive test reports in multiple formats
 */

import { TestResult, TestScenario, DiscoveredElement, MikeConfig, TestReport, ScenarioCategory } from '../core/types'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

interface ReportData {
  results: TestResult[]
  scenarios: TestScenario[]
  discoveredElements: DiscoveredElement[]
  config: MikeConfig
}

export class TestReporter {
  private config: MikeConfig

  constructor(config: MikeConfig) {
    this.config = config
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport(data: ReportData): Promise<TestReport> {
    const report = this.buildReport(data)

    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true })
    }

    // Generate JSON report
    await this.generateJsonReport(report)

    // Generate HTML report
    await this.generateHtmlReport(report, data)

    // Generate markdown summary
    await this.generateMarkdownSummary(report)

    // Generate JUnit XML for CI integration
    await this.generateJunitXml(data.results)

    return report
  }

  /**
   * Build report object
   */
  private buildReport(data: ReportData): TestReport {
    const { results, scenarios, discoveredElements, config } = data

    const passed = results.filter(r => r.status === 'passed').length
    const failed = results.filter(r => r.status === 'failed').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const total = results.length

    // Group by category
    const byCategory: Record<ScenarioCategory, { total: number; passed: number; failed: number }> = {} as any
    for (const scenario of scenarios) {
      if (!byCategory[scenario.category]) {
        byCategory[scenario.category] = { total: 0, passed: 0, failed: 0 }
      }
      byCategory[scenario.category].total++

      const result = results.find(r => r.scenarioId === scenario.id)
      if (result?.status === 'passed') byCategory[scenario.category].passed++
      if (result?.status === 'failed') byCategory[scenario.category].failed++
    }

    // Group by priority
    const byPriority: Record<string, { total: number; passed: number; failed: number }> = {}
    for (const scenario of scenarios) {
      if (!byPriority[scenario.priority]) {
        byPriority[scenario.priority] = { total: 0, passed: 0, failed: 0 }
      }
      byPriority[scenario.priority].total++

      const result = results.find(r => r.scenarioId === scenario.id)
      if (result?.status === 'passed') byPriority[scenario.priority].passed++
      if (result?.status === 'failed') byPriority[scenario.priority].failed++
    }

    // Calculate test coverage estimate
    const totalElements = discoveredElements.length
    const testedElements = new Set(scenarios.flatMap(s => s.steps.map(step => step.selector).filter(Boolean))).size
    const coverageEstimate = totalElements > 0 ? (testedElements / totalElements) * 100 : 0

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, scenarios, discoveredElements)

    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      environment: {
        baseUrl: config.baseUrl,
        browser: 'Chromium',
        viewport: '1920x1080',
        nodeVersion: process.version,
        platform: process.platform
      },
      summary: {
        total,
        passed,
        failed,
        skipped,
        passRate: total > 0 ? (passed / total) * 100 : 0
      },
      byCategory,
      byPriority,
      results,
      discoveredElements: discoveredElements.length,
      scenarios: scenarios.length,
      coverageEstimate,
      recommendations
    }
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(
    results: TestResult[],
    scenarios: TestScenario[],
    elements: DiscoveredElement[]
  ): string[] {
    const recommendations: string[] = []

    // Check pass rate
    const passRate = results.length > 0
      ? (results.filter(r => r.status === 'passed').length / results.length) * 100
      : 0

    if (passRate < 80) {
      recommendations.push('Pass rate is below 80%. Review failing tests and fix underlying issues.')
    }

    // Check for critical test failures
    const criticalFailures = results.filter(r => {
      const scenario = scenarios.find(s => s.id === r.scenarioId)
      return r.status === 'failed' && scenario?.priority === 'critical'
    })

    if (criticalFailures.length > 0) {
      recommendations.push(`${criticalFailures.length} critical tests failed. These should be fixed immediately.`)
    }

    // Check for repeated errors
    const errorMessages = results.filter(r => r.error).map(r => r.error!)
    const errorCounts = new Map<string, number>()
    errorMessages.forEach(msg => {
      const key = msg.slice(0, 50)
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1)
    })

    for (const [error, count] of errorCounts) {
      if (count > 2) {
        recommendations.push(`Repeated error (${count}x): "${error}..." - Consider fixing root cause.`)
      }
    }

    // Check element coverage
    const buttonCount = elements.filter(e => e.type === 'button').length
    const testedButtons = new Set(
      scenarios.flatMap(s => s.steps)
        .filter(step => step.action === 'click')
        .map(step => step.selector)
    ).size

    if (buttonCount > 0 && testedButtons < buttonCount * 0.5) {
      recommendations.push(`Only ${Math.round((testedButtons / buttonCount) * 100)}% of buttons are tested. Consider adding more button tests.`)
    }

    // Check form coverage
    const formCount = elements.filter(e => e.type === 'form').length
    const formScenarios = scenarios.filter(s => s.category === 'form_submission').length

    if (formCount > 0 && formScenarios < formCount * 3) {
      recommendations.push(`Forms may need more test coverage. Consider adding valid/invalid/edge case tests.`)
    }

    // Suggest accessibility improvements
    const a11yScenarios = scenarios.filter(s => s.category === 'accessibility')
    if (a11yScenarios.length === 0) {
      recommendations.push('No accessibility tests found. Consider adding accessibility scenarios.')
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests are healthy! Keep up the good work.')
    }

    return recommendations
  }

  /**
   * Generate JSON report
   */
  private async generateJsonReport(report: TestReport): Promise<void> {
    const filepath = path.join(this.config.outputDir, 'report.json')
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
  }

  /**
   * Generate HTML report
   */
  private async generateHtmlReport(report: TestReport, data: ReportData): Promise<void> {
    const html = this.generateHtmlContent(report, data)
    const filepath = path.join(this.config.outputDir, 'report.html')
    fs.writeFileSync(filepath, html)
  }

  /**
   * Generate HTML content for report
   */
  private generateHtmlContent(report: TestReport, data: ReportData): string {
    const failedTests = data.results.filter(r => r.status === 'failed')
    const passedTests = data.results.filter(r => r.status === 'passed')

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mike Test Report - ${new Date(report.timestamp).toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

    /* Header */
    .header { text-align: center; margin-bottom: 3rem; padding: 3rem; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 1rem; border: 1px solid #334155; }
    .header h1 { font-size: 2.5rem; color: #f97316; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .header p { color: #94a3b8; }

    /* Summary Cards */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .summary-card { background: #1e293b; border-radius: 0.75rem; padding: 1.5rem; text-align: center; border: 1px solid #334155; }
    .summary-card h3 { font-size: 2.5rem; margin-bottom: 0.25rem; }
    .summary-card p { color: #94a3b8; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-card.passed h3 { color: #22c55e; }
    .summary-card.failed h3 { color: #ef4444; }
    .summary-card.total h3 { color: #3b82f6; }
    .summary-card.rate h3 { color: #f97316; }

    /* Progress Bar */
    .progress-container { margin-bottom: 2rem; }
    .progress-bar { height: 1rem; background: #334155; border-radius: 0.5rem; overflow: hidden; display: flex; }
    .progress-passed { background: #22c55e; }
    .progress-failed { background: #ef4444; }
    .progress-skipped { background: #94a3b8; }

    /* Sections */
    .section { background: #1e293b; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #334155; }
    .section h2 { color: #f97316; margin-bottom: 1rem; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }

    /* Category Grid */
    .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
    .category-item { background: #0f172a; padding: 1rem; border-radius: 0.5rem; text-align: center; }
    .category-item h4 { font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; }
    .category-item .stats { display: flex; justify-content: center; gap: 0.5rem; font-size: 0.875rem; }
    .category-item .stats span { padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
    .cat-passed { background: #22c55e20; color: #22c55e; }
    .cat-failed { background: #ef444420; color: #ef4444; }

    /* Test List */
    .test-list { list-style: none; }
    .test-item { padding: 1rem; border-bottom: 1px solid #334155; display: flex; align-items: center; gap: 1rem; }
    .test-item:last-child { border-bottom: none; }
    .test-status { width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .test-status.passed { background: #22c55e20; color: #22c55e; }
    .test-status.failed { background: #ef444420; color: #ef4444; }
    .test-info { flex: 1; }
    .test-name { font-weight: 500; margin-bottom: 0.25rem; }
    .test-meta { font-size: 0.75rem; color: #94a3b8; display: flex; gap: 1rem; }
    .test-error { background: #ef444410; border: 1px solid #ef444440; border-radius: 0.5rem; padding: 0.75rem; margin-top: 0.5rem; font-family: monospace; font-size: 0.75rem; color: #fca5a5; }

    /* Recommendations */
    .recommendations { list-style: none; }
    .recommendations li { padding: 0.75rem; background: #0f172a; border-radius: 0.5rem; margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.5rem; }
    .recommendations li::before { content: "💡"; }

    /* Footer */
    .footer { text-align: center; padding: 2rem; color: #64748b; font-size: 0.875rem; }

    /* Responsive */
    @media (max-width: 640px) {
      .container { padding: 1rem; }
      .header h1 { font-size: 1.5rem; }
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>🤖 Mike Test Report</h1>
      <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
      <p style="margin-top: 0.5rem; font-size: 0.875rem;">${report.environment.baseUrl} | ${report.environment.browser} | ${report.environment.viewport}</p>
    </header>

    <div class="summary-grid">
      <div class="summary-card total">
        <h3>${report.summary.total}</h3>
        <p>Total Tests</p>
      </div>
      <div class="summary-card passed">
        <h3>${report.summary.passed}</h3>
        <p>Passed</p>
      </div>
      <div class="summary-card failed">
        <h3>${report.summary.failed}</h3>
        <p>Failed</p>
      </div>
      <div class="summary-card rate">
        <h3>${report.summary.passRate.toFixed(1)}%</h3>
        <p>Pass Rate</p>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-passed" style="width: ${(report.summary.passed / report.summary.total * 100)}%"></div>
        <div class="progress-failed" style="width: ${(report.summary.failed / report.summary.total * 100)}%"></div>
        <div class="progress-skipped" style="width: ${(report.summary.skipped / report.summary.total * 100)}%"></div>
      </div>
    </div>

    <section class="section">
      <h2>📊 Results by Category</h2>
      <div class="category-grid">
        ${Object.entries(report.byCategory).map(([cat, stats]) => `
          <div class="category-item">
            <h4>${cat.replace('_', ' ')}</h4>
            <div class="stats">
              <span class="cat-passed">✓ ${stats.passed}</span>
              <span class="cat-failed">✗ ${stats.failed}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    ${failedTests.length > 0 ? `
    <section class="section">
      <h2>❌ Failed Tests (${failedTests.length})</h2>
      <ul class="test-list">
        ${failedTests.map(test => `
          <li class="test-item">
            <div class="test-status failed">✗</div>
            <div class="test-info">
              <div class="test-name">${test.name}</div>
              <div class="test-meta">
                <span>Duration: ${test.duration}ms</span>
                <span>Retries: ${test.retryCount || 0}</span>
              </div>
              ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    </section>
    ` : ''}

    <section class="section">
      <h2>✅ Passed Tests (${passedTests.length})</h2>
      <ul class="test-list">
        ${passedTests.slice(0, 20).map(test => `
          <li class="test-item">
            <div class="test-status passed">✓</div>
            <div class="test-info">
              <div class="test-name">${test.name}</div>
              <div class="test-meta">
                <span>Duration: ${test.duration}ms</span>
              </div>
            </div>
          </li>
        `).join('')}
        ${passedTests.length > 20 ? `<li class="test-item" style="justify-content: center; color: #64748b;">... and ${passedTests.length - 20} more passed tests</li>` : ''}
      </ul>
    </section>

    <section class="section">
      <h2>💡 Recommendations</h2>
      <ul class="recommendations">
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </section>

    <section class="section">
      <h2>📈 Coverage Summary</h2>
      <p>Discovered Elements: <strong>${report.discoveredElements}</strong></p>
      <p>Generated Scenarios: <strong>${report.scenarios}</strong></p>
      <p>Estimated Coverage: <strong>${report.coverageEstimate.toFixed(1)}%</strong></p>
      <p>Total Duration: <strong>${(report.duration / 1000).toFixed(2)}s</strong></p>
    </section>

    <footer class="footer">
      <p>Generated by Mike - Master Intelligent Knowledge Engine for Testing</p>
      <p>Node ${report.environment.nodeVersion} | ${report.environment.platform}</p>
    </footer>
  </div>
</body>
</html>
    `
  }

  /**
   * Generate markdown summary
   */
  private async generateMarkdownSummary(report: TestReport): Promise<void> {
    const md = `# Mike Test Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}
**Environment:** ${report.environment.baseUrl} | ${report.environment.browser}

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${report.summary.total} |
| Passed | ${report.summary.passed} |
| Failed | ${report.summary.failed} |
| Skipped | ${report.summary.skipped} |
| Pass Rate | ${report.summary.passRate.toFixed(1)}% |

## Results by Category

${Object.entries(report.byCategory).map(([cat, stats]) =>
      `- **${cat}**: ${stats.passed}/${stats.total} passed`
    ).join('\n')}

## Failed Tests

${report.results.filter(r => r.status === 'failed').map(r =>
      `- ❌ ${r.name}\n  - Error: ${r.error}`
    ).join('\n') || 'No failed tests! 🎉'}

## Recommendations

${report.recommendations.map(r => `- ${r}`).join('\n')}

---
*Generated by Mike - Master Intelligent Knowledge Engine for Testing*
`

    const filepath = path.join(this.config.outputDir, 'REPORT.md')
    fs.writeFileSync(filepath, md)
  }

  /**
   * Generate JUnit XML for CI integration
   */
  private async generateJunitXml(results: TestResult[]): Promise<void> {
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0) / 1000
    const failures = results.filter(r => r.status === 'failed').length
    const errors = results.filter(r => r.status === 'error').length

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Mike Tests" tests="${results.length}" failures="${failures}" errors="${errors}" time="${totalTime.toFixed(2)}">
  <testsuite name="Mike Test Suite" tests="${results.length}" failures="${failures}" errors="${errors}" time="${totalTime.toFixed(2)}">
    ${results.map(r => `
    <testcase name="${this.escapeXml(r.name)}" time="${(r.duration / 1000).toFixed(2)}" classname="Mike.${r.scenarioId}">
      ${r.status === 'failed' ? `<failure message="${this.escapeXml(r.error || 'Test failed')}">${this.escapeXml(r.errorStack || '')}</failure>` : ''}
      ${r.status === 'error' ? `<error message="${this.escapeXml(r.error || 'Test error')}">${this.escapeXml(r.errorStack || '')}</error>` : ''}
      ${r.status === 'skipped' ? '<skipped/>' : ''}
    </testcase>`).join('')}
  </testsuite>
</testsuites>
`

    const filepath = path.join(this.config.outputDir, 'junit.xml')
    fs.writeFileSync(filepath, xml)
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

export default TestReporter
