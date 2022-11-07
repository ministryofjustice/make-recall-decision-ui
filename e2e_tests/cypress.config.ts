import { defineConfig } from 'cypress'
import { readDocX } from '../cypress_shared/plugins'

export default defineConfig({
  "chromeWebSecurity": false,
  "downloadsFolder": "e2e_tests/downloads",
  "fixturesFolder": "e2e_tests/fixtures",
  "screenshotsFolder": "e2e_tests/screenshots",
  "videosFolder": "e2e_tests/videos",
  "video": false,
  "reporter": "cypress-multi-reporters",
  "reporterOptions": {
    "reportDir": "e2e_tests/reports",
    "charts": true,
    "reportPageTitle": "Make recall decisions E2E tests",
    "embeddedScreenshots": true,
    "reporterEnabled": "spec, mocha-junit-reporter",
    "reporterOptions": {
      "mochaFile": "e2e_tests/junit/results-[hash].xml"
    }
  },
  "retries": {
    "runMode": 2,
    "openMode": 0
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        readDocX,
      })
    },
    "baseUrl": "http://localhost:3000",
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: '**/*.{feature,features}',
    "supportFile": "e2e_tests/support/index.ts",
  },
})