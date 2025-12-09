import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Rankings Page Object
 */
export class RankingsPage extends BasePage {
  readonly url = '/rankings'

  // Page header
  readonly pageTitle: Locator
  readonly pageSubtitle: Locator

  // Filters
  readonly scopeFilters: Locator
  readonly friendsFilter: Locator
  readonly teamFilter: Locator
  readonly globalFilter: Locator
  readonly sportFilter: Locator
  readonly periodFilter: Locator

  // Leaderboard
  readonly leaderboard: Locator
  readonly leaderboardRows: Locator
  readonly currentUserRow: Locator
  readonly podium: Locator

  // Your Rankings Widget
  readonly yourRankings: Locator
  readonly rankCards: Locator

  // Insights
  readonly insightsCard: Locator

  constructor(page: Page) {
    super(page)

    // Header
    this.pageTitle = page.locator('h1').first()
    this.pageSubtitle = page.locator('.page-subheader p, h1 + p')

    // Filters
    this.scopeFilters = page.locator('[class*="scope-filter"], .filter-bar button')
    this.friendsFilter = page.locator('button:has-text("Friends")')
    this.teamFilter = page.locator('button:has-text("Team")')
    this.globalFilter = page.locator('button:has-text("Global")')
    this.sportFilter = page.locator('select, [role="combobox"]').first()
    this.periodFilter = page.locator('select, [role="combobox"]').nth(1)

    // Leaderboard
    this.leaderboard = page.locator('[class*="leaderboard"], table, .leaderboard')
    this.leaderboardRows = page.locator('[class*="leaderboard-row"], tr, .user-row')
    this.currentUserRow = page.locator('[class*="current-user"], [data-current-user="true"]')
    this.podium = page.locator('[class*="podium"]')

    // Widgets
    this.yourRankings = page.locator('[class*="your-ranking"]')
    this.rankCards = page.locator('[class*="rank-card"]')
    this.insightsCard = page.locator('[class*="insights"]')
  }

  async waitForReady() {
    await super.waitForReady()
    await this.leaderboard.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { })
  }

  async filterByScope(scope: 'friends' | 'team' | 'global') {
    const filterButton = {
      friends: this.friendsFilter,
      team: this.teamFilter,
      global: this.globalFilter
    }[scope]

    await filterButton.click()
    await this.page.waitForTimeout(500) // Wait for data to load
  }

  async getLeaderboardCount(): Promise<number> {
    return this.leaderboardRows.count()
  }

  async clickUserInLeaderboard(index: number = 0) {
    const rows = await this.leaderboardRows.all()
    if (rows.length > index) {
      await rows[index].click()
    }
  }

  async isCurrentUserHighlighted(): Promise<boolean> {
    return this.currentUserRow.isVisible()
  }

  async checkRankingElements() {
    return {
      titleVisible: await this.pageTitle.isVisible(),
      leaderboardVisible: await this.leaderboard.isVisible().catch(() => false),
      filtersVisible: await this.scopeFilters.first().isVisible().catch(() => false),
      yourRankingsVisible: await this.yourRankings.isVisible().catch(() => false),
    }
  }
}
