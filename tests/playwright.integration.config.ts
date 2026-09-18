import { defineConfig } from '@playwright/test'
import defaultConfig from './playwright.base.config'

export default defineConfig({
  ...defaultConfig,
  testDir: 'integration',
  use: {
    ...defaultConfig.use,
    baseURL: 'http://localhost:3007',
  },
})
