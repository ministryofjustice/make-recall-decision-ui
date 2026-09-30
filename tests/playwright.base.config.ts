import { devices, PlaywrightTestConfig } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const defaultConfig: PlaywrightTestConfig = {
  outputDir: '../test_results/playwright',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['github'],
    ['line'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: '../test_results/playwright/junit.xml' }],
    ['json', { outputFile: '../test_results/playwright/results.json' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 30 * 1000,
    timezoneId: 'Europe/London',
    launchOptions: { slowMo: 150 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: process.env.CI ? 'off' : 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}

export default defaultConfig
