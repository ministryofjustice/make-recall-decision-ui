import completeRecommendationResponse from '../../../../api/responses/get-recommendation.json'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import setUpSessionForPpcs from './util'

context('Sentence to commit existing offender', () => {
  beforeEach(() => {
    setUpSessionForPpcs()
  })

  describe('Sentence to commit existing offender', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getSupportingDocuments', { statusCode: 200, response: [] })
    })

    it('NOMIS sentence is part of single-sentence sequence (non-null sentenceEndDate)', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          ppudOffender: {
            sentences: [
              {
                id: '1',
                dateOfSentence: '2003-06-12',
                custodyType: 'Determinate',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
                releases: [
                  { dateOfRelease: '2013-02-02' },
                  { dateOfRelease: '2015-02-09' },
                  { dateOfRelease: '2005-02-02' },
                ],
              },
            ],
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            ppudSentenceId: '1',
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
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit-existing-offender`)
      cy.pageHeading().should('contain', 'Double check your booking')
      cy.getText('sentenceEndDate').should('contain', '15 November 3021')
      cy.getElement('sentenceSequenceExpiryDate').should('not.exist')
    })

    it('NOMIS sentence is part of multi-sentence sequence (no sentenceEndDate)', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          ppudOffender: {
            sentences: [
              {
                id: '1',
                dateOfSentence: '2003-06-12',
                custodyType: 'Determinate',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
                releases: [
                  { dateOfRelease: '2013-02-02' },
                  { dateOfRelease: '2015-02-09' },
                  { dateOfRelease: '2005-02-02' },
                ],
              },
            ],
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            ppudSentenceId: '1',
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
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit-existing-offender`)
      cy.pageHeading().should('contain', 'Double check your booking')
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
