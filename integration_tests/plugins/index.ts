// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import {
  getPersonsByCrn,
  getCase,
  getHealthCheck,
  getDownloadDocument,
  createRecommendation,
  getRecommendation,
  updateRecommendation,
} from '../mockApis/makeRecallDecisionApi'
import { readPdf, readBase64File, readDocX } from './readFiles'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: auth.stubSignIn,

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,
    getPersonsByCrn,
    getCase,
    getHealthCheck,
    getDownloadDocument,
    createRecommendation,
    getRecommendation,
    updateRecommendation,
    readPdf,
    readBase64File,
    readDocX,
  })
}
