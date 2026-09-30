import { Locator, Page } from '@playwright/test'

export interface PageObject {
  readonly heading: Locator

  expectHeading(): Promise<void>
}

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async open(path: string) {
    await this.page.goto(path)
  }

  async signOut(page: Page) {
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
  }
}
