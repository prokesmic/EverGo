import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Challenges Page Object
 */
export class ChallengesPage extends BasePage {
  readonly url = '/challenges'

  // Page header
  readonly pageTitle: Locator
  readonly createChallengeButton: Locator

  // XP Progress
  readonly xpProgressCard: Locator
  readonly currentLevel: Locator
  readonly xpBar: Locator

  // Tabs
  readonly challengesTab: Locator
  readonly badgesTab: Locator
  readonly historyTab: Locator

  // Challenge cards
  readonly challengeCards: Locator
  readonly activeChallenges: Locator
  readonly completedChallenges: Locator

  // Badge gallery
  readonly badgeGallery: Locator
  readonly badges: Locator
  readonly earnedBadges: Locator
  readonly lockedBadges: Locator

  // Filters
  readonly categoryFilter: Locator
  readonly statusFilter: Locator

  constructor(page: Page) {
    super(page)

    // Header
    this.pageTitle = page.locator('h1').first()
    this.createChallengeButton = page.locator('a[href*="challenges/create"], button:has-text("Create")')

    // XP Progress
    this.xpProgressCard = page.locator('[class*="xp-progress"], [class*="level"]').first()
    this.currentLevel = page.locator('[class*="level-badge"], .level')
    this.xpBar = page.locator('[role="progressbar"]')

    // Tabs
    this.challengesTab = page.locator('[role="tab"]:has-text("Challenges"), button:has-text("Challenges")')
    this.badgesTab = page.locator('[role="tab"]:has-text("Badges"), button:has-text("Badges")')
    this.historyTab = page.locator('[role="tab"]:has-text("History"), button:has-text("History")')

    // Challenge cards
    this.challengeCards = page.locator('[class*="challenge-card"], article')
    this.activeChallenges = page.locator('[class*="challenge-card"]:not([class*="completed"])')
    this.completedChallenges = page.locator('[class*="challenge-card"][class*="completed"]')

    // Badge gallery
    this.badgeGallery = page.locator('[class*="badge-gallery"]')
    this.badges = page.locator('[class*="badge"]')
    this.earnedBadges = page.locator('[class*="badge"]:not([class*="locked"])')
    this.lockedBadges = page.locator('[class*="badge"][class*="locked"], [class*="badge"]:has([class*="lock"])')

    // Filters
    this.categoryFilter = page.locator('[class*="category-filter"], select').first()
    this.statusFilter = page.locator('[class*="status-filter"], select').nth(1)
  }

  async waitForReady() {
    await super.waitForReady()
    await this.challengeCards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => { })
  }

  async switchToTab(tab: 'challenges' | 'badges' | 'history') {
    const tabButton = {
      challenges: this.challengesTab,
      badges: this.badgesTab,
      history: this.historyTab
    }[tab]

    await tabButton.click()
    await this.page.waitForTimeout(300)
  }

  async getChallengeCount(): Promise<number> {
    return this.challengeCards.count()
  }

  async clickChallenge(index: number = 0) {
    const challenges = await this.challengeCards.all()
    if (challenges.length > index) {
      await challenges[index].click()
    }
  }

  async joinChallenge(index: number = 0) {
    const joinButton = this.challengeCards.nth(index).locator('button:has-text("Join")')
    if (await joinButton.isVisible()) {
      await joinButton.click()
    }
  }

  async getBadgeCount(): Promise<{ total: number; earned: number }> {
    await this.switchToTab('badges')
    const total = await this.badges.count()
    const earned = await this.earnedBadges.count()
    return { total, earned }
  }

  async checkChallengesElements() {
    return {
      titleVisible: await this.pageTitle.isVisible(),
      xpProgressVisible: await this.xpProgressCard.isVisible().catch(() => false),
      challengesVisible: await this.challengeCards.first().isVisible().catch(() => false),
      tabsVisible: await this.challengesTab.isVisible().catch(() => false),
    }
  }
}
