import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

const noRecallResponse = {
  ...completeRecommendationResponse,
  recallType: { selected: { value: 'NO_RECALL' } },
}

const urls = [
  { url: '/' },
  { url: '/search-by-crn' },
  { url: '/search-by-name' },
  { url: '/search-results-by-crn?crn=123' },
  { url: '/search-results-by-crn?crn=123&page=0' },
  { url: '/search-results-by-name?crn=123&page=0' },
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
  recommendationEndpoint('task-list-consider-recall'),
  recommendationEndpoint('trigger-leading-to-recall'),
  recommendationEndpoint('response-to-probation'),
  // recommendationEndpoint('licence-conditions'),
  recommendationEndpoint('alternatives-tried'),
  recommendationEndpoint('indeterminate-type'),
  recommendationEndpoint('is-indeterminate'),
  recommendationEndpoint('is-extended'),
  recommendationEndpoint('share-case-with-manager'),
  recommendationEndpoint('share-case-with-admin'),
  recommendationEndpoint('discuss-with-manager'),
  recommendationEndpoint('recall-type'),
  recommendationEndpoint('emergency-recall'),
  recommendationEndpoint('sensitive-info'),
  recommendationEndpoint('custody-status'),
  recommendationEndpoint('what-led'),
  recommendationEndpoint('recall-type-indeterminate'),
  recommendationEndpoint('fixed-licence'),
  recommendationEndpoint('indeterminate-details'),
  recommendationEndpoint('vulnerabilities'),
  recommendationEndpoint('task-list-no-recall'),
  recommendationEndpoint('why-considered-recall'),
  recommendationEndpoint('reasons-no-recall'),
  // recommendationEndpoint('appointment-no-recall'),
  recommendationEndpoint('contraband'),
  // recommendationEndpoint('address-details'),
  recommendationEndpoint('iom'),
  recommendationEndpoint('police-details'),
  recommendationEndpoint('victim-contact-scheme'),
  recommendationEndpoint('victim-liaison-officer'),
  recommendationEndpoint('confirmation-no-recall'),
  recommendationEndpoint('manager-review'),
  // recommendationEndpoint('offence-details'),
  // recommendationEndpoint('mappa'),
  // recommendationEndpoint('manager-view-decision'),
  recommendationEndpoint('who-completed-part-a'),
  recommendationEndpoint('practitioner-for-part-a'),
  recommendationEndpoint('revocation-order-recipients'),
  recommendationEndpoint('ppcs-query-emails'),
  recommendationEndpoint('arrest-issues'),
  recommendationEndpoint('add-previous-release'),
  recommendationEndpoint('add-previous-recall'),
  // recommendationEndpoint('previous-recalls'),
  // recommendationEndpoint('previous-releases'),
  // recommendationEndpoint('offence-analysis'),
  // recommendationEndpoint('rosh'),
  recommendationEndpoint('manager-decision-confirmation'),
  // recommendationEndpoint('request-spo-countersign'),
  recommendationEndpoint('request-aco-countersign'),
  recommendationEndpoint('confirmation-part-a'),
  recommendationEndpoint('preview-part-a'),
  recommendationEndpoint('task-list'),
  { url: `${routeUrls.recommendations}/456/recall-type`, validationError: true, fullRecommendationData: true },
  { url: `${routeUrls.recommendations}/456/alternatives-tried`, validationError: true },
  { url: `${routeUrls.recommendations}/456/preview-no-recall`, noRecallData: true, fullRecommendationData: false },
]

const spoUrls = [
  recommendationEndpoint('spo-task-list-consider-recall', ['SPO_CONSIDER_RECALL']),
  recommendationEndpoint('review-practitioners-concerns', ['SPO_CONSIDER_RECALL']),
  recommendationEndpoint('spo-rationale', ['SPO_CONSIDER_RECALL']),
  recommendationEndpoint('rationale-check', ['SPO_SIGNATURE_REQUESTED']),
  // recommendationEndpoint('spo-record-decision',['SPO_CONSIDER_RECALL']),
  // recommendationEndpoint('spo-rationale-confirmation', ['SPO_RECORDED_RATIONALE']),
  recommendationEndpoint('countersigning-telephone', ['SPO_SIGNATURE_REQUESTED']),
  recommendationEndpoint('spo-countersignature', ['SPO_SIGNATURE_REQUESTED']),
  recommendationEndpoint('aco-countersignature', ['ACO_SIGNATURE_REQUESTED']),
  recommendationEndpoint('countersign-confirmation', ['SPO_SIGNED']),
]

function recommendationEndpoint(resource: string, statuses = []) {
  return {
    url: `${routeUrls.recommendations}/456/${resource}`,
    fullRecommendationData: true,
    validationError: false,
    noRecallData: false,
    statuses: statuses.map(name => ({ name, active: true })),
  }
}

const TEMPLATE = {
  results: [
    {
      name: 'Harry 1 Smith',
      crn: 'X098092',
      dateOfBirth: '1980-05-06',
      userExcluded: false,
      userRestricted: false,
    },
    {
      name: 'Harry 2 Hamburger',
      crn: 'X098093',
      dateOfBirth: '1980-05-06',
      userExcluded: false,
      userRestricted: false,
    },
  ],
  paging: { page: 0, pageSize: 10, totalNumberOfPages: 1 },
}

context('Accessibility (a11y) Checks', () => {
  beforeEach(() => {
    cy.signIn()
    cy.task('searchPersons', { statusCode: 200, response: TEMPLATE })
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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

context('Accessibility (a11y) SPO Checks', () => {
  beforeEach(() => {
    cy.signIn({ hasSpoRole: true })
    cy.task('searchPersons', { statusCode: 200, response: TEMPLATE })
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })

    cy.mockCaseSummaryData()
    cy.mockRecommendationData()
  })

  spoUrls.forEach(item => {
    it(`${item.url}${item.validationError ? ' - error' : ''}`, () => {
      if (item.fullRecommendationData) {
        cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      }
      if (item.noRecallData) {
        cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
        cy.createNoRecallLetter()
      }
      cy.task('getStatuses', { statusCode: 200, response: item.statuses })
      cy.task('updateStatuses', { statusCode: 200, response: item.statuses })
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
      cy.pageHeading().should('not.equal', 'You cannot access this page')
    })
  })
})
