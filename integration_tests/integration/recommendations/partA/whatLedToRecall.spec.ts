import { testForErrorSummary } from '../../../componentTests/errors.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'

context('What led to recall screen', () => {
  const recommendation = RecommendationResponseGenerator.generate()

  describe('get', () => {
    beforeEach(() => {
      cy.signIn()
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
    })

    it('should load the page correctly', () => {
      cy.visit('/recommendations/123/what-led?flagFTR56Enabled=1')

      cy.getElement('What has led to this recall?').should('exist')
      cy.getElement('Explain why you think the risk cannot be managed in the community.').should('exist')
      cy.getElement('Give details about:').should('exist')

      cy.get('.govuk-list').within(() => {
        cy.get('li').eq(0).should('contain.text', 'the circumstances or behaviours that have led to the recall')
        cy.get('li').eq(1).should('contain.text', 'any alleged further offending')
        cy.get('li').eq(2).should('contain.text', 'police investigations or charges')
        cy.get('li').eq(3).should('contain.text', 'any other relevant information')
      })

      cy.get('.govuk-textarea').should('exist').should('contain.text', recommendation.whatLedToRecall)
      cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')

      cy.get('.govuk-caption-m').should('contain.text', 'Previous related question')

      cy.getElement(`What has made you consider recalling ${recommendation.personOnProbation.name}?`)

      cy.get('.mid-grey-panel')
        .should('exist')
        .within(() => {
          cy.get('span').should('contain.text', 'Your answer')

          cy.get('pre.govuk-body').should('contain.text', recommendation.triggerLeadingToRecall)

          cy.get('button').should('contain.text', 'Copy this text')
        })
    })
  })

  describe('post', () => {
    beforeEach(() => {
      cy.signIn()
      cy.task('getRecommendation', { statusCode: 200, response: { ...recommendation, whatLedToRecall: null } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
    })

    it('should show a validation error when textarea is blank', () => {
      cy.visit('/recommendations/123/what-led?flagFTR56Enabled=1')
      cy.clickButton('Continue')

      testForErrorSummary([
        {
          href: 'whatLedToRecall',
          message: 'Enter details of what has led to this recall',
        },
      ])

      cy.get('.govuk-error-message').should('contain.text', 'Enter details of what has led to this recall')
    })
  })
})
