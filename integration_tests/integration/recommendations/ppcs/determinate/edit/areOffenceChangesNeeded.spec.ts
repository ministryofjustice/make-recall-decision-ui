import { fakerEN_GB as faker } from '@faker-js/faker'
import { routes } from '../../../../../../api/routes'
import { ppcsPaths } from '../../../../../../server/routes/paths/ppcs'
import { setUpSessionForPpcs } from '../../util'
import {
  booleanToYesNoOffenceChanges,
  yesNoOffenceChanges,
} from '../../../../../../server/controllers/recommendation/ppcs/determinateSentence/areOffenceChangesNeeded/yesNoOffenceChanges'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import { RECOMMENDATION_STATUS } from '../../../../../../server/middleware/recommendationStatus'
import { formatDateTimeFromIsoString } from '../../../../../../server/utils/dates/formatting'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../../componentTests/errors.tests'
import { PpudSentence } from '../../../../../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { CUSTODY_GROUP } from '../../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'

context('Determinate Sentence - Are Offence Changes Needed Page', () => {
  const recommendationId = '123'

  const testPageUrl = `${routes.recommendations}/${recommendationId}/${ppcsPaths.areOffenceChangesNeeded}`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]
  describe('Page Data', () => {
    describe('initial page load', () => {
      describe('with no option pre-selected', () => {
        const recommendationWithNoOptionSelected = RecommendationResponseGenerator.generate({
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            changeOffenceOrAddComment: 'none',
          },
        })
        const selectedPpudSentence = faker.helpers.arrayElement(
          recommendationWithNoOptionSelected.ppudOffender.sentences
        )
        recommendationWithNoOptionSelected.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id

        beforeEach(() => {
          cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNoOptionSelected })
          cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        })
        it('Loads the correct page data', () => {
          testPageContent(recommendationId, selectedPpudSentence)
        })
      })

      describe('with an option pre-selected', () => {
        const recommendationWithOptionSelected = RecommendationResponseGenerator.generate({
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        })
        const selectedPpudSentence = faker.helpers.arrayElement(recommendationWithOptionSelected.ppudOffender.sentences)
        recommendationWithOptionSelected.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id
        const selectedOption = booleanToYesNoOffenceChanges(
          recommendationWithOptionSelected.bookRecallToPpud.changeOffenceOrAddComment
        )

        beforeEach(() => {
          cy.task('getRecommendation', { statusCode: 200, response: recommendationWithOptionSelected })
          cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        })
        it('Loads the correct page data', () => {
          testPageContent(recommendationId, selectedPpudSentence, selectedOption)
        })
      })
    })
  })

  describe('Error message display', () => {
    const recommendationWithNoOptionSelected = RecommendationResponseGenerator.generate({
      bookRecallToPpud: {
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
        changeOffenceOrAddComment: 'none',
      },
    })
    beforeEach(() => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNoOptionSelected })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
    })
    it("shows an error when an option hasn't been selected", () => {
      cy.visit(testPageUrl)
      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([{ href: 'changeOffenceOrAddComment', message: 'Select an option' }])
    })
  })
})

// Helper functions

/**
 *
 * Test that all the page content is displayed as expected
 *
 * @param recommendationId - The ID of the recommendation
 * @param selectedPpudSentence - The selected PPUD sentence
 * @param selectedOption - The selected option value (if any)
 */
function testPageContent(recommendationId: string, selectedPpudSentence: PpudSentence, selectedOption?: string) {
  const testPageUrl = `${routes.recommendations}/${recommendationId}/${ppcsPaths.areOffenceChangesNeeded}`
  cy.visit(testPageUrl)

  // Heading
  cy.pageHeading().should('contain', `Do you need to change the index offence or add a comment?`)

  cy.get('.govuk-inset-text')
    .should('have.class', 'guidance-panel')
    .should('contain.text', 'You selected this offence from PPUD:')
    .should('contain.text', selectedPpudSentence.offence.indexOffence)
    .should('contain.text', 'Additional comments')
    .should('contain.text', selectedPpudSentence.offence.indexOffenceComment ?? 'None')
    .should('contain.text', 'Date of sentence')
    .should(
      'contain.text',
      formatDateTimeFromIsoString({
        isoDate: selectedPpudSentence.dateOfSentence,
        dateOnly: true,
      })
    )
    .should('contain.text', 'Sentence expiry date')
    .should(
      'contain.text',
      formatDateTimeFromIsoString({
        isoDate: selectedPpudSentence.sentenceExpiryDate,
        dateOnly: true,
      })
    )

  // Radios
  yesNoOffenceChanges.forEach((radioOption, i) => {
    cy.get('.govuk-radios__item label')
      .eq(i)
      .should('contain.text', yesNoOffenceChanges[i]?.text ?? radioOption.text)
    cy.get('.govuk-radios__input').eq(i).should('have.value', radioOption.value)
  })

  if (selectedOption) {
    cy.get(`.govuk-radios__input[value="${selectedOption}"]`).should('be.checked')
  }

  // Continue Button
  cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
}
