#!/usr/bin/env npx tsx
/**
 * Design Token Audit Script
 *
 * Scans codebase for hardcoded Tailwind colors that should use semantic tokens.
 * Run with: npx tsx scripts/docs/audit-design-tokens.ts
 *
 * Returns exit code 1 if violations found (for CI integration)
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const BANNED_PATTERNS = [
  // Specific color names with shades (eg: text-emerald-500)
  {
    pattern: /\b(text|bg|border|ring|fill|stroke)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d+/g,
    suggestion: 'Use semantic tokens (text-primary, bg-muted, etc.)',
    severity: 'error' as const,
  },
  // bg-white, text-white (except in SVG/canvas contexts)
  {
    pattern: /\b(bg|text)-white\b/g,
    suggestion: 'Use bg-background, bg-card, or text-primary-foreground',
    severity: 'warning' as const,
  },
  // bg-black, text-black
  {
    pattern: /\b(bg|text)-black\b/g,
    suggestion: 'Use bg-foreground or text-foreground',
    severity: 'warning' as const,
  },
]

interface Violation {
  file: string
  line: number
  match: string
  suggestion: string
  severity: 'error' | 'warning'
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = []
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, lineIndex) => {
    for (const { pattern, suggestion, severity } of BANNED_PATTERNS) {
      // Reset regex state
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(line)) !== null) {
        violations.push({
          file: filePath,
          line: lineIndex + 1,
          match: match[0],
          suggestion,
          severity,
        })
      }
    }
  })

  return violations
}

function walkDir(dir: string, extensions: string[]): string[] {
  const files: string[] = []

  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      // Skip node_modules, .next, etc
      if (
        entry.startsWith('.') ||
        entry === 'node_modules' ||
        entry === 'out' ||
        entry === 'build' ||
        entry === '.next' ||
        entry === 'playwright-report' ||
        entry === 'test-results'
      ) {
        continue
      }

      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          files.push(...walkDir(fullPath, extensions))
        } else if (extensions.some((ext) => entry.endsWith(ext))) {
          files.push(fullPath)
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return files
}

function main() {
  console.log('🎨 Design Token Audit\n')
  console.log('Scanning for hardcoded Tailwind colors...\n')

  const projectRoot = process.cwd()
  const files = walkDir(projectRoot, ['.tsx', '.jsx', '.ts', '.js', '.css'])

  console.log(`Found ${files.length} files to scan\n`)

  let allViolations: Violation[] = []

  for (const file of files) {
    const violations = scanFile(file)
    allViolations.push(...violations)
  }

  if (allViolations.length === 0) {
    console.log('✅ No hardcoded colors found! Design system compliance: 100%\n')
    process.exit(0)
  }

  // Group by file
  const byFile = new Map<string, Violation[]>()
  for (const v of allViolations) {
    const relPath = relative(projectRoot, v.file)
    const existing = byFile.get(relPath) || []
    existing.push(v)
    byFile.set(relPath, existing)
  }

  const errors = allViolations.filter((v) => v.severity === 'error')
  const warnings = allViolations.filter((v) => v.severity === 'warning')

  console.log(`Found ${errors.length} errors and ${warnings.length} warnings\n`)

  // Print violations
  for (const [file, violations] of Array.from(byFile.entries())) {
    console.log(`📁 ${file}`)
    for (const v of violations) {
      const icon = v.severity === 'error' ? '❌' : '⚠️'
      console.log(`  ${icon} Line ${v.line}: "${v.match}"`)
      console.log(`     → ${v.suggestion}`)
    }
    console.log()
  }

  console.log('---')
  console.log('Design System Token Reference:')
  console.log('  text-primary, text-foreground, text-muted-foreground')
  console.log('  bg-background, bg-card, bg-muted, bg-primary')
  console.log('  border-border, border-primary')
  console.log('\nSee lib/design-tokens.ts for full reference\n')

  // Exit with error if there are errors (not just warnings)
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
