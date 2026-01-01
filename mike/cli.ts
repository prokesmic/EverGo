#!/usr/bin/env npx ts-node

/**
 * Mike CLI - Command Line Interface for the Testing Agent
 *
 * Usage:
 *   npx ts-node mike/cli.ts --help
 *   npx ts-node mike/cli.ts smoke
 *   npx ts-node mike/cli.ts full
 *   npx ts-node mike/cli.ts --category navigation
 */

import { Mike } from './core/mike'
import { MikeConfig } from './core/types'
import chalk from 'chalk'

// Parse command line arguments
const args = process.argv.slice(2)

interface CliOptions {
  command: 'smoke' | 'full' | 'discover' | 'category' | 'help'
  category?: string
  baseUrl?: string
  headless?: boolean
  verbose?: boolean
  output?: string
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    command: 'help'
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    // Commands
    if (arg === 'smoke') options.command = 'smoke'
    else if (arg === 'full') options.command = 'full'
    else if (arg === 'discover') options.command = 'discover'
    else if (arg === 'help' || arg === '--help' || arg === '-h') options.command = 'help'

    // Options
    else if (arg === '--category' || arg === '-c') {
      options.command = 'category'
      options.category = args[++i]
    }
    else if (arg === '--url' || arg === '-u') options.baseUrl = args[++i]
    else if (arg === '--headless') options.headless = true
    else if (arg === '--no-headless') options.headless = false
    else if (arg === '--verbose' || arg === '-v') options.verbose = true
    else if (arg === '--output' || arg === '-o') options.output = args[++i]
  }

  return options
}

function showHelp(): void {
  console.log(chalk.cyan.bold(`
  ███╗   ███╗██╗██╗  ██╗███████╗
  ████╗ ████║██║██║ ██╔╝██╔════╝
  ██╔████╔██║██║█████╔╝ █████╗
  ██║╚██╔╝██║██║██╔═██╗ ██╔══╝
  ██║ ╚═╝ ██║██║██║  ██╗███████╗
  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚══════╝
  Master Intelligent Knowledge Engine for Testing
  `))

  console.log(chalk.white(`
${chalk.bold('Usage:')}
  npx ts-node mike/cli.ts <command> [options]

${chalk.bold('Commands:')}
  ${chalk.green('smoke')}       Run quick smoke tests (critical paths only)
  ${chalk.green('full')}        Run full test suite (crawl, discover, generate, execute)
  ${chalk.green('discover')}    Discover elements without running tests
  ${chalk.green('help')}        Show this help message

${chalk.bold('Options:')}
  ${chalk.yellow('--category, -c')} <name>   Run tests for specific category
                           Categories: navigation, authentication, form_submission,
                           button_click, link_click, data_validation, error_handling,
                           accessibility, user_flow

  ${chalk.yellow('--url, -u')} <url>        Base URL to test (default: http://localhost:3000)
  ${chalk.yellow('--headless')}            Run browser in headless mode (default)
  ${chalk.yellow('--no-headless')}         Run browser with visible UI
  ${chalk.yellow('--verbose, -v')}         Show detailed output
  ${chalk.yellow('--output, -o')} <dir>     Output directory for reports (default: ./mike/results)

${chalk.bold('Examples:')}
  ${chalk.gray('# Run smoke tests')}
  npx ts-node mike/cli.ts smoke

  ${chalk.gray('# Run full test suite')}
  npx ts-node mike/cli.ts full --verbose

  ${chalk.gray('# Run only form tests')}
  npx ts-node mike/cli.ts --category form_submission

  ${chalk.gray('# Test production with visible browser')}
  npx ts-node mike/cli.ts full --url https://evergo.app --no-headless

${chalk.bold('Environment Variables:')}
  ${chalk.yellow('MIKE_TEST_EMAIL')}      Test user email
  ${chalk.yellow('MIKE_TEST_PASSWORD')}   Test user password

${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${chalk.gray('Mike is your automated testing companion. He never sleeps.')}
  `))
}

async function main(): Promise<void> {
  const options = parseArgs(args)

  if (options.command === 'help') {
    showHelp()
    process.exit(0)
  }

  // Build config
  const config: Partial<MikeConfig> = {
    baseUrl: options.baseUrl || process.env.MIKE_BASE_URL || 'http://localhost:3000',
    headless: options.headless ?? true,
    verbose: options.verbose ?? false,
    outputDir: options.output || './mike/results',
    testUser: {
      email: process.env.TEST_USER_EMAIL || 'playwright@test.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    }
  }

  console.log(chalk.gray(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`))
  console.log(chalk.cyan(`Target: ${config.baseUrl}`))
  console.log(chalk.cyan(`Mode: ${config.headless ? 'Headless' : 'Visible Browser'}`))
  console.log(chalk.gray(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`))

  const mike = new Mike(config)

  try {
    await mike.initialize()

    switch (options.command) {
      case 'smoke':
        console.log(chalk.blue.bold('\n🔥 Running Smoke Tests\n'))
        const smokeResults = await mike.smokeTest()
        const smokePassed = smokeResults.filter(r => r.status === 'passed').length
        console.log(chalk.blue(`\nResults: ${smokePassed}/${smokeResults.length} passed`))

        if (smokePassed < smokeResults.length) {
          console.log(chalk.red('\nSome smoke tests failed!'))
          process.exitCode = 1
        } else {
          console.log(chalk.green('\nAll smoke tests passed!'))
        }
        break

      case 'full':
        console.log(chalk.blue.bold('\n🚀 Running Full Test Suite\n'))
        const results = await mike.runFullSuite()
        const passed = results.filter(r => r.status === 'passed').length
        const failed = results.filter(r => r.status === 'failed').length

        console.log(chalk.blue(`\n📊 Final Results:`))
        console.log(chalk.green(`   ✓ Passed: ${passed}`))
        console.log(chalk.red(`   ✗ Failed: ${failed}`))
        console.log(chalk.gray(`   Total: ${results.length}`))
        console.log(chalk.yellow(`\n📁 Report saved to: ${config.outputDir}/report.html`))

        if (failed > 0) {
          process.exitCode = 1
        }
        break

      case 'discover':
        console.log(chalk.blue.bold('\n🔍 Discovering Elements\n'))
        await mike.crawlApplication()

        const elements = mike.getDiscoveredElements()
        console.log(chalk.green(`\n✅ Discovered ${elements.length} elements`))

        // Show summary
        const summary: Record<string, number> = {}
        elements.forEach(e => {
          summary[e.type] = (summary[e.type] || 0) + 1
        })

        console.log(chalk.cyan('\nElement Types:'))
        Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
          console.log(`  • ${type}: ${count}`)
        })
        break

      case 'category':
        if (!options.category) {
          console.log(chalk.red('Error: Please specify a category with --category'))
          process.exit(1)
        }

        console.log(chalk.blue.bold(`\n📋 Running ${options.category} Tests\n`))

        // Need to discover first
        await mike.crawlApplication()
        await mike.generateScenarios()

        const categoryResults = await mike.runCategory(options.category)
        const catPassed = categoryResults.filter(r => r.status === 'passed').length

        // Generate report for category run
        await mike.generateReport()

        console.log(chalk.blue(`\nResults: ${catPassed}/${categoryResults.length} passed`))

        if (catPassed < categoryResults.length) {
          process.exitCode = 1
        }
        break
    }

  } catch (error: any) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`))
    if (options.verbose) {
      console.error(chalk.gray(error.stack))
    }
    process.exitCode = 1
  } finally {
    await mike.shutdown()
  }
}

// Run CLI
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})
