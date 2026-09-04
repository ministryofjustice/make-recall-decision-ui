import { fakerEN as faker } from '@faker-js/faker'
import completeRecommendationResponse from '../../../../api/responses/get-recommendation.json'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import setUpSessionForPpcs from './util'
import { RecommendationResponse } from '../../../../server/@types/make-recall-decision-api'
import { SummaryListRow, testSummaryList } from '../../../componentTests/summaryList.tests'
import { SupportingDocument } from '../../../../server/@types/make-recall-decision-api/models/SupportingDocumentsResponse'
import ppcsPaths from '../../../../server/routes/paths/ppcs.paths'
import { resetStubs } from '../../../mockApis/wiremock'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { formatDateTimeFromIsoString, formatTerm } from '../../../../server/utils/dates/formatting'

function testPageData(
  recommendation: RecommendationResponse,
  expectedNomisData: {
    custodyType: string
    offence: string
    offenceComment: string
    offenceDate: string
    releaseDate: string
    sentencingCourt: string
    dateOfSentence: string
    licenceExpiryDate: string
  },
  sentenceTerms: SummaryListRow[],
  expiryDate: SummaryListRow,
  supportingDocuments: SupportingDocument[],
) {
  cy.task('getRecommendation', {
    statusCode: 200,
    response: recommendation,
  })

  cy.task('getSupportingDocuments', {
    statusCode: 200,
    response: supportingDocuments,
  })

  cy.visit(`/recommendations/${recommendation.id}/${ppcsPaths.sentenceToCommit}`)

  cy.pageHeading().should(
    'contain',
    `Your recall booking - ${recommendation.bookRecallToPpud.firstNames} ${recommendation.bookRecallToPpud.lastName}`,
  )

  cy.get('p.govuk-body').should('contain', 'This is the offence you have selected.  It will go into PPUD.')

  cy.get('form').within(() => {
    cy.get('h2').should('contain', 'Your recall booking')
    const offenceRegexp = expectedNomisData.offenceComment
      ? new RegExp(`\\s+${expectedNomisData.offence}\\s+${expectedNomisData.offenceComment}\\s+`)
      : new RegExp(`\\s+${expectedNomisData.offence}\\s+`)
    testSummaryList(cy.get('#sentence-details-list'), {
      rows: [
        { key: 'Custody type', value: expectedNomisData.custodyType },
        { key: 'Offence', valueRegex: offenceRegexp },
        { key: 'Offence date', value: expectedNomisData.offenceDate },
        { key: 'Release date', value: expectedNomisData.releaseDate },
        { key: 'Sentencing court', value: expectedNomisData.sentencingCourt },
        { key: 'Date of sentence', value: expectedNomisData.dateOfSentence },
        ...sentenceTerms,
        { key: 'Licence expiry date', value: expectedNomisData.licenceExpiryDate },
        expiryDate,
      ],
    })
  })

  cy.get('h2').should('contain', 'Documents')
  if (supportingDocuments.length > 0) {
    cy.get('#documents-list').within(() => {
      supportingDocuments.forEach(doc => {
        cy.get('.govuk-summary-list__row').should('contain', doc.filename)
      })
    })
  }

  cy.get('h2').should('contain', 'Minutes')
  // TODO check contents of minutes are as expected once minute retrieval has been updated in the controller and njk
}

