import { expect } from '@playwright/test'
import { BasePage, PageObject } from './base.page'

export default class StartPage extends BasePage implements PageObject {
  readonly heading = this.page.getByRole('heading', { name: /Consider a recall/, exact: true })

  readonly ppcsHeading = this.page.getByRole('heading', { name: /Check and book a recall/, exact: true })

  readonly submitButton = this.page.getByRole('button', { name: /Start now/, exact: true })

  async expectHeading() {
    await expect(this.page.getByRole('heading', { name: /Consider a recall/, exact: true })).toBeVisible()
  }
}
