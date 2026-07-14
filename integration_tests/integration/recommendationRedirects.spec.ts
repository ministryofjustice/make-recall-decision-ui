import { sharedPaths } from '../../server/routes/paths/shared.paths'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import setResponsePropertiesToNull from '../support/commands'
import { SentenceGroup } from '../../server/controllers/recommendations/sentenceInformation/formOptions'

context('Make a recommendation - Branching / redirects', () => {
  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    ...setResponsePropertiesToNull(completeRecommendationResponse),
    id: recommendationId,
    crn,
    personOnProbation: {
      name: 'Jane Bloggs',
    },
    sentenceGroup: SentenceGroup.YOUTH_SDS,
    recallType: { selected: { value: 'STANDARD' } },
    managerRecallDecision: {
      isSentToDelius: true,
    },
  }

  beforeEach(() => {
    cy.signIn()
  })

  it('recall type - directs "no recall" to the no recall task list', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.task('updateStatuses', { statusCode: 200, response: [{ name: 'NO_RECALL_DECIDED', active: true }] })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${sharedPaths.recommendations}/${recommendationId}/recall-type`)
    cy.selectRadio('Select your recommendation', 'No recall')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('recall type - directs "no recall" to the no recall task list, even if coming from recall task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(
      `${sharedPaths.recommendations}/${recommendationId}/recall-type?fromPageId=task-list&fromAnchor=heading-recommendation`,
    )
    cy.selectRadio('Select your recommendation', 'No recall')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'NO_RECALL_DECIDED', active: true }] })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('indeterminate recall type - directs "no recall" to the no recall task list', () => {
    const recommendation = {
      ...recommendationResponse,
      sentenceGroup: SentenceGroup.INDETERMINATE,
    }
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendation })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${sharedPaths.recommendations}/${recommendationId}/recall-type-indeterminate`)
    cy.selectRadio('Select your recommendation', 'No recall - create a decision not to recall letter')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendation, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'NO_RECALL_DECIDED', active: true }] })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('indeterminate recall type - directs "no recall" to the no recall task list even if coming from task list', () => {
    const recommendation = {
      ...recommendationResponse,
      sentenceGroup: SentenceGroup.INDETERMINATE,
    }
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendation })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(
      `${sharedPaths.recommendations}/${recommendationId}/recall-type-indeterminate?fromPageId=task-list&fromAnchor=heading-recommendation`,
    )
    cy.selectRadio('Select your recommendation', 'No recall - create a decision not to recall letter')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendation, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'NO_RECALL_DECIDED', active: true }] })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('victim contact scheme - directs "no" to the task list page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${sharedPaths.recommendations}/${recommendationId}/victim-contact-scheme`)
    cy.selectRadio('Are there any victims in the victim contact scheme?', 'No')
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'RECALL_DECIDED', active: true }] })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', `Part A for ${recommendationResponse.personOnProbation.name}`)
  })
})
