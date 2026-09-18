import { expect } from '@playwright/test'
import { BasePage, PageObject } from './base.page'

export default class LoginPage extends BasePage implements PageObject {
  readonly heading = this.page.getByRole('heading', { name: /Sign in/, exact: true })

  async expectHeading() {
    await expect(this.heading).toBeVisible()
  }

  async login({ username, password }: { username: string; password: string }) {
    await this.page.getByLabel(/username/i).fill(username)
    await this.page.getByLabel(/password/i).fill(password)
    await this.page.getByRole('button', { name: /Sign in/ }).click()
  }

  async skipVerification() {
    await this.page.getByRole('button', { name: /Skip for now/ }).click()
  }
}
