import { Page } from '@playwright/test'
import authHelpers from './authHelpers'
import getFlags from '../../../integration_tests/mockApis/flipt'
import { resetStubs } from '../../../integration_tests/mockApis/wiremock'
import { AuthStubOpts } from '../../../integration_tests/mockApis/auth'

/**
 * This function will setup the mocks used for all tests
 * currently the flags and the signIn process
 *
 * @param page Playwright page object
 */
const initSession = async (page: Page, opts: AuthStubOpts = {}) => {
  await resetStubs()
  await getFlags()
  await authHelpers.signIn(page, opts)
}

export default {
  initSession,
}
