import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { testForErrorSummary } from '../../../componentTests/errors.tests'
import routeUrls from '../../../../server/routes/routeUrls'
import testRadioButtons from '../../../componentTests/radioButtons.tests'
import { RecallTypeSelectedValue } from '../../../../server/@types/make-recall-decision-api/models/RecallTypeSelectedValue'

describe('recall type extended', () => {
  const recommendation = RecommendationResponseGenerator.generate()
  const testPageUrl = `${routeUrls.recommendations}/${recommendation.id}/recall-type-extended`

  beforeEach(() => {
    cy.signIn()
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
  })

  describe('with FTR56 disabled', () => {
    it('should display correctly with no data', () => {
      cy.visit(testPageUrl)

      testRadioButtons(cy.get('.govuk-form-group'), {
        legend: { text: 'What do you recommend?' },
        options: [
          {
            input: {
              id: 'recallType',
              value: 'STANDARD',
            },
            label: { text: 'Standard recall' },
          },
          {
            input: {
              id: 'recallType-2',
              value: 'NO_RECALL',
            },
            label: { text: 'No recall' },
          },
        ],
      })

      cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
    })

    it('should show form validation errors', () => {
      cy.visit(testPageUrl)
      cy.get('button').click()

      testForErrorSummary([
        {
          href: 'recallType',
          message: 'Select whether you recommend a recall or not',
        },
      ])
    })

    it('should remember the selected recall type', () => {
      const recommendationWithRecallTypeSelected = RecommendationResponseGenerator.generate({
        recallType: {
          selected: {
            value: RecallTypeSelectedValue.value.STANDARD,
            details: null,
          },
        },
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithRecallTypeSelected })

      cy.visit(testPageUrl)

      cy.get('input[name="recallType"][value="STANDARD"]').should('be.checked')
    })
  })

  describe('with FTR56 flag enabled', () => {
    const testPageUrlFTR56 = `${testPageUrl}?flagFTR56Enabled=1`

    it('should display correctly with no data', () => {
      cy.visit(testPageUrlFTR56)

      cy.getElement('What do you recommend?')

      cy.getElement('What do you recommend?')
      cy.get('.moj-ticket-panel').within(() => {
        cy.get('h3').should(
          'contain.text',
          `${recommendation.personOnProbation.name} must be given a standard recall, if recalled`,
        )
        cy.get('p.govuk-body').should(
          'contain.text',
          'This is based on their sentence information. If this does not look right, you can go back to amend your answers.',
        )
      })

      testRadioButtons(cy.get('.govuk-form-group'), {
        legend: { text: 'Select your recommendation' },
        options: [
          {
            input: {
              id: 'recallType',
              value: 'STANDARD',
            },
            label: { text: 'Standard recall' },
          },
          {
            input: {
              id: 'recallType-2',
              value: 'NO_RECALL',
            },
            label: { text: 'No recall - send a decision not to recall letter' },
          },
        ],
      })
    })

    it('should show form validation errors', () => {
      cy.visit(testPageUrlFTR56)
      cy.get('button').click()

      testForErrorSummary([
        {
          href: 'recallType',
          message: 'Select a recall recommendation',
        },
      ])
    })

    it('should remember the selected recall type', () => {
      const recommendationWithRecallTypeSelected = RecommendationResponseGenerator.generate({
        recallType: {
          selected: {
            value: RecallTypeSelectedValue.value.STANDARD,
            details: null,
          },
        },
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithRecallTypeSelected })

      cy.visit(testPageUrlFTR56)

      cy.get('input[name="recallType"][value="STANDARD"]').should('be.checked')
    })
  })
})
