import { defineConfig } from 'cypress'
import {
  createNoRecallLetter,
  createPartA,
  createRecommendation,
  getUser,
  getCase,
  getCaseV2,
  getDownloadDocument,
  getHealthCheck,
  getPersonsByCrn,
  searchPersons,
  getRecommendation,
  getStatuses,
  updateRecommendation,
  updateStatuses,
} from './mockApis/makeRecallDecisionApi'
import { readBase64File, readPdf } from './plugins/readFiles'
import { readDocX } from '../cypress_shared/plugins'
import { resetStubs } from './mockApis/wiremock'
import auth from './mockApis/auth'
import tokenVerification from './mockApis/tokenVerification'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        getSignInUrl: auth.getSignInUrl,
        stubSignIn: auth.stubSignIn,
        stubAuthUser: auth.stubUser,
        stubAuthPing: auth.stubPing,
        stubTokenVerificationPing: tokenVerification.stubPing,
        getPersonsByCrn,
        searchPersons,
        getUser,
        getCase,
        getCaseV2,
        getHealthCheck,
        getDownloadDocument,
        createRecommendation,
        getRecommendation,
        updateRecommendation,
        getStatuses,
        updateStatuses,
        readPdf,
        readBase64File,
        readDocX,
        createPartA,
        createNoRecallLetter,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.spec).ts',
    specPattern: 'integration_tests/integration/*.spec.ts',
    supportFile: 'integration_tests/support/index.ts',
  },
})
