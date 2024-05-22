import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import { caseTemplate } from '../fixtures/CaseTemplateBuilder'
import { standardActiveConvictionTemplate } from '../fixtures/ActiveConvictionTemplateBuilder'
import { deliusLicenceConditionDoNotPossess } from '../fixtures/DeliusLicenceConditionTemplateBuilder'

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
  recommendationEndpoint('already-existing', [], true),
  recommendationEndpoint('task-list-consider-recall'),
  recommendationEndpoint('trigger-leading-to-recall'),
  recommendationEndpoint('response-to-probation'),
  recommendationEndpoint('licence-conditions'),
  recommendationEndpoint('alternatives-tried'),
  recommendationEndpoint('indeterminate-type'),
  recommendationEndpoint('is-indeterminate'),
  recommendationEndpoint('is-extended'),
  recommendationEndpoint('share-case-with-manager'),
  recommendationEndpoint('share-case-with-admin'),
  recommendationEndpoint('discuss-with-manager'),
  recommendationEndpoint('recall-type'),
  recommendationEndpoint('spo-agree-to-recall'),
  recommendationEndpoint('emergency-recall'),
  recommendationEndpoint('suitability-for-fixed-term-recall'),
  recommendationEndpoint('sensitive-info'),
  recommendationEndpoint('custody-status'),
  recommendationEndpoint('what-led'),
  recommendationEndpoint('recall-type-indeterminate'),
  recommendationEndpoint('recall-type-extended'),
  recommendationEndpoint('fixed-licence'),
  recommendationEndpoint('indeterminate-details'),
  recommendationEndpoint('vulnerabilities'),
  recommendationEndpoint('task-list-no-recall'),
  recommendationEndpoint('why-considered-recall'),
  recommendationEndpoint('reasons-no-recall'),
  recommendationEndpoint('appointment-no-recall'),
  recommendationEndpoint('contraband'),
  recommendationEndpoint('address-details'),
  recommendationEndpoint('iom'),
  recommendationEndpoint('police-details'),
  recommendationEndpoint('victim-contact-scheme'),
  recommendationEndpoint('victim-liaison-officer'),
  recommendationEndpoint('confirmation-no-recall'),
  recommendationEndpoint('manager-review'),
  recommendationEndpoint('offence-details'),
  recommendationEndpoint('mappa'),
  recommendationEndpoint('who-completed-part-a'),
  recommendationEndpoint('practitioner-for-part-a'),
  recommendationEndpoint('revocation-order-recipients'),
  recommendationEndpoint('ppcs-query-emails'),
  recommendationEndpoint('arrest-issues'),
  recommendationEndpoint('add-previous-release'),
  recommendationEndpoint('add-previous-recall'),
  recommendationEndpoint('previous-recalls'),
  recommendationEndpoint('previous-releases'),
  recommendationEndpoint('offence-analysis'),
  recommendationEndpoint('rosh'),
  recommendationEndpoint('manager-decision-confirmation'),
  recommendationEndpoint('request-spo-countersign'),
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
  recommendationEndpoint('spo-record-decision', ['SPO_CONSIDER_RECALL'], true),
  recommendationEndpoint('spo-rationale-confirmation', ['SPO_RECORDED_RATIONALE'], true),
  recommendationEndpoint('countersigning-telephone', ['SPO_SIGNATURE_REQUESTED']),
  recommendationEndpoint('spo-countersignature', ['SPO_SIGNATURE_REQUESTED']),
  recommendationEndpoint('aco-countersignature', ['ACO_SIGNATURE_REQUESTED']),
  recommendationEndpoint('countersign-confirmation', ['SPO_SIGNED']),
  recommendationEndpoint('spo-why-no-recall', ['SPO_CONSIDER_RECALL']),
  recommendationEndpoint('spo-senior-manager-endorsement', ['SPO_CONSIDER_RECALL']),
  recommendationEndpoint('spo-record-decision', ['SPO_CONSIDER_RECALL'], true),
  recommendationEndpoint('spo-delete-recommendation-rationale', ['SPO_CONSIDER_RECALL']),
  recommendationEndpoint('record-delete-rationale', ['SPO_CONSIDER_RECALL']),
  recommendationEndpoint('spo-delete-confirmation', ['REC_DELETED', 'SPO_CONSIDER_RECALL']),
]

