import completeRecommendationResponse from '../../../../api/responses/get-recommendation.json'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import setUpSessionForPpcs from './util'

context('Sentence to commit', () => {
  beforeEach(() => {
    setUpSessionForPpcs()
  })

  describe('Sentence to commit', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getSupportingDocuments', { statusCode: 200, response: [] })
    })

    it('multiple terms', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyType: 'custody type',
            indexOffence: 'index offence',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          nomisIndexOffence: {
            allOptions: [
              {
                sentenceTypeDescription: 'sentence type description',
                offenceDescription: 'offence description',
                offenderChargeId: 3934369,
                offenceDate: '2023-11-17',
                sentenceDate: '2023-11-16',
                sentenceSequenceExpiryDate: '3022-11-15',
                releaseDate: '2025-01-01',
                licenceExpiryDate: '2025-01-02',
                releasingPrison: 'releasing prison',
                courtDescription: 'court description',
                terms: [
                  {
                    years: 4,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'IMP',
                  },
                  {
                    years: 2,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'LIC',
                  },
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')

      cy.getText('custodyType').should('contain', 'custody type')
      cy.getText('offenceDescription').should('contain', 'index offence')
      cy.getText('offenceDate').should('contain', '17 November 2023')
      cy.getText('releaseDate').should('contain', '1 January 2025')
      cy.getText('courtDescription').should('contain', 'court description')
      cy.getText('sentenceDate').should('contain', '16 November 2023')
      cy.getText('licenceExpiryDate').should('contain', '2 January 2025')
      cy.getText('sentenceSequenceExpiryDate').should('contain', '15 November 3022')

      cy.getText('1-termType').should('contain', 'Custodial term')
      cy.getText('1-term').should('contain', '4 years')
      cy.getText('2-termType').should('contain', 'Extended term')
      cy.getText('2-term').should('contain', '2 years')

      cy.contains('No more information was provided in the minute').should('exist')
    })

    it('single term', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.DETERMINATE },
          nomisIndexOffence: {
            allOptions: [
              {
                sentenceTypeDescription: 'sentence type description',
                offenceDescription: 'offence description',
                offenderChargeId: 3934369,
                offenceDate: '2023-11-17',
                sentenceDate: '2023-11-16',
                sentenceSequenceExpiryDate: '3022-11-15',
                releaseDate: '2025-01-01',
                licenceExpiryDate: '2025-01-02',
                releasingPrison: 'releasing prison',
                courtDescription: 'court description',
                terms: [
                  {
                    years: 4,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'IMP',
                  },
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')

      cy.getText('sentenceLength').should('contain', '4 years')
    })

    it('NOMIS sentence is part of single-sentence sequence (non-null sentenceEndDate)', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyType: 'custody type',
            indexOffence: 'index offence',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          nomisIndexOffence: {
            allOptions: [
              {
                sentenceTypeDescription: 'sentence type description',
                offenceDescription: 'offence description',
                offenderChargeId: 3934369,
                offenceDate: '2023-11-17',
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3021-11-15',
                sentenceSequenceExpiryDate: '3022-11-15',
                releaseDate: '2025-01-01',
                licenceExpiryDate: '2025-01-02',
                releasingPrison: 'releasing prison',
                courtDescription: 'court description',
                terms: [
                  {
                    years: 4,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'IMP',
                  },
                  {
                    years: 2,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'LIC',
                  },
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')

      cy.getText('sentenceEndDate').should('contain', '15 November 3021')
      cy.getElement('sentenceSequenceExpiryDate').should('not.exist')
    })

    it('NOMIS sentence is part of multi-sentence sequence (no sentenceEndDate)', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyType: 'custody type',
            indexOffence: 'index offence',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          nomisIndexOffence: {
            allOptions: [
              {
                sentenceTypeDescription: 'sentence type description',
                offenceDescription: 'offence description',
                offenderChargeId: 3934369,
                offenceDate: '2023-11-17',
                sentenceDate: '2023-11-16',
                sentenceSequenceExpiryDate: '3022-11-15',
                releaseDate: '2025-01-01',
                licenceExpiryDate: '2025-01-02',
                releasingPrison: 'releasing prison',
                courtDescription: 'court description',
                terms: [
                  {
                    years: 4,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'IMP',
                  },
                  {
                    years: 2,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'LIC',
                  },
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')

      cy.getElement('sentenceEndDate').should('not.exist')
      cy.getText('sentenceSequenceExpiryDate').should('contain', '15 November 3022')
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

      cy.visit(`/recommendations/252523937/sentence-to-commit`)

      // Documents section
      cy.contains('h2', 'Documents').should('exist')
      cy.get('.govuk-summary-list__value').should('contain', 'Part-A-X123456.doc')
      cy.get('.govuk-summary-list__value').should('contain', 'Licence-X123456.doc')

      // Minutes section
      cy.contains('h2', 'Minutes').should('exist')
      cy.contains('Background information:').should('exist')
      cy.contains('Extended sentence: No').should('exist')
      cy.contains('Risk of serious harm level: Very High').should('exist')
      cy.contains('In custody: Yes at HMP Prison').should('exist')
      cy.contains('Sentencing court: Winchester Crown Court').should('exist')
      cy.contains('More information:').should('exist')
      cy.contains('Cannot access OASys at the moment').should('exist')
    })
  })
})
