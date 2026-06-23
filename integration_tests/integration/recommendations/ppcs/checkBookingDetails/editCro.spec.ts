import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../../server/middleware/recommendationStatus'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../componentTests/errors.tests'
import setUpSessionForPpcs from '../util'

context('Edit CRO page', () => {
  const recommendationResponse = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${recommendationResponse.id}/edit-cro`
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  describe('Page Data', () => {
    it('pre-populates CRO input from bookRecallToPpud cro', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          bookRecallToPpud: { cro: '999/99A' },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })

      cy.visit(testPageUrl)

      cy.get('#cro').should('have.value', '999/99A')
    })

    it('defaults CRO input to empty when bookRecallToPpud cro is empty', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          bookRecallToPpud: { cro: null },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })

      cy.visit(testPageUrl)

      cy.get('#cro').should('have.value', '')
    })

    it('shows "From Part A" section when partACro exists', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          personOnProbation: { ...recommendationResponse.personOnProbation, croNumber: null },
          prisonOffender: { cro: '789/01A' },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })

      cy.visit(testPageUrl)

      cy.get('.car-text-list').first().find('h2').should('contain', 'From Part A')
      cy.get('.car-text-list').first().find('.car-text-list__row').should('contain', 'CRO').should('contain', '789/01A')
    })

    it('shows "There is a PPUD record but this field is blank." when ppudOffender exists but croOtherNumber is empty', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          personOnProbation: { ...recommendationResponse.personOnProbation, croNumber: null },
          prisonOffender: { cro: null },
          ppudOffender: { croOtherNumber: null },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })

      cy.visit(testPageUrl)

      cy.get('.govuk-heading-m').should('contain', 'From PPUD')
      cy.get('.govuk-heading-m')
        .next('.govuk-body')
        .should('contain', 'There is a PPUD record but this field is blank.')
    })

    it('shows PPUD CRO value when ppudOffender croOtherNumber has a value', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          personOnProbation: { ...recommendationResponse.personOnProbation, croNumber: null },
          prisonOffender: { cro: null },
          ppudOffender: { croOtherNumber: '456/02B' },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })

      cy.visit(testPageUrl)

      cy.get('.car-text-list').first().find('h2').should('contain', 'From PPUD')
      cy.get('.car-text-list').first().find('.car-text-list__row').should('contain', 'CRO').should('contain', '456/02B')
    })
  })

  describe('Error messages', () => {
    it('shows error when CRO is empty', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          bookRecallToPpud: { cro: null },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })

      cy.visit(testPageUrl)

      cy.get('button.govuk-button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'cro',
          message: 'Enter the CRO',
        },
      ])
    })
  })
})
