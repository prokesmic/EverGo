import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Profile Page Object
 */
export class ProfilePage extends BasePage {
  readonly url = '/profile/me'

  // Profile header
  readonly avatar: Locator
  readonly displayName: Locator
  readonly username: Locator
  readonly bio: Locator
  readonly editButton: Locator
  readonly followButton: Locator
  readonly level: Locator

  // Stats
  readonly statsSection: Locator
  readonly totalDistance: Locator
  readonly totalActivities: Locator
  readonly followers: Locator
  readonly following: Locator

  // Activity tabs
  readonly activitiesTab: Locator
  readonly achievementsTab: Locator
  readonly teamsTab: Locator

  // Activity list
  readonly activityList: Locator
  readonly activityItems: Locator

  // Achievements
  readonly achievementsList: Locator
  readonly badges: Locator

  constructor(page: Page) {
    super(page)

    // Header
    this.avatar = page.locator('[class*="avatar"]').first()
    this.displayName = page.locator('h1, h2').first()
    this.username = page.locator('[class*="username"], .text-muted-foreground:has-text("@")')
    this.bio = page.locator('[class*="bio"]')
    this.editButton = page.locator('a[href*="settings"], button:has-text("Edit")')
    this.followButton = page.locator('button:has-text("Follow")')
    this.level = page.locator('[class*="level"]')

    // Stats
    this.statsSection = page.locator('[class*="stats"], .profile-stats')
    this.totalDistance = page.locator('[class*="distance"], .stat:has-text("km")')
    this.totalActivities = page.locator('[class*="activities"], .stat:has-text("Activities")')
    this.followers = page.locator('[class*="followers"], .stat:has-text("Followers")')
    this.following = page.locator('[class*="following"], .stat:has-text("Following")')

    // Tabs
    this.activitiesTab = page.locator('[role="tab"]:has-text("Activities"), button:has-text("Activities")')
    this.achievementsTab = page.locator('[role="tab"]:has-text("Achievements"), button:has-text("Achievements")')
    this.teamsTab = page.locator('[role="tab"]:has-text("Teams"), button:has-text("Teams")')

    // Activity list
    this.activityList = page.locator('[class*="activity-list"]')
    this.activityItems = page.locator('[class*="activity-item"], article')

    // Achievements
    this.achievementsList = page.locator('[class*="achievements"]')
    this.badges = page.locator('[class*="badge"]')
  }

  async waitForReady() {
    await super.waitForReady()
    await this.displayName.waitFor({ state: 'visible', timeout: 10000 })
  }

  async goToProfile(username: string) {
    await this.page.goto(`/profile/${username}`)
    await this.waitForReady()
  }

  async switchToTab(tab: 'activities' | 'achievements' | 'teams') {
    const tabButton = {
      activities: this.activitiesTab,
      achievements: this.achievementsTab,
      teams: this.teamsTab
    }[tab]

    if (await tabButton.isVisible()) {
      await tabButton.click()
      await this.page.waitForTimeout(300)
    }
  }

  async clickEditProfile() {
    await this.editButton.click()
  }

  async followUser() {
    if (await this.followButton.isVisible()) {
      await this.followButton.click()
    }
  }

  async getActivityCount(): Promise<number> {
    return this.activityItems.count()
  }

  async checkProfileElements() {
    return {
      avatarVisible: await this.avatar.isVisible(),
      nameVisible: await this.displayName.isVisible(),
      statsVisible: await this.statsSection.isVisible().catch(() => false),
      tabsVisible: await this.activitiesTab.isVisible().catch(() => false),
    }
  }
}
