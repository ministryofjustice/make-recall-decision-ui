import { CUSTODY_GROUP } from '../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RECOMMENDATION_STATUS } from '../../../../../server/middleware/recommendationStatus'
import completeRecommendationResponse from '../../../../../api/responses/get-recommendation.json'
import { testSummaryList } from '../../../../componentTests/summaryList.tests'

context('Determinate Ppud Sentences', () => {
  describe('Standard page load', () => {
    beforeEach(() => {
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    })

    it('should load the page as expected', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          isIndeterminateSentence: true,
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          ppudOffender: {
            id: '1',
            sentences: [
              {
                id: '1', // non determinate sentences
                dateOfSentence: '2003-06-12',
                custodyType: 'Mandatory (MLP)',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentencingCourt: 'London',
                sentenceExpiryDate: '1969-03-02',
                sentenceLength: {
                  partDays: 3,
                  partYears: 1,
                  partMonths: 2,
                },
              },
              {
                id: '2', // determinate sentences
                dateOfSentence: '2004-06-12',
                custodyType: 'Determinate',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentencingCourt: 'Glasgow',
                sentenceExpiryDate: '2007-03-02',
                sentenceLength: {
                  partDays: 3,
                  partYears: 1,
                  partMonths: 2,
                },
              },
              {
                id: '3', // determinate sentences
                dateOfSentence: '2004-06-13',
                custodyType: 'EDS', // determinate sentences
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'another offence',
                  dateOfIndexOffence: null,
                },
                sentencingCourt: 'Clydesdale',
                sentenceExpiryDate: '2007-03-02',
                sentenceLength: {
                  partDays: 3,
                  partYears: 1,
                  partMonths: 2,
                },
              },
            ],
          },
          convictionDetail: {
            indexOffenceDescription: 'Burglary',
            sentenceExpiryDate: '2024-05-10',
            dateOfSentence: '2022-03-11',
          },
        },
      })
      const recommendationId = '1'

      const testPageUrl = `/recommendations/${recommendationId}/determinate-ppud-sentences`

      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(testPageUrl)
      cy.pageHeading().should('equals', 'Determinate sentences in PPUD')
      cy.get('p.govuk-body').should(
        'contain.text',
        'Jane Bloggs has indeterminate and determinate sentences in PPUD. View the determinate sentences and then return to the indeterminate sentences to continue your booking.'
      )

      // verify court case header and date of sentence for Court case: Glasgow
      cy.get('h3[class="govuk-heading-m govuk-!-margin-bottom-2"]')
        .filter(':contains("Court case: Glasgow")')
        .should('have.length', 1)
      cy.get('p[class="govuk-body govuk-!-margin-bottom-0"]').should('contain.text', 'Date of sentence: 12 June 2004')

      // verify court case header and date of sentence for Court case: Clydesdale
      cy.get('h3[class="govuk-heading-m govuk-!-margin-bottom-2"]')
        .filter(':contains("Court case: Clydesdale")')
        .should('have.length', 1)
      cy.get('p[class="govuk-body govuk-!-margin-bottom-0"]').should('contain.text', 'Date of sentence: 13 June 2004')

      // verify summary list rows for each court case and sentence date
      // Glasgow court sentence
      cy.get('#determinate-ppud-sentences-12-June-2004-sentence-1').then($summaryList => {
        testSummaryList(cy.wrap($summaryList), {
          rows: [
            { key: 'Sentence expiry date', value: '2 March 2007' },
            { key: 'Sentence length', value: '1 year 2 months 3 days' },
          ],
        })
      })

      // Clydesdale court sentence
      cy.get('#determinate-ppud-sentences-13-June-2004-sentence-1').then($summaryList => {
        testSummaryList(cy.wrap($summaryList), {
          rows: [
            { key: 'Sentence expiry date', value: '2 March 2007' },
            { key: 'Sentence length', value: '1 year 2 months 3 days' },
          ],
        })
      })

      // should display the 'Return to indeterminate sentences' link
      cy.get('a.govuk-button.govuk-button--secondary')
        .should('have.text', 'Return to indeterminate sentences')
        .and('have.attr', 'href', `/recommendations/${recommendationId}/select-indeterminate-ppud-sentence`)
    })

    it('should group multiple sentences under the same court', () => {
      const courtName = 'Glasgow'
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          isIndeterminateSentence: true,
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          ppudOffender: {
            id: '1',
            sentences: [
              {
                id: '1',
                dateOfSentence: '2004-06-12',
                custodyType: 'Determinate',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentencingCourt: courtName,
                sentenceExpiryDate: '1969-03-02',
                sentenceLength: {
                  partDays: 3,
                  partYears: 1,
                  partMonths: 2,
                },
              },
              {
                id: '2',
                dateOfSentence: '2004-06-13',
                custodyType: 'EDS',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'another offence',
                  dateOfIndexOffence: null,
                },
                sentencingCourt: courtName,
                sentenceExpiryDate: '1969-03-02',
                sentenceLength: {
                  partDays: 3,
                  partYears: 1,
                  partMonths: 2,
                },
              },
            ],
          },
          convictionDetail: {
            indexOffenceDescription: 'Burglary',
            sentenceExpiryDate: '2024-05-10',
            dateOfSentence: '2022-03-11',
          },
        },
      })
      const recommendationId = '1'

      const testPageUrl = `/recommendations/${recommendationId}/determinate-ppud-sentences`

      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(testPageUrl)
      cy.pageHeading().should('equals', 'Determinate sentences in PPUD')

      // should group sentences are same court
      cy.get('h3[class="govuk-heading-m govuk-!-margin-bottom-2"]')
        .filter(`:contains('Court case: ${courtName}')`)
        .should('have.length', 1)
    })

    it('should group multiple sentences under the same date of sentence under same court', () => {
      const courtName = 'Glasgow'
      const dateOfSentence = '2004-06-12'
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          isIndeterminateSentence: true,
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          ppudOffender: {
            id: '1',
            sentences: [
              {
                id: '1',
                dateOfSentence,
                custodyType: 'Determinate',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentencingCourt: courtName,
                sentenceExpiryDate: '1969-03-02',
                sentenceLength: {
                  partDays: 3,
                  partYears: 1,
                  partMonths: 2,
                },
              },
              {
                id: '2',
                dateOfSentence,
                custodyType: 'EDS',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'another offence',
                  dateOfIndexOffence: null,
                },
                sentencingCourt: courtName,
                sentenceExpiryDate: '1969-03-02',
                sentenceLength: {
                  partDays: 3,
                  partYears: 1,
                  partMonths: 2,
                },
              },
            ],
          },
          convictionDetail: {
            indexOffenceDescription: 'Burglary',
            sentenceExpiryDate: '2024-05-10',
            dateOfSentence: '2022-03-11',
          },
        },
      })
      const recommendationId = '1'

      const testPageUrl = `/recommendations/${recommendationId}/determinate-ppud-sentences`

      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(testPageUrl)
      cy.pageHeading().should('equals', 'Determinate sentences in PPUD')

      // should group sentences by same court
      cy.get('h3[class="govuk-heading-m govuk-!-margin-bottom-2"]')
        .filter(`:contains('Court case: ${courtName}')`)
        .should('have.length', 1)

      // should group sentences by same date of sentence
      cy.get('p[class="govuk-body govuk-!-margin-bottom-0"]')
        .should('have.text', 'Date of sentence: 12 June 2004')
        .should('have.length', 1)
    })
  })
})
