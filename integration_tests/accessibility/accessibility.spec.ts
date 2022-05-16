import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'
import getCaseLicenceHistoryResponse from '../../api/responses/get-case-licence-history.json'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import { routeUrls } from '../../server/routes/routeUrls'

const urls = [
  '/',
  '/search',
  '/search-results',
  '/search-results?crn=123',
  `${routeUrls.cases}/123/overview`,
  `${routeUrls.cases}/123/risk`,
  `${routeUrls.cases}/123/personal-details`,
  `${routeUrls.cases}/123/licence-history`,
]

context('Accessibility (a11y) Checks', () => {
  beforeEach(() => {
    cy.signIn()
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseRiskResponse })
    cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: getCasePersonalDetailsResponse })
    cy.task('getCase', { sectionId: 'licence-history', statusCode: 200, response: getCaseLicenceHistoryResponse })
  })

  urls.forEach(url => {
    it(url, () => {
      cy.visit(url)
      cy.injectAxe()
      cy.checkA11y()
    })
  })
})
