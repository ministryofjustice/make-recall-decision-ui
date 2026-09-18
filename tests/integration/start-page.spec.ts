import { expect, test } from '@playwright/test'
import StartPage from '../pageObjects/start.page'
import helpers from './helpers/commonHelpers'
import { searchMappedUsers } from '../../integration_tests/mockApis/makeRecallDecisionApi'

test.describe('Start page', () => {
  test.describe('As a regular PO user', () => {
    test('it renders the start page', async ({ page }) => {
      await helpers.initSession(page)
      const startPage = new StartPage(page)

      await page.goto('/')

      await expect(startPage.heading).toBeVisible()
      await expect(
        page.getByText(
          /Use this service to view information about a person on probation. This will help you make a recommendation about recall./,
          {
            exact: true,
          },
        ),
      )
      await expect(
        page.getByText(
          /You can recommend to either: recall someone and fill in a Part A not recall someone and write a decision not to recall letter/,
          { exact: true },
        ),
      )
      await expect(
        page.getByText(/This service cannot: help you write a licence compliance letter make a decision for you/, {
          exact: true,
        }),
      )
      await expect(page.getByText(/The information in this service comes from OASys and NDelius./, { exact: true }))

      await expect(startPage.submitButton).toContainText('Start now')
    })
  })

  test.describe('As a PPCS user', () => {
    test.beforeEach(async ({ page }) => {
      await helpers.initSession(page, { roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'], username: 'USER2' })
      await searchMappedUsers({ statusCode: 200, response: {} })
    })

    test('it renders the start page', async ({ page }) => {
      const startPage = new StartPage(page)
      await page.goto('/')

      await expect(startPage.ppcsHeading).toBeVisible()
    })
  })
})
