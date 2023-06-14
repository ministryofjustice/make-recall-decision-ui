import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../support/commands'

context('Recommendation - task list consider recall', () => {
  beforeEach(() => {
    cy.signIn()
  })

  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    ...setResponsePropertiesToNull(completeRecommendationResponse),
    id: recommendationId,
    crn,
    personOnProbation: {
      name: 'Paula Smith',
    },
  }

  it('task list - To do ', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-consider-recall`)
    cy.getElement('What has made you think about recalling Paula Smith? To do').should('exist')
    cy.getElement('How has Paula Smith responded to probation so far? To do').should('exist')
    cy.getElement('What licence conditions has Paula Smith breached? To do').should('exist')
    cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
    cy.getElement('Is Paula Smith on an indeterminate sentence? To do').should('exist')
    cy.getElement('Is Paula Smith on an extended sentence? To do').should('exist')
  })

  it('task list - Complete ', () => {
    cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-consider-recall`)
    cy.getElement('What has made you think about recalling Paula Smith? Completed').should('exist')
    cy.getElement('How has Paula Smith responded to probation so far? Completed').should('exist')
    cy.getElement('What licence conditions has Paula Smith breached? Completed').should('exist')
    cy.getElement('What alternatives to recall have been tried already? Completed').should('exist')
    cy.getElement('Is Paula Smith on an indeterminate sentence? Completed').should('exist')
    cy.getElement('Is Paula Smith on an extended sentence? Completed').should('exist')

    cy.getElement('Continue').should('exist')
  })
})
