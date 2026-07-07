import testRadioButtons from '../../../componentTests/radioButtons.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import { IsRecalledOnNewChargedOrConvictedOffence } from '../../../../server/controllers/recommendations/chargedWithOffence/formOptions'

context('Charged with new offence', () => {
  const mockRecommendation = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${mockRecommendation.id}/charged-with-offence`

  beforeEach(() => {
    cy.task('getRecommendation', { statusCode: 200, response: mockRecommendation })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  describe('Page data', () => {
    it('Should load the page correctly', () => {
      cy.visit(testPageUrl)

      testRadioButtons(cy.get('.govuk-form-group'), {
        legend: {
          text: `Is the person being recalled because of being charged or convicted for an offence?`,
        },
        options: [
          {
            input: {
              id: 'isRecalledOnNewChargedOrConvictedOffence',
              name: '',
              value: IsRecalledOnNewChargedOrConvictedOffence.ONLY_CHARGED,
              checked: false,
            },
            label: {
              text: 'Yes, charged with a new offence but not convicted',
            },
          },
          {
            input: {
              id: 'isRecalledOnNewChargedOrConvictedOffence-2',
              name: '',
              value: IsRecalledOnNewChargedOrConvictedOffence.CHARGED_AND_CONVICTED,
              checked: false,
            },
            label: {
              text: 'Yes, charged and convicted of a new offence',
            },
          },
          {
            input: {
              id: 'isRecalledOnNewChargedOrConvictedOffence-3',
              name: '',
              value: IsRecalledOnNewChargedOrConvictedOffence.NO,
              checked: false,
            },
            label: {
              text: 'No',
            },
          },
        ],
      })

      cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
    })

    it('Should remember a previously selected option', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...mockRecommendation, isRecalledOnNewChargedOrConvictedOffence: 'NO' },
      })

      cy.visit(testPageUrl)

      testRadioButtons(cy.get('.govuk-form-group'), {
        legend: {
          text: `Is the person being recalled because of being charged or convicted for an offence?`,
        },
        options: [
          {
            input: {
              id: 'isRecalledOnNewChargedOrConvictedOffence',
              name: '',
              value: IsRecalledOnNewChargedOrConvictedOffence.ONLY_CHARGED,
              checked: false,
            },
            label: {
              text: 'Yes, charged with a new offence but not convicted',
            },
          },
          {
            input: {
              id: 'isRecalledOnNewChargedOrConvictedOffence-2',
              name: '',
              value: IsRecalledOnNewChargedOrConvictedOffence.CHARGED_AND_CONVICTED,
              checked: false,
            },
            label: {
              text: 'Yes, charged and convicted of a new offence',
            },
          },
          {
            input: {
              id: 'isRecalledOnNewChargedOrConvictedOffence-3',
              name: '',
              value: IsRecalledOnNewChargedOrConvictedOffence.NO,
              checked: true,
            },
            label: {
              text: 'No',
            },
          },
        ],
      })
    })
  })

  describe('error message display', () => {
    it('shows an error when no option is selected', () => {
      cy.visit(testPageUrl)

      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'isRecalledOnNewChargedOrConvictedOffence',
          message: `Select if ${mockRecommendation.personOnProbation.name} has been charged or convicted for an offence`,
          checkFieldHasErrorStyling: false,
        },
      ])
    })
  })
})
