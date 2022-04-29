// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { pa11y, lighthouse, prepareAudit } from 'cypress-audit'
import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import { getPersonsByCrn, getCase } from '../mockApis/makeRecallDecisionApi'

export default (on: (string, Record) => void): void => {
  on('before:browser:launch', (_browser, launchOptions) => {
    prepareAudit(launchOptions)
  })

  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: auth.stubSignIn,

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,
    getPersonsByCrn,
    getCase,
    lighthouse: lighthouse(),
    pa11y: pa11y(),
  })
}
