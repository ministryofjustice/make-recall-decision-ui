// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path = "../../cypress_shared/index.d.ts" />
import 'cypress-axe'
import '../../cypress_shared/commands'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'
import getCaseContactHistoryResponse from '../../api/responses/get-case-contact-history.json'
import getCaseLicenceConditionsResponse from '../../api/responses/get-case-licence-conditions.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

Cypress.Commands.add('signIn', () => {
  cy.task('stubSignIn')
  cy.task('stubAuthUser')
  cy.mockCaseSummaryData()
  cy.request('/')
  return cy.task('getSignInUrl').then(cy.visit)
})

Cypress.Commands.add('mockCaseSummaryData', () => {
  cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
  cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseRiskResponse })
  cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: getCasePersonalDetailsResponse })
  cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: getCaseContactHistoryResponse })
  cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseLicenceConditionsResponse })
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

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})
