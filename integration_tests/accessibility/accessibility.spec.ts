import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import { routeUrls } from '../../server/routes/routeUrls'

const urls = [
  '/',
  '/search',
  '/search-results',
  '/search-results?crn=123',
  `${routeUrls.cases}/123/overview`,
  `${routeUrls.cases}/123/risk`,
  `${routeUrls.cases}/123/personal-details`,
  `${routeUrls.cases}/123/licence-conditions`,
  `${routeUrls.cases}/123/contact-history`,
  // contact filter with valid dates
  `${routeUrls.cases}/123/contact-history?dateFilters=1&dateFrom-day=13&dateFrom-month=4&dateFrom-year=22&dateTo-day=14&dateTo-month=4&dateTo-year=22`,
  // contact filter with invalid dates and errors
  `${routeUrls.cases}/123/contact-history?dateFilters=1&dateFrom-day=13&dateFrom-month=24&dateFrom-year=22&dateTo-day=14&dateTo-month=20&dateTo-year=22`,
]

context('Accessibility (a11y) Checks', () => {
  beforeEach(() => {
    cy.signIn()
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    cy.mockCaseSummaryData()
  })

  urls.forEach(url => {
    it(url, () => {
      cy.visit(url)
      cy.injectAxe()
      cy.checkA11y()
    })
  })
})
