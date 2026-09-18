import { defineBddConfig } from 'playwright-bdd'
import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

import defaultConfig from './playwright.base.config'

dotenv.config({ path: path.resolve(process.cwd(), 'e2e.env') })

const testDir = defineBddConfig({
  paths: ['e2e/**/features'],
  import: ['e2e/**/*.ts'],
})

export default defineConfig({
  ...defaultConfig,
  testDir,
  use: {
    ...defaultConfig.use,
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
  },
})
