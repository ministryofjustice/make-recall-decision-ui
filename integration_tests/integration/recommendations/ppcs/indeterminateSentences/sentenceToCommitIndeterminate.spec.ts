import { fakerEN_GB as faker } from '@faker-js/faker'
import { routes } from '../../../../../api/routes'
import { ppcsPaths } from '../../../../../server/routes/paths/ppcs'
import { setUpSessionForPpcs } from '../util'
import { RECOMMENDATION_STATUS } from '../../../../../server/middleware/recommendationStatus'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import { CUSTODY_GROUP } from '../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { testSummaryList } from '../../../../componentTests/summaryList.tests'
import { indeterminateCustodyTypes } from '../../../../../server/helpers/ppudSentence/custodyTypes'
import { formatPpudSentenceLength } from '../../../../../server/utils/dates/ppudSentenceLength/formatting'
import { formatDateTimeFromIsoString } from '../../../../../server/utils/dates/formatting'

context('Indeterminate Sentence - Sentence to Commit Page', () => {
  const recommendationId = '123'

  const testPageUrl = `${routes.recommendations}/${recommendationId}/${ppcsPaths.sentenceToCommitIndeterminate}`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]
  describe('Page Data', () => {
    describe('initial page load', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.INDETERMINATE,
        },
        ppudOffender: {
          sentences: faker.helpers
            .multiple(() => faker.helpers.arrayElement(indeterminateCustodyTypes))
            .map(indeterminateCustodyType => {
              return { custodyType: indeterminateCustodyType }
            }),
        },
      })
      const selectedPpudSentence = faker.helpers.arrayElement(recommendation.ppudOffender.sentences)
      recommendation.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id
      const ppudIndeterminateData = recommendation.bookRecallToPpud.ppudIndeterminateSentenceData

      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })
      it('Loads the correct page data', () => {
        cy.visit(testPageUrl)

        // Page Headings and body content
        cy.pageHeading().should('contain', `Your recall booking for ${recommendation.personOnProbation.name}`)
        cy.get('.govuk-body').should(
          'contain.text',
          "This is the sentence you've selected from PPUD. You can edit anything that's wrong. This will update what's in PPUD."
        )

        cy.get('h2').should('have.class', 'govuk-heading-m').should('contain.text', 'Your recall booking')

        cy.get('#indeterminate-sentence-to-commit').as('summaryList')
        cy.get('@summaryList').then($summaryList => {
          testSummaryList(cy.wrap($summaryList), {
            rows: [
              { key: 'Custody type', value: selectedPpudSentence.custodyType },
              {
                key: 'Offence',
                value: ppudIndeterminateData.offenceDescription,
                editLink: {
                  url: ppcsPaths.indeterminateEdit.offenceDescription,
                  accessibleLabel: 'offence',
                },
              },
              {
                key: 'Release date',
                value: formatDateTimeFromIsoString({ isoDate: ppudIndeterminateData.releaseDate }),
                editLink: {
                  url: ppcsPaths.indeterminateEdit.releaseDate,
                  accessibleLabel: 'release date',
                },
              },
              {
                key: 'Sentencing court',
                value: ppudIndeterminateData.sentencingCourt,
                editLink: {
                  url: ppcsPaths.indeterminateEdit.sentencingCourt,
                  accessibleLabel: 'sentencing court',
                },
              },
              {
                key: 'Date of sentence',
                value: formatDateTimeFromIsoString({ isoDate: ppudIndeterminateData.dateOfSentence }),
                editLink: {
                  url: ppcsPaths.indeterminateEdit.dateOfSentence,
                  accessibleLabel: 'date of sentence',
                },
              },
              {
                key: 'Tariff expiry date',
                value: formatDateTimeFromIsoString({ isoDate: selectedPpudSentence.tariffExpiryDate }),
              },
              { key: 'Full punishment', value: formatPpudSentenceLength(selectedPpudSentence.sentenceLength) },
            ],
          })
        })
        // We check the offence row separately because the testSummaryList function doesn't
        // match on regex, which we need to do to verify both the offence and comment are shown
        const offenceAndCommentRegex = new RegExp(
          `\\s+${ppudIndeterminateData.offenceDescription}\\s+${ppudIndeterminateData.offenceDescriptionComment}\\s+`
        )
        cy.get('@summaryList')
          .find('div.govuk-summary-list__row')
          .eq(1)
          .within(() => {
            cy.get('dd').eq(0).invoke('text').should('match', offenceAndCommentRegex)
          })

        // Continue button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })
    })
  })
})
