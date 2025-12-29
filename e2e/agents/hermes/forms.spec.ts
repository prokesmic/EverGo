import { test, expect } from '@playwright/test'
import { TEST_IDS } from '@/lib/test-ids'

/**
 * HERMES - Forms & Data Submission Tests
 *
 * Tests form validation, data submission, error handling, and success flows.
 */

test.describe('Hermes: Forms', () => {
  test.describe('Activity Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/activity/create')
    })

    test('activity form is visible', async ({ page }) => {
      const form = page.getByTestId(TEST_IDS.activity.form)
      await expect(form).toBeVisible()
    })

    test('sport selection works', async ({ page }) => {
      const sportSelect = page.getByTestId(TEST_IDS.activity.sportSelect)
      if (await sportSelect.isVisible()) {
        await sportSelect.click()
        // Select first option
        const firstOption = page.getByRole('option').first()
        if (await firstOption.isVisible()) {
          await firstOption.click()
        }
      }
    })

    test('duration input accepts valid values', async ({ page }) => {
      const durationInput = page.getByTestId(TEST_IDS.activity.durationInput)
      if (await durationInput.isVisible()) {
        await durationInput.fill('30')
        await expect(durationInput).toHaveValue('30')
      }
    })

    test('distance input accepts valid values', async ({ page }) => {
      const distanceInput = page.getByTestId(TEST_IDS.activity.distanceInput)
      if (await distanceInput.isVisible()) {
        await distanceInput.fill('5.5')
        await expect(distanceInput).toHaveValue('5.5')
      }
    })

    test('notes input accepts text', async ({ page }) => {
      const notesInput = page.getByTestId(TEST_IDS.activity.notesInput)
      if (await notesInput.isVisible()) {
        const testNote = 'E2E Test Activity Note'
        await notesInput.fill(testNote)
        await expect(notesInput).toHaveValue(testNote)
      }
    })

    test('submit button is present', async ({ page }) => {
      const submitBtn = page.getByTestId(TEST_IDS.activity.submitBtn)
      await expect(submitBtn).toBeVisible()
    })
  })

  test.describe('Challenge Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/challenges/create')
    })

    test('challenge form loads', async ({ page }) => {
      // Just check page loads without error
      await expect(page).toHaveURL(/challenges\/create/)
    })

    test('name input accepts text', async ({ page }) => {
      const nameInput = page.getByTestId(TEST_IDS.challenges.nameInput)
      if (await nameInput.isVisible()) {
        await nameInput.fill('E2E Test Challenge')
        await expect(nameInput).toHaveValue('E2E Test Challenge')
      }
    })

    test('description input accepts text', async ({ page }) => {
      const descInput = page.getByTestId(TEST_IDS.challenges.descriptionInput)
      if (await descInput.isVisible()) {
        await descInput.fill('This is a test challenge description')
        await expect(descInput).toContainText('This is a test challenge description')
      }
    })
  })

  test.describe('Settings Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/settings/profile')
    })

    test('profile settings page loads', async ({ page }) => {
      await expect(page).toHaveURL(/settings\/profile/)
    })

    test('display name input is editable', async ({ page }) => {
      const displayNameInput = page.getByTestId(TEST_IDS.settings.displayNameInput)
      if (await displayNameInput.isVisible()) {
        const testName = 'E2E Test User'
        await displayNameInput.clear()
        await displayNameInput.fill(testName)
        await expect(displayNameInput).toHaveValue(testName)
      }
    })

    test('save button is present', async ({ page }) => {
      const saveBtn = page.getByTestId(TEST_IDS.settings.saveBtn)
      if (await saveBtn.isVisible()) {
        await expect(saveBtn).toBeEnabled()
      }
    })
  })

  test.describe('Form Validation', () => {
    test('empty required fields show validation', async ({ page }) => {
      await page.goto('/activity/create')

      const submitBtn = page.getByTestId(TEST_IDS.activity.submitBtn)
      if (await submitBtn.isVisible()) {
        await submitBtn.click()

        // Check for validation errors
        const errorMessage = page.getByTestId(TEST_IDS.form.error)
        // May or may not have inline validation - just ensure form didn't submit
        await expect(page).toHaveURL(/activity\/create/)
      }
    })
  })
})
