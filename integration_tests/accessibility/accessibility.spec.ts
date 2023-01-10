import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

const noRecallResponse = {
  ...completeRecommendationResponse,
  recallType: { selected: { value: 'NO_RECALL' } },
}

const urls = [
  { url: '/' },
  { url: '/search' },
  { url: '/search-results' },
  { url: '/search-results?crn=123' },
  { url: `${routeUrls.cases}/123/overview` },
  { url: `${routeUrls.cases}/123/risk` },
  { url: `${routeUrls.cases}/123/vulnerabilities` },
  { url: `${routeUrls.cases}/123/personal-details` },
  { url: `${routeUrls.cases}/123/licence-conditions` },
  { url: `${routeUrls.cases}/123/contact-history` },
  { url: `${routeUrls.cases}/123/recommendations` },
  // contact filter with valid dates
  {
    url: `${routeUrls.cases}/123/contact-history?dateFrom-day=13&dateFrom-month=4&dateFrom-year=22&dateTo-day=14&dateTo-month=4&dateTo-year=22`,
  },
  // contact filter with invalid dates and errors
  {
    url: `${routeUrls.cases}/123/contact-history?dateFrom-day=13&dateFrom-month=24&dateFrom-year=22&dateTo-day=14&dateTo-month=20&dateTo-year=22`,
  },
  // recommendation flow
  { url: `${routeUrls.recommendations}/456/recall-type`, fullRecommendationData: true },
  { url: `${routeUrls.recommendations}/456/recall-type`, validationError: true, fullRecommendationData: true },
  { url: `${routeUrls.recommendations}/456/alternatives-tried` },
  { url: `${routeUrls.recommendations}/456/alternatives-tried`, validationError: true },
  { url: `${routeUrls.recommendations}/456/task-list`, fullRecommendationData: true },
  { url: `${routeUrls.recommendations}/456/confirmation-part-a`, fullRecommendationData: true },
  { url: `${routeUrls.recommendations}/456/preview-no-recall`, noRecallData: true, fullRecommendationData: true },
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
      if (item.fullRecommendationData) {
        cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      }
      if (item.noRecallData) {
        cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
        cy.createNoRecallLetter()
      }
      cy.visit(item.url)
      if (item.validationError) {
        cy.clickButton('Continue')
      }
      cy.injectAxe()
      cy.checkA11y('body', {
        rules: {
          'aria-allowed-attr': { enabled: false },
        },
      })
    })
  })
})
