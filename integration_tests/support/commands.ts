// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path = "../../cypress_shared/index.d.ts" />
import 'cypress-axe'
import '../../cypress_shared/commands'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'
import getCaseContactHistoryResponse from '../../api/responses/get-case-contact-history.json'
import getCaseLicenceConditionsResponse from '../../api/responses/get-case-licence-conditions.json'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.task('reset')
  cy.task('stubSignIn')
  cy.task('stubAuthUser')
  cy.intercept(
    {
      method: 'GET',
      url: 'https://www.google-analytics.com/collect?*',
      query: {
        t: 'pageview',
      },
    },
    { statusCode: 200 }
  ).as('googleAnalytics')
  cy.intercept('POST', 'https://www.google-analytics.com/j/collect?*', { statusCode: 200 })
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('mockCaseSummaryData', () => {
  cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
  cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseRiskResponse })
  cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: getCasePersonalDetailsResponse })
  cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: getCaseContactHistoryResponse })
  cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseLicenceConditionsResponse })
})

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})