const ppcsUrls = [
  { url: '/ppcs-search', validationError: false, fullRecommendationData: false, statuses: [] },
  { url: '/ppcs-search-results?crn=X098092', validationError: false, fullRecommendationData: false, statuses: [] },
  recommendationEndpoint('search-ppud', ['SENT_TO_PPCS']),
  recommendationEndpoint('search-ppud-results', ['SENT_TO_PPCS']),
  recommendationEndpoint('check-booking-details', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-name', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-gender', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-ethnicity', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-date-of-birth', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-cro', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-prison-booking-number', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-police-contact', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-releasing-prison', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-legislation-released-under', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-custody-type', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-recall-received-date-and-time', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-probation-area', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-mappa-level', ['SENT_TO_PPCS']),
  recommendationEndpoint('select-index-offence', ['SENT_TO_PPCS']),
  recommendationEndpoint('match-index-offence', ['SENT_TO_PPCS']),
  recommendationEndpoint('select-ppud-sentence', ['SENT_TO_PPCS']),
  recommendationEndpoint('sentence-to-commit', ['SENT_TO_PPCS']),
  recommendationEndpoint('supporting-documents', ['SENT_TO_PPCS']),
  recommendationEndpoint('supporting-document-upload/part-a', ['SENT_TO_PPCS']),
  recommendationEndpoint('additional-supporting-document-upload', ['SENT_TO_PPCS']),
  recommendationEndpoint('additional-supporting-document-replace/12356', ['SENT_TO_PPCS']),
  recommendationEndpoint('additional-supporting-document-remove/12356', ['SENT_TO_PPCS']),
  recommendationEndpoint('edit-ppud-minute', ['SENT_TO_PPCS']),
  recommendationEndpoint('supporting-document-replace/part-a/11111', ['SENT_TO_PPCS']),
  recommendationEndpoint('supporting-document-remove/11111', ['SENT_TO_PPCS']),
  recommendationEndpoint('sentence-to-commit-existing-offender', ['SENT_TO_PPCS']),
  recommendationEndpoint('book-to-ppud', ['SENT_TO_PPCS']),
  recommendationEndpoint('booked-to-ppud', ['SENT_TO_PPCS', 'BOOKED_TO_PPUD']),
  recommendationEndpoint('booking-summary', ['SENT_TO_PPCS', 'BOOKED_TO_PPUD']),
]

const apUrls = [
  recommendationEndpoint('ap-licence-conditions', []),
  recommendationEndpoint('ap-recall-rationale', []),
  recommendationEndpoint('ap-record-decision', []),
  recommendationEndpoint('ap-why-no-recall', []),
  recommendationEndpoint('ap-rationale-confirmation', ['AP_RECORDED_RATIONALE']),
]

function recommendationEndpoint(resource: string, statuses = [], fullRecommendationData: boolean = false) {
  return {
    url: `${routeUrls.recommendations}/456/${resource}`,
    fullRecommendationData,
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
    cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task(
      'getCase',
      caseTemplate()
        .withActiveConviction(
          standardActiveConvictionTemplate()
            .withDescription('Robbery - 05714')
            .withLicenceCondition(deliusLicenceConditionDoNotPossess())
        )
        .withAllConvictionsReleasedOnLicence()
        .build()
    )
    cy.task('updateStatuses', { statusCode: 200, response: [] })
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
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
    cy.task('searchPersons', { statusCode: 200, response: TEMPLATE })
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })

    cy.mockCaseSummaryData()
    cy.mockRecommendationData()
  })

  spoUrls.forEach(item => {
    it(`${item.url}${item.validationError ? ' - error' : ''}`, () => {
      if (item.fullRecommendationData) {
        cy.task('getRecommendation', {
          statusCode: 200,
          response: { ...completeRecommendationResponse, spoRecallType: 'RECALL', spoRecallRationale: 'something' },
        })
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

context('Accessibility (a11y) AP Checks', () => {
  beforeEach(() => {
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
    cy.task('searchPersons', { statusCode: 200, response: TEMPLATE })
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })

    cy.mockCaseSummaryData()
    cy.mockRecommendationData()
  })

  apUrls.forEach(item => {
    it(`${item.url}${item.validationError ? ' - error' : ''}`, () => {
      if (item.fullRecommendationData) {
        cy.task('getRecommendation', {
          statusCode: 200,
          response: { ...completeRecommendationResponse, spoRecallType: 'RECALL', spoRecallRationale: 'something' },
        })
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

context('Accessibility (a11y) PPCS Checks', () => {
  beforeEach(() => {
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })

    cy.task('ppcsSearch', {
      statusCode: 200,
      response: {
        results: [
          {
            name: 'Harry Smith',
            crn: 'X098092',
            dateOfBirth: '1980-05-06',
            recommendationId: 799270715,
          },
        ],
      },
    })
    cy.task('searchForPrisonOffender', {
      statusCode: 200,
      response: {
        locationDescription: 'Graceland',
        bookingNo: '1234',
        firstName: 'Anne',
        middleName: 'C',
        lastName: 'McCaffrey',
        facialImageId: 1234,
        dateOfBirth: '1970-03-15',
        status: 'ACTIVE IN',
        physicalAttributes: {
          gender: 'Male',
          ethnicity: 'Caucasian',
        },
        identifiers: [
          {
            type: 'CRO',
            value: '1234/2345',
          },
          {
            type: 'PNC',
            value: 'X234547',
          },
        ],
      },
    })
  })

  ppcsUrls.forEach(item => {
    it(`${item.url}`, () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            firstName: 'Max',
            middleName: 'Arthur',
            lastName: 'Mull',
          },
          bookRecallToPpud: {
            firstNames: 'Pinky',
            lastName: 'Pooh',
            ppudSentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
          },
          ppudOffender: {
            sentences: [
              {
                id: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
                releases: [
                  {
                    dateOfRelease: '2013-02-02',
                  },
                  {
                    dateOfRelease: '2015-02-09',
                  },
                  {
                    dateOfRelease: '2005-02-02',
                  },
                ],
              },
              {
                id: '4F6666656E64657249643D3136323931342653656E74656E636549643D313238393334G1375H1387',
              },
            ],
          },
          nomisIndexOffence: {
            allOptions: [
              {
                bookingId: 13,
                courtDescription: 'Blackburn County Court',
                offenceCode: 'SA96036',
                offenceDescription:
                  'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
                offenceStatute: 'SA96',
                offenderChargeId: 3934369,
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
                sentenceStartDate: '2023-11-16',
                sentenceTypeDescription: 'Adult Mandatory Life',
                terms: [],
                releaseDate: '2025-11-16',
                licenceExpiryDate: '2025-11-17',
                releasingPrison: 'Broad Moor',
              },
            ],
            selected: 3934369,
          },
        },
      })
      cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: item.statuses })
      cy.task('updateStatuses', { statusCode: 200, response: item.statuses })

      cy.task('getReferenceList', { name: 'genders', statusCode: 200, response: { values: ['one', 'two'] } })
      cy.task('getReferenceList', { name: 'ethnicities', statusCode: 200, response: { values: ['one', 'two'] } })
      cy.task('getReferenceList', { name: 'establishments', statusCode: 200, response: { values: ['one', 'two'] } })
      cy.task('getReferenceList', { name: 'released-unders', statusCode: 200, response: { values: ['one', 'two'] } })
      cy.task('getReferenceList', { name: 'police-forces', statusCode: 200, response: { values: ['val'] } })
      cy.task('getReferenceList', { name: 'mappa-levels', statusCode: 200, response: { values: ['val'] } })
      cy.task('getReferenceList', { name: 'index-offences', statusCode: 200, response: { values: ['val'] } })
      cy.task('getReferenceList', { name: 'custody-types', statusCode: 200, response: { values: ['val'] } })
      cy.task('getReferenceList', { name: 'probation-services', statusCode: 200, response: { values: ['val'] } })
      cy.task('getReferenceList', { name: 'index-offences', statusCode: 200, response: { values: ['val'] } })
      cy.task('prisonSentences', {
        statusCode: 200,
        response: [
          {
            bookingId: 13,
            sentenceSequence: 4,
            lineSequence: 4,
            caseSequence: 2,
            courtDescription: 'Blackburn County Court',
            sentenceStatus: 'A',
            sentenceCategory: '2003',
            sentenceCalculationType: 'MLP',
            sentenceTypeDescription: 'Adult Mandatory Life',
            sentenceDate: '2023-11-16',
            sentenceStartDate: '2023-11-16',
            sentenceEndDate: '3022-11-15',
            terms: [],
            offences: [
              {
                offenderChargeId: 3934369,
                offenceStartDate: '1899-01-01',
                offenceStatute: 'SA96',
                offenceCode: 'SA96036',
                offenceDescription:
                  'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
                indicators: [],
              },
            ],
          },
        ],
      })
      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          {
            title: 'Part A',
            type: 'PPUDPartA',
            filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
            id: '11111',
          },
          {
            title: 'some  title',
            type: 'OtherDocument',
            filename: 'NAT_Recall_Part_A_02022024_Smith_H_X098092.docx',
            id: '12356',
          },
        ],
      })

      cy.visit(item.url)
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
