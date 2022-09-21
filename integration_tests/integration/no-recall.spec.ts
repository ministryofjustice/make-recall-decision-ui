import { routeUrls } from '../../server/routes/routeUrls'
import noRecallResponse from '../../api/responses/get-recommendation-no-recall.json'
import { setResponsePropertiesToNull } from '../support/commands'

context('No recall', () => {
  beforeEach(() => {
    cy.signIn()
  })

  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    ...setResponsePropertiesToNull(noRecallResponse),
    recallType: { selected: { value: 'NO_RECALL' } },
    id: recommendationId,
    crn,
    personOnProbation: {
      name: 'Paula Smith',
    },
  }

  describe('Form validation', () => {
    it('form validation - why you considered recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/why-considered-recall`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'whyConsideredRecall',
        errorText: 'Select a reason why you considered recall',
      })
    })
  })

  describe('Task list', () => {
    it('To do', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('What you recommend completed').should('exist')
      cy.getElement('Alternatives tried already to do').should('exist')
      cy.getElement('Response to probation so far to do').should('exist')
      cy.getElement('Breached licence condition(s) to do').should('exist')
      cy.getElement('Is Paula Smith on an indeterminate sentence? to do').should('exist')
      cy.getElement('Is Paula Smith on an extended sentence? to do').should('exist')
      cy.getElement('Type of indeterminate sentence to do').should('not.exist')
    })

    it('Completed', () => {
      cy.task('getRecommendation', { statusCode: 200, response: noRecallResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`)
      cy.getElement('What you recommend completed').should('exist')
      cy.getElement('Alternatives tried already completed').should('exist')
      cy.getElement('Response to probation so far completed').should('exist')
      cy.getElement('Breached licence condition(s) completed').should('exist')
      cy.getElement('Is Paula Smith on an indeterminate sentence? completed').should('exist')
      cy.getElement('Is Paula Smith on an extended sentence? completed').should('exist')
      cy.getElement('Type of indeterminate sentence completed').should('exist')
      cy.clickLink('Create Part A')
    })
  })
})
