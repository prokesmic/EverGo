import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * Settings Page Object
 */
export class SettingsPage extends BasePage {
  readonly url = '/settings'

  // Navigation
  readonly settingsNav: Locator
  readonly profileLink: Locator
  readonly accountLink: Locator
  readonly privacyLink: Locator
  readonly notificationsLink: Locator

  // Profile Settings
  readonly displayNameInput: Locator
  readonly usernameInput: Locator
  readonly bioInput: Locator
  readonly avatarUpload: Locator

  // Account Settings
  readonly emailInput: Locator
  readonly changePasswordButton: Locator
  readonly deleteAccountButton: Locator

  // Privacy Settings
  readonly privacyLevelSelect: Locator
  readonly profileVisibilityToggle: Locator
  readonly activityVisibilityToggle: Locator

  // Notification Settings
  readonly emailNotificationsToggle: Locator
  readonly pushNotificationsToggle: Locator
  readonly activityNotificationsToggle: Locator

  // Save button
  readonly saveButton: Locator

  constructor(page: Page) {
    super(page)

    // Navigation
    this.settingsNav = page.locator('nav, [class*="settings-nav"]')
    this.profileLink = page.locator('a[href*="settings/profile"], button:has-text("Profile")')
    this.accountLink = page.locator('a[href*="settings/account"], button:has-text("Account")')
    this.privacyLink = page.locator('a[href*="settings/privacy"], button:has-text("Privacy")')
    this.notificationsLink = page.locator('a[href*="settings/notifications"], button:has-text("Notifications")')

    // Profile Settings
    this.displayNameInput = page.locator('input[name="displayName"], input[name="name"]')
    this.usernameInput = page.locator('input[name="username"]')
    this.bioInput = page.locator('textarea[name="bio"], input[name="bio"]')
    this.avatarUpload = page.locator('input[type="file"]')

    // Account Settings
    this.emailInput = page.locator('input[name="email"], input[type="email"]')
    this.changePasswordButton = page.locator('button:has-text("Change Password")')
    this.deleteAccountButton = page.locator('button:has-text("Delete")')

    // Privacy Settings
    this.privacyLevelSelect = page.locator('select[name="privacyLevel"], [role="combobox"]')
    this.profileVisibilityToggle = page.locator('[name="profileVisibility"], [role="switch"]').first()
    this.activityVisibilityToggle = page.locator('[name="activityVisibility"], [role="switch"]').nth(1)

    // Notification Settings
    this.emailNotificationsToggle = page.locator('[name="emailNotifications"], [role="switch"]').first()
    this.pushNotificationsToggle = page.locator('[name="pushNotifications"], [role="switch"]').nth(1)
    this.activityNotificationsToggle = page.locator('[name="activityNotifications"], [role="switch"]').nth(2)

    // Save
    this.saveButton = page.locator('button[type="submit"], button:has-text("Save")')
  }

  async waitForReady() {
    await super.waitForReady()
    await this.page.waitForSelector('form, [class*="settings"]', { state: 'visible' })
  }

  async navigateToSection(section: 'profile' | 'account' | 'privacy' | 'notifications') {
    const link = {
      profile: this.profileLink,
      account: this.accountLink,
      privacy: this.privacyLink,
      notifications: this.notificationsLink
    }[section]

    if (await link.isVisible()) {
      await link.click()
      await this.page.waitForTimeout(300)
    }
  }

  async updateProfile(data: { displayName?: string; username?: string; bio?: string }) {
    if (data.displayName) {
      await this.displayNameInput.fill(data.displayName)
    }
    if (data.username) {
      await this.usernameInput.fill(data.username)
    }
    if (data.bio) {
      await this.bioInput.fill(data.bio)
    }
  }

  async saveSettings() {
    await this.saveButton.click()
    await this.page.waitForTimeout(500)
  }

  async toggleNotification(type: 'email' | 'push' | 'activity') {
    const toggle = {
      email: this.emailNotificationsToggle,
      push: this.pushNotificationsToggle,
      activity: this.activityNotificationsToggle
    }[type]

    if (await toggle.isVisible()) {
      await toggle.click()
    }
  }

  async checkSettingsElements() {
    return {
      navVisible: await this.settingsNav.isVisible().catch(() => false),
      saveButtonVisible: await this.saveButton.isVisible().catch(() => false),
      formVisible: await this.page.locator('form').first().isVisible().catch(() => false),
    }
  }
}
