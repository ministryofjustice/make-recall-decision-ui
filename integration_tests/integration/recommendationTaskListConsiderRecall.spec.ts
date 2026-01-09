import { sharedPaths } from '../../server/routes/paths/shared.paths'
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
      name: 'Jane Bloggs',
    },
  }

  it('task list - To do ', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${sharedPaths.recommendations}/${recommendationId}/task-list-consider-recall`)
    cy.getElement('What has made you consider recalling Jane Bloggs? To do').should('exist')
    cy.getElement('How has Jane Bloggs responded to probation so far? To do').should('exist')
    cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
    cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
    cy.getElement('Is Jane Bloggs on an indeterminate sentence? To do').should('exist')
    cy.getElement('Is Jane Bloggs on an extended sentence? To do').should('exist')
  })

  it('task list - Complete ', () => {
    cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${sharedPaths.recommendations}/${recommendationId}/task-list-consider-recall`)
    cy.getElement('What has made you consider recalling Jane Bloggs? Completed').should('exist')
    cy.getElement('How has Jane Bloggs responded to probation so far? Completed').should('exist')
    cy.getElement('What licence conditions has Jane Bloggs breached? Completed').should('exist')
    cy.getElement('What alternatives to recall have been tried already? Completed').should('exist')
    cy.getElement('Is Jane Bloggs on an indeterminate sentence? Completed').should('exist')
    cy.getElement('Is Jane Bloggs on an extended sentence? Completed').should('exist')

    cy.getElement('Continue').should('exist')
  })
})
