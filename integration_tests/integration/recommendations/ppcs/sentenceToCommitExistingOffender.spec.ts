import { fakerEN as faker } from '@faker-js/faker'
import completeRecommendationResponse from '../../../../api/responses/get-recommendation.json'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import setUpSessionForPpcs from './util'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { SummaryListRow, testSummaryList } from '../../../componentTests/summaryList.tests'
import { formatDateTimeFromIsoString, formatTerm } from '../../../../server/utils/dates/formatting'
import {
  RecommendationResponse,
  Term,
} from '../../../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { SupportingDocument } from '../../../../server/@types/make-recall-decision-api/models/SupportingDocumentsResponse'
import ppcsPaths from '../../../../server/routes/paths/ppcs.paths'
import { resetStubs } from '../../../mockApis/wiremock'

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
  expectedPpudSentenceData: {
    custodyType: string
    offence: string
    offenceDate: string
    releaseDate: string
    sentencingCourt: string
    dateOfSentence: string
    sentenceLength: string
    licenceExpiryDate: string
    sentenceEndDate: string
  },
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

  cy.visit(`/recommendations/${recommendation.id}/${ppcsPaths.sentenceToCommitExistingOffender}`)

  cy.pageHeading().should('contain', 'Double check your booking')

  cy.get('p.govuk-body').should('contain', 'The details in your booking will update the details in PPUD.')

  cy.get('.govuk-grid-column-one-half')
    .eq(0)
    .within(() => {
      cy.get('h2').should('contain', 'Your booking - from NOMIS')
      const offenceRegexp = expectedNomisData.offenceComment
        ? new RegExp(`\\s+${expectedNomisData.offence}\\s+${expectedNomisData.offenceComment}\\s+`)
        : new RegExp(`\\s+${expectedNomisData.offence}\\s+`)
      testSummaryList(cy.get('.govuk-summary-list'), {
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

  cy.get('.govuk-grid-column-one-half')
    .eq(1)
    .within(() => {
      cy.get('h2').should('contain', 'Selected sentence in PPUD')
      testSummaryList(cy.get('.govuk-summary-list'), {
        rows: [
          { key: 'Custody type', value: expectedPpudSentenceData.custodyType },
          { key: 'Offence', value: expectedPpudSentenceData.offence },
          { key: 'Offence date', value: expectedPpudSentenceData.offenceDate },
          { key: 'Release date', value: expectedPpudSentenceData.releaseDate },
          { key: 'Sentencing court', value: expectedPpudSentenceData.sentencingCourt },
          { key: 'Date of sentence', value: expectedPpudSentenceData.dateOfSentence },
          { key: 'Sentence length', value: expectedPpudSentenceData.sentenceLength },
          { key: 'Licence expiry date', value: expectedPpudSentenceData.licenceExpiryDate },
          { key: 'Sentence end date', value: expectedPpudSentenceData.sentenceEndDate },
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

context('Sentence to commit existing offender', () => {
  beforeEach(() => {
    setUpSessionForPpcs()
  })

  afterEach(() => {
    resetStubs()
  })

  describe('Page data', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
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
        {
          custodyType: '-',
          offence: '-',
          offenceDate: '-',
          releaseDate: '-',
          sentencingCourt: '-',
          dateOfSentence: '-',
          sentenceLength: '-',
          licenceExpiryDate: '-',
          sentenceEndDate: '-',
        },
        [],
      )
    })

    it('NOMIS sentence is part of single-sentence sequence (non-null sentenceEndDate)', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.DETERMINATE,
          custodyTypeBasedOnGroup: CUSTODY_GROUP.DETERMINATE,
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
          key: 'Sentence expiry date',
          value: formatDateTimeFromIsoString({ isoDate: selectedNomisSentence.sentenceEndDate }),
        },
        {
          custodyType: selectedPpudSentence.custodyType,
          offence: selectedPpudSentence.offence.indexOffence,
          offenceDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.offence.dateOfIndexOffence }),
          releaseDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.releaseDate }),
          sentencingCourt: selectedPpudSentence.sentencingCourt,
          dateOfSentence: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.dateOfSentence }),
          sentenceLength: formatTerm({
            years: selectedPpudSentence.sentenceLength.partYears,
            months: selectedPpudSentence.sentenceLength.partMonths,
            days: selectedPpudSentence.sentenceLength.partDays,
          } as Term),
          licenceExpiryDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.licenceExpiryDate }),
          sentenceEndDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.sentenceExpiryDate }),
        },
        [
          { title: 'Part-A-X123456', filename: 'Part-A-X123456.doc', type: 'PPUDPartA', id: '1' },
          { title: 'Licence-X123456', filename: 'Licence-X123456.doc', type: 'PPUDLicenceDocument', id: '2' },
        ],
      )
    })

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
        {
          custodyType: selectedPpudSentence.custodyType,
          offence: selectedPpudSentence.offence.indexOffence,
          offenceDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.offence.dateOfIndexOffence }),
          releaseDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.releaseDate }),
          sentencingCourt: selectedPpudSentence.sentencingCourt,
          dateOfSentence: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.dateOfSentence }),
          sentenceLength: formatTerm({
            years: selectedPpudSentence.sentenceLength.partYears,
            months: selectedPpudSentence.sentenceLength.partMonths,
            days: selectedPpudSentence.sentenceLength.partDays,
          } as Term),
          licenceExpiryDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.licenceExpiryDate }),
          sentenceEndDate: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.sentenceExpiryDate }),
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
          ppudOffender: {
            sentences: [
              {
                id: '1',
                dateOfSentence: '2003-06-12',
                custodyType: 'Determinate',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
                releases: [],
              },
            ],
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            ppudSentenceId: '1',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            minute: 'Cannot access OASys at the moment',
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

      cy.visit(`/recommendations/252523937/sentence-to-commit-existing-offender`)

      // Documents section
      cy.contains('h2', 'Documents').should('exist')
      cy.get('.govuk-summary-list__value').should('contain', 'Part-A-X123456.doc')
      cy.get('.govuk-summary-list__value').should('contain', 'Licence-X123456.doc')

      // Minutes section
      cy.contains('h2', 'Minutes').should('exist')
      cy.contains('Cannot access OASys at the moment').should('exist')
    })
  })
})
