import { defineConfig } from 'cypress'
import createBundler from '@bahmutov/cypress-esbuild-preprocessor'
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor'
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild'
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter'
import { readDocX } from '../cypress_shared/plugins'

export default defineConfig({
  viewportHeight: 900,
  viewportWidth: 1600,
  pageLoadTimeout: 120000,
  chromeWebSecurity: false,
  downloadsFolder: 'e2e_tests/downloads',
  fixturesFolder: 'e2e_tests/fixtures',
  screenshotsFolder: 'e2e_tests/screenshots',
  videosFolder: 'e2e_tests/videos',
  video: process.env.ENVIRONMENT !== 'local',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reportDir: 'e2e_tests/reports',
    charts: true,
    reportPageTitle: 'Make recall decisions E2E tests',
    embeddedScreenshots: true,
    reporterEnabled: 'spec, mocha-junit-reporter',
    reporterOptions: {
      mochaFile: 'e2e_tests/junit/results-[hash].xml',
    },
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ): Promise<Cypress.PluginConfigOptions> {
      // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
      await addCucumberPreprocessorPlugin(on, config)
      installLogsPrinter(on, {
        printLogsToFile: 'always',
        printLogsToConsole: 'always',
        outputRoot: `${config.projectRoot}/e2e_tests/logs`,
        outputTarget: { 'out.txt': 'txt', 'out.json': 'json' },
      })
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      )

      on('task', {
        readDocX,
      })
      return config
    },
    baseUrl: 'http://localhost:3000',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: '**/*.feature',
    supportFile: 'e2e_tests/support/index.ts',
  },
})
