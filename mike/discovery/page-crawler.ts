/**
 * Page Crawler Module
 * Crawls the application to discover all accessible pages
 */

import { Page } from 'playwright'
import { CrawlResult, MikeConfig } from '../core/types'

export class PageCrawler {
  private config: MikeConfig
  private visitedUrls: Set<string> = new Set()
  private skippedUrls: Set<string> = new Set()
  private errors: Array<{ url: string; error: string }> = []
  private urlQueue: string[] = []

  constructor(config: MikeConfig) {
    this.config = config
  }

  /**
   * Crawl the application starting from baseUrl
   */
  async crawl(page: Page, startUrl: string): Promise<CrawlResult> {
    const startTime = Date.now()
    const maxCrawlTime = 60000 // Max 60 seconds for crawling
    this.reset()

    // Start with common pages instead of just base URL for faster discovery
    const commonPages = this.getCommonPages()
    this.urlQueue.push(...commonPages)

    let depth = 0
    const maxPages = 20 // Limit pages to crawl for speed

    while (this.urlQueue.length > 0 && depth < this.config.maxDepth && this.visitedUrls.size < maxPages) {
      // Check if we've exceeded max crawl time
      if (Date.now() - startTime > maxCrawlTime) {
        console.log('Max crawl time reached, stopping...')
        break
      }

      const currentBatch = [...this.urlQueue].slice(0, 5) // Process max 5 at a time
      this.urlQueue = this.urlQueue.slice(5)

      for (const url of currentBatch) {
        if (this.visitedUrls.size >= maxPages) break

        if (this.shouldSkip(url)) {
          this.skippedUrls.add(url)
          continue
        }

        if (this.visitedUrls.has(this.normalizeUrl(url))) {
          continue
        }

        try {
          await this.crawlPage(page, url)
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          this.errors.push({ url, error: errorMessage })
        }
      }

      depth++
    }

    return {
      visitedUrls: Array.from(this.visitedUrls),
      skippedUrls: Array.from(this.skippedUrls),
      errors: this.errors,
      totalLinks: this.visitedUrls.size + this.skippedUrls.size,
      duration: Date.now() - startTime
    }
  }

  /**
   * Crawl a single page and extract links
   */
  private async crawlPage(page: Page, url: string): Promise<void> {
    const normalizedUrl = this.normalizeUrl(url)

    // Skip if already visited
    if (this.visitedUrls.has(normalizedUrl)) return

    try {
      // Navigate to the page with domcontentloaded (faster than networkidle)
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000 // 10 second timeout per page
      })

      // Check for successful response
      if (!response || response.status() >= 400) {
        this.errors.push({ url, error: `HTTP ${response?.status() || 'unknown'}` })
        return
      }

      // Mark as visited
      this.visitedUrls.add(normalizedUrl)

      // Wait briefly for dynamic content
      await page.waitForTimeout(300)

      // Extract all links from the page
      const links = await this.extractLinks(page)

      // Add new links to queue (limit to 10 per page)
      let added = 0
      for (const link of links) {
        if (added >= 10) break
        const normalizedLink = this.normalizeUrl(link)
        if (!this.visitedUrls.has(normalizedLink) && !this.shouldSkip(link)) {
          this.urlQueue.push(link)
          added++
        }
      }
    } catch {
      // Page might have redirected to login - that's okay
      if (page.url().includes('/login')) {
        this.visitedUrls.add(normalizedUrl)
        return
      }
      // For any other error, just mark as visited to avoid infinite loops
      this.visitedUrls.add(normalizedUrl)
    }
  }

  /**
   * Extract all internal links from the current page
   */
  private async extractLinks(page: Page): Promise<string[]> {
    const baseUrl = this.config.baseUrl

    return page.evaluate((base) => {
      const links: string[] = []
      const anchors = document.querySelectorAll('a[href]')

      anchors.forEach(anchor => {
        const href = anchor.getAttribute('href')
        if (!href) return

        // Skip anchors, mailto, tel, javascript
        if (href.startsWith('#') || href.startsWith('mailto:') ||
          href.startsWith('tel:') || href.startsWith('javascript:')) {
          return
        }

        let fullUrl: string

        // Handle relative URLs
        if (href.startsWith('/')) {
          fullUrl = `${base}${href}`
        } else if (href.startsWith('http')) {
          // Skip external URLs
          if (!href.startsWith(base)) return
          fullUrl = href
        } else {
          // Relative path
          fullUrl = new URL(href, window.location.href).toString()
        }

        // Only include if same origin
        try {
          const urlObj = new URL(fullUrl)
          const baseObj = new URL(base)
          if (urlObj.origin === baseObj.origin) {
            links.push(fullUrl)
          }
        } catch {
          // Invalid URL, skip
        }
      })

      return [...new Set(links)]
    }, baseUrl)
  }

  /**
   * Check if URL should be skipped
   */
  private shouldSkip(url: string): boolean {
    const normalizedUrl = url.toLowerCase()

    // Check excluded paths
    for (const excluded of this.config.excludePaths) {
      if (normalizedUrl.includes(excluded.toLowerCase())) {
        return true
      }
    }

    // Skip external URLs
    if (!url.startsWith(this.config.baseUrl)) {
      return true
    }

    // Skip file downloads
    const fileExtensions = ['.pdf', '.zip', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.gif', '.svg']
    for (const ext of fileExtensions) {
      if (normalizedUrl.endsWith(ext)) {
        return true
      }
    }

    return false
  }

  /**
   * Normalize URL for comparison (remove trailing slash, query params for visited check)
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      // Keep path but normalize it
      const path = urlObj.pathname.replace(/\/+$/, '') || '/'
      return `${urlObj.origin}${path}`
    } catch {
      return url
    }
  }

  /**
   * Reset crawler state
   */
  private reset(): void {
    this.visitedUrls.clear()
    this.skippedUrls.clear()
    this.errors = []
    this.urlQueue = []
  }

  /**
   * Get list of common pages to test
   */
  getCommonPages(): string[] {
    const base = this.config.baseUrl
    return [
      `${base}/`,
      `${base}/login`,
      `${base}/register`,
      `${base}/home`,
      `${base}/profile`,
      `${base}/activity`,
      `${base}/activity/create`,
      `${base}/challenges`,
      `${base}/rankings`,
      `${base}/teams`,
      `${base}/calendar`,
      `${base}/settings`,
      `${base}/notifications`,
      `${base}/search`,
    ]
  }
}

export default PageCrawler
