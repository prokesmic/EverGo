import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Teams Page Object
 */
export class TeamsPage extends BasePage {
  readonly url = '/teams'

  // Page header
  readonly pageTitle: Locator
  readonly createTeamButton: Locator
  readonly searchInput: Locator

  // Your Teams sidebar
  readonly yourTeams: Locator
  readonly yourTeamsList: Locator

  // Team cards
  readonly teamCards: Locator
  readonly teamLogos: Locator
  readonly teamNames: Locator

  // Team stats
  readonly teamStats: Locator

  // Create team promo
  readonly createTeamPromo: Locator

  // Calendar widget
  readonly calendarWidget: Locator

  // Empty state
  readonly emptyState: Locator

  constructor(page: Page) {
    super(page)

    // Header
    this.pageTitle = page.locator('h1').first()
    this.createTeamButton = page.locator('a[href*="teams/create"], button:has-text("Create")')
    this.searchInput = page.locator('input[placeholder*="Search"]')

    // Your Teams
    this.yourTeams = page.locator('[class*="your-teams"], .card-elevated:has-text("Your Teams")')
    this.yourTeamsList = page.locator('[class*="your-teams"] a, .your-teams-list a')

    // Team cards
    this.teamCards = page.locator('[class*="team-card"], article')
    this.teamLogos = page.locator('[class*="team-card"] img, .team-logo')
    this.teamNames = page.locator('[class*="team-card"] h3, .team-name')

    // Stats
    this.teamStats = page.locator('[class*="team-stats"]')

    // Create promo
    this.createTeamPromo = page.locator('[class*="create-team-promo"], .card-elevated:has-text("Start a Team")')

    // Calendar
    this.calendarWidget = page.locator('[class*="calendar"]')

    // Empty state
    this.emptyState = page.locator('[class*="empty-state"], .empty-state')
  }

  async waitForReady() {
    await super.waitForReady()
    // Wait for either team cards or empty state
    await Promise.race([
      this.teamCards.first().waitFor({ state: 'visible', timeout: 10000 }),
      this.emptyState.waitFor({ state: 'visible', timeout: 10000 })
    ]).catch(() => { })
  }

  async searchTeams(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500) // Debounce
  }

  async getTeamCount(): Promise<number> {
    return this.teamCards.count()
  }

  async clickTeam(index: number = 0) {
    const teams = await this.teamCards.all()
    if (teams.length > index) {
      await teams[index].click()
    }
  }

  async clickCreateTeam() {
    await this.createTeamButton.first().click()
    await this.page.waitForURL('**/teams/create')
  }

  async getYourTeamsCount(): Promise<number> {
    return this.yourTeamsList.count()
  }

  async checkTeamsElements() {
    return {
      titleVisible: await this.pageTitle.isVisible(),
      teamCardsVisible: await this.teamCards.first().isVisible().catch(() => false),
      createButtonVisible: await this.createTeamButton.first().isVisible().catch(() => false),
      yourTeamsVisible: await this.yourTeams.isVisible().catch(() => false),
    }
  }
}