context('Sentence to commit', () => {
  beforeEach(() => {
    setUpSessionForPpcs()
  })

  afterEach(() => {
    resetStubs()
  })

  describe('Sentence to commit', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getSupportingDocuments', { statusCode: 200, response: [] })
    })

    it('Empty values', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.DETERMINATE,
          custodyType: undefined,
          indexOffence: 'none',
          ppudSentenceId: undefined,
          indexOffenceComment: 'none',
        },
        nomisIndexOffence: {
          selectedIndex: 'none',
        },
      })

      testPageData(
        recommendation,
        {
          custodyType: '-',
          offence: '-',
          offenceComment: '',
          offenceDate: '-',
          releaseDate: '-',
          sentencingCourt: '-',
          dateOfSentence: '-',
          licenceExpiryDate: '-',
        },
        [],
        { key: 'Latest sentence expiry date', value: '-' },
        [],
      )
    })

    it('multiple terms', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.DETERMINATE,
          custodyTypeBasedOnGroup: CUSTODY_GROUP.DETERMINATE,
        },
        nomisIndexOffence: {
          offeredOffenceOptions: [{ terms: [{ code: 'IMP' }, { code: 'LIC' }] }, {}, {}],
          selectedIndex: 0,
        },
      })

      const selectedNomisSentence = recommendation.nomisIndexOffence.allOptions.find(
        o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
      )

      testPageData(
        recommendation,
        {
          custodyType: recommendation.bookRecallToPpud.custodyType,
          offence: recommendation.bookRecallToPpud.indexOffence,
          offenceComment: recommendation.bookRecallToPpud.indexOffenceComment,
          offenceDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.offenceDate }),
          releaseDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.releaseDate }),
          sentencingCourt: selectedNomisSentence.courtDescription,
          dateOfSentence: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.sentenceDate }),
          licenceExpiryDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.licenceExpiryDate }),
        },
        [
          { key: 'Custodial term', value: formatTerm(selectedNomisSentence.terms[0]) },
          { key: 'Extended term', value: formatTerm(selectedNomisSentence.terms[1]) },
        ],
        {
          key: 'Sentence expiry date',
          value: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.sentenceEndDate }),
        },
        [
          { title: 'Part-A-X123456', filename: 'Part-A-X123456.doc', type: 'PPUDPartA', id: '1' },
          { title: 'Licence-X123456', filename: 'Licence-X123456.doc', type: 'PPUDLicenceDocument', id: '2' },
        ],
      )
    })

    it('single term', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.DETERMINATE,
          custodyTypeBasedOnGroup: CUSTODY_GROUP.DETERMINATE,
        },
      })

      const selectedNomisSentence = recommendation.nomisIndexOffence.allOptions.find(
        o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
      )

      testPageData(
        recommendation,
        {
          custodyType: recommendation.bookRecallToPpud.custodyType,
          offence: recommendation.bookRecallToPpud.indexOffence,
          offenceComment: recommendation.bookRecallToPpud.indexOffenceComment,
          offenceDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.offenceDate }),
          releaseDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.releaseDate }),
          sentencingCourt: selectedNomisSentence.courtDescription,
          dateOfSentence: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.sentenceDate }),
          licenceExpiryDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.licenceExpiryDate }),
        },
        [{ key: 'Sentence length', value: formatTerm(selectedNomisSentence.terms[0]) }],
        {
          key: 'Sentence expiry date',
          value: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.sentenceEndDate }),
        },
        [
          { title: 'Part-A-X123456', filename: 'Part-A-X123456.doc', type: 'PPUDPartA', id: '1' },
          { title: 'Licence-X123456', filename: 'Licence-X123456.doc', type: 'PPUDLicenceDocument', id: '2' },
        ],
      )
    })

    // This test case is skipped, as it would be identical to one of the cases above (depending on how the terms are set up)
    // it('NOMIS sentence is part of single-sentence sequence (non-null sentenceEndDate)', () => {})

    it('NOMIS sentence is part of multi-sentence sequence (no sentenceEndDate)', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.DETERMINATE,
          custodyTypeBasedOnGroup: CUSTODY_GROUP.DETERMINATE,
        },
        nomisIndexOffence: {
          selectedIndex: 0,
          offeredOffenceOptions: [{ sentenceEndDate: 'none' }, {}, {}],
        },
      })

      const selectedPpudSentence = faker.helpers.arrayElement(recommendation.ppudOffender.sentences)
      recommendation.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id

      const selectedNomisSentence = recommendation.nomisIndexOffence.allOptions.find(
        o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
      )

      testPageData(
        recommendation,
        {
          custodyType: recommendation.bookRecallToPpud.custodyType,
          offence: recommendation.bookRecallToPpud.indexOffence,
          offenceComment: recommendation.bookRecallToPpud.indexOffenceComment,
          offenceDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.offenceDate }),
          releaseDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.releaseDate }),
          sentencingCourt: selectedNomisSentence.courtDescription,
          dateOfSentence: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.sentenceDate }),
          licenceExpiryDate: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.licenceExpiryDate }),
        },
        [{ key: 'Sentence length', value: formatTerm(selectedNomisSentence.terms[0]) }],
        {
          key: 'Latest sentence expiry date',
          value: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.sentenceSequenceExpiryDate }),
        },
        [
          { title: 'Part-A-X123456', filename: 'Part-A-X123456.doc', type: 'PPUDPartA', id: '1' },
          { title: 'Licence-X123456', filename: 'Licence-X123456.doc', type: 'PPUDLicenceDocument', id: '2' },
        ],
      )
    })

    it('displays documents and minutes sections', () => {
      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          { filename: 'Part-A-X123456.doc', type: 'PPUDPartA', id: '1' },
          { filename: 'Licence-X123456.doc', type: 'PPUDLicenceDocument', id: '2' },
        ],
      })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: { status: 'ACTIVE IN', locationDescription: 'HMP Prison' },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyType: 'custody type',
            indexOffence: 'index offence',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            minute: 'Offender has a history of non-compliance with licence conditions',
          },
          nomisIndexOffence: {
            allOptions: [
              {
                offenderChargeId: 3934369,
                courtDescription: 'Winchester Crown Court',
                terms: [],
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)

      // Documents section
      cy.contains('h2', 'Documents').should('exist')
      cy.get('.govuk-summary-list__value').should('contain', 'Part-A-X123456.doc')
      cy.get('.govuk-summary-list__value').should('contain', 'Licence-X123456.doc')

      // Minutes section
      cy.contains('h2', 'Minutes')
        .should('exist')
        .next('hr')
        .next('p.govuk-body')
        .should('contain', 'Offender has a history of non-compliance with licence conditions')
    })
  })
})
