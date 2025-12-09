import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Home/Dashboard Page Object
 */
export class HomePage extends BasePage {
  readonly url = '/home'

  // Hero Profile
  readonly heroProfile: Locator
  readonly userAvatar: Locator
  readonly userDisplayName: Locator
  readonly userLevel: Locator
  readonly xpProgress: Locator

  // Rankings Strip
  readonly rankingsStrip: Locator
  readonly rankingCards: Locator

  // Today Summary
  readonly todaySummary: Locator
  readonly logActivityButton: Locator

  // Activity Feed
  readonly activityFeed: Locator
  readonly activityCards: Locator

  // Widgets
  readonly calendarWidget: Locator
  readonly streakWidget: Locator
  readonly challengesWidget: Locator

  // Quick Actions
  readonly quickActionButtons: Locator

  constructor(page: Page) {
    super(page)

    // Hero section
    this.heroProfile = page.locator('[class*="hero"], .hero-profile').first()
    this.userAvatar = page.locator('[class*="avatar"]').first()
    this.userDisplayName = page.locator('h1, h2').first()
    this.userLevel = page.locator('[class*="level"], .user-level')
    this.xpProgress = page.locator('[role="progressbar"]').first()

    // Rankings
    this.rankingsStrip = page.locator('[class*="rankings"], .rankings-strip')
    this.rankingCards = page.locator('[class*="rank-card"], .ranking-card')

    // Today Summary
    this.todaySummary = page.locator('[class*="today"], .today-summary')
    this.logActivityButton = page.locator('a[href*="activity/create"], button:has-text("Log")')

    // Activity
    this.activityFeed = page.locator('[class*="activity-feed"], .feed')
    this.activityCards = page.locator('[class*="activity-card"], article')

    // Widgets
    this.calendarWidget = page.locator('[class*="calendar"], .calendar-widget')
    this.streakWidget = page.locator('[class*="streak"]')
    this.challengesWidget = page.locator('[class*="challenge"]')

    // Quick actions
    this.quickActionButtons = page.locator('[class*="quick-action"], .quick-actions button')
  }

  async waitForReady() {
    await super.waitForReady()
    // Wait for main content
    await this.page.waitForSelector('main', { state: 'visible' })
  }

  async clickLogActivity() {
    await this.logActivityButton.first().click()
    await this.page.waitForURL('**/activity/create')
  }

  async viewRankings(scope: 'friends' | 'team' | 'global' = 'global') {
    const rankingLink = this.page.locator(`a[href*="rankings"][href*="${scope}"]`).first()
    if (await rankingLink.isVisible()) {
      await rankingLink.click()
    } else {
      await this.page.goto('/rankings')
    }
    await this.page.waitForURL('**/rankings**')
  }

  async getActivityCount(): Promise<number> {
    return this.activityCards.count()
  }

  async clickActivity(index: number = 0) {
    const activities = await this.activityCards.all()
    if (activities.length > index) {
      await activities[index].click()
    }
  }

  async checkDashboardElements() {
    const elements = {
      heroVisible: await this.heroProfile.isVisible().catch(() => false),
      rankingsVisible: await this.rankingsStrip.isVisible().catch(() => false),
      activityFeedVisible: await this.activityFeed.isVisible().catch(() => false),
      calendarVisible: await this.calendarWidget.isVisible().catch(() => false),
    }
    return elements
  }
}
