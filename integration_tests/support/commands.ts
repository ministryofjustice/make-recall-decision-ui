// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path = "../../cypress_shared/index.d.ts" />
import 'cypress-axe'
import '../../cypress_shared/commands'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import getCaseVulnerabilitiesResponse from '../../api/responses/get-case-vulnerabilities.json'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'
import getCaseContactHistoryResponse from '../../api/responses/get-case-contact-history.json'
import getCaseLicenceConditionsResponse from '../../api/responses/get-case-licence-conditions.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import getRecommendationsResponse from '../../api/responses/get-case-recommendations.json'

Cypress.Commands.add('signIn', (opts = {}) => {
  cy.task('stubSignIn', opts)
  cy.task('stubAuthUser')
  cy.mockCaseSummaryData()
  cy.request('/')
  return cy.task('getSignInUrl').then(cy.visit)
})

Cypress.Commands.add('mockCaseSummaryData', () => {
  cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
  cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseRiskResponse })
  cy.task('getCase', { sectionId: 'vulnerabilities', statusCode: 200, response: getCaseVulnerabilitiesResponse })
  cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: getCasePersonalDetailsResponse })
  cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: getCaseContactHistoryResponse })
  cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseLicenceConditionsResponse })
  cy.task('getCase', { sectionId: 'recommendations', statusCode: 200, response: getRecommendationsResponse })
})

export const setResponsePropertiesToNull = recommendation => {
  const copy = { ...recommendation }
  Object.keys(recommendation).forEach(key => {
    copy[key] = null
  })
  return copy
}

Cypress.Commands.add('mockRecommendationData', () => {
  cy.task('getRecommendation', {
    statusCode: 200,
    response: {
      ...setResponsePropertiesToNull(completeRecommendationResponse),
      recommendationId: '456',
      crn: '123',
      personOnProbation: {
        name: 'Paula Smith',
      },
    },
  })
})

Cypress.Commands.add('createNoRecallLetter', () => {
  cy.task('createNoRecallLetter', {
    response: {
      letterContent: {
        letterAddress: 'Paula Smith\n123 Acacia Avenue\nBirmingham\nB23 1BC',
        letterDate: '12/09/2022',
        salutation: 'Dear Paula',
        letterTitle: 'DECISION NOT TO RECALL',
        section1: 'section 1',
        section2: 'section 2',
        section3: 'section 3',
        signedByParagraph: 'Yours sincerely,\nProbation practitioner',
      },
    },
  })
})

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})

// required to fix bug in axe-core when running a11y tests
// https://github.com/component-driven/cypress-axe/issues/84
Cypress.Commands.add('injectAxe', () => {
  cy.readFile('node_modules/axe-core/axe.min.js').then(source => {
    return cy.window({ log: false }).then(window => {
      window.eval(source)
    })
  })
})
