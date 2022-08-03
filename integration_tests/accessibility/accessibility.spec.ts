import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import { routeUrls } from '../../server/routes/routeUrls'

const urls = [
  { url: '/' },
  { url: '/search' },
  { url: '/search-results' },
  { url: '/search-results?crn=123' },
  { url: `${routeUrls.cases}/123/overview` },
  { url: `${routeUrls.cases}/123/risk` },
  { url: `${routeUrls.cases}/123/personal-details` },
  { url: `${routeUrls.cases}/123/licence-conditions` },
  { url: `${routeUrls.cases}/123/contact-history?flagRecommendationProd=1` },
  // contact filter with valid dates
  {
    url: `${routeUrls.cases}/123/contact-history?dateFrom-day=13&dateFrom-month=4&dateFrom-year=22&dateTo-day=14&dateTo-month=4&dateTo-year=22`,
  },
  // contact filter with invalid dates and errors
  {
    url: `${routeUrls.cases}/123/contact-history?dateFrom-day=13&dateFrom-month=24&dateFrom-year=22&dateTo-day=14&dateTo-month=20&dateTo-year=22`,
  },
  // recommendation flow
  { url: `${routeUrls.recommendations}/456/recall-type` },
  { url: `${routeUrls.recommendations}/456/recall-type`, validationError: true },
  { url: `${routeUrls.recommendations}/456/custody-status` },
  { url: `${routeUrls.recommendations}/456/custody-status`, validationError: true },
]

context('Accessibility (a11y) Checks', () => {
  beforeEach(() => {
    cy.signIn()
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    cy.mockCaseSummaryData()
    cy.mockRecommendationData()
  })

  urls.forEach(item => {
    it(`${item.url}${item.validationError ? ' - error' : ''}`, () => {
      cy.visit(item.url)
      if (item.validationError) {
        cy.clickButton('Continue')
      }
      cy.injectAxe()
      cy.checkA11y()
    })
  })
})
