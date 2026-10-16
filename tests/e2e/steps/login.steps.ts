import { createBdd, test } from 'playwright-bdd'
import LoginPage from '../../pageObjects/login.page'
import StartPage from '../../pageObjects/start.page'
import userLogins from '../fixtures/userLogins'

const { Given, When, Then } = createBdd(test)

Given('I am on the login page', async ({ page }) => {
  await new LoginPage(page).open('/')
})

When('I log in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page)

  await loginPage.login(userLogins.PO)
  await loginPage.skipVerification()
})

Then('I should see the start page', async ({ page }) => {
  const startPage = new StartPage(page)
  await startPage.expectHeading()

  await new LoginPage(page).signOut(page)
  await new LoginPage(page).expectHeading()
})
