import { faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import { CUSTODY_GROUP } from '../../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RECOMMENDATION_STATUS } from '../../../../../../server/middleware/recommendationStatus'
import { determinateCustodyTypes } from '../../../../../../server/helpers/ppudSentence/custodyTypes'
import { determinateCustodyTypeLabels } from '../../../../../../server/controllers/recommendations/custody-type/formOptions'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../../componentTests/errors.tests'
import { setUpSessionForPpcs } from '../../util'

context('Determinate sentence - edit custody type page', () => {
  const recommendationId = '123'
  const testPageUrl = `/recommendations/${recommendationId}/custody-type`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  const randomRadioOption = faker.number.int({ min: 0, max: determinateCustodyTypes.length - 1 })
  const ppudReferenceListResponse = { values: determinateCustodyTypes }
  const defaultRecommendationResponse = RecommendationResponseGenerator.generate({
    bookRecallToPpud: {
      custodyGroup: CUSTODY_GROUP.DETERMINATE,
    },
  })
  const updatedRecommendationResponse = RecommendationResponseGenerator.generate({
    bookRecallToPpud: {
      custodyGroup: CUSTODY_GROUP.DETERMINATE,
      custodyType: determinateCustodyTypes[randomRadioOption],
    },
  })
  const popName = defaultRecommendationResponse.personOnProbation.name
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  beforeEach(() => {
    cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
    cy.task('getReferenceList', {
      name: 'determinate-custody-types',
      statusCode: 200,
      response: ppudReferenceListResponse,
    })
  })

  describe('Page Data', () => {
    describe('initial page load', () => {
      it('Loads the correct page data with empty inputs', () => {
        cy.visit(testPageUrl)

        // Heading
        cy.pageHeading().should('contain', `Which custody type is ${popName} subject to?`)

        // Radios
        determinateCustodyTypes.forEach((val, i) => {
          cy.get('.govuk-radios__item label')
            .eq(i)
            .should('contain.text', determinateCustodyTypeLabels[val] ?? val)
        })

        // Continue Button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })
    })

    describe('page load after custody type has been selected', () => {
      it('Loads the correct page data with the correct input selected', () => {
        cy.task('getRecommendation', { statusCode: 200, response: updatedRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })

        cy.visit(testPageUrl)

        // Checked radio
        cy.get('.govuk-radios__item').eq(randomRadioOption).get('input').should('be.checked')
      })
    })
  })

  describe('Error message display', () => {
    it("shows an error when an option hasn't been selected", () => {
      cy.visit(testPageUrl)
      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([{ href: 'custodyType', message: 'Enter custody type' }])
    })
  })
})
