import { routeUrls } from '../../server/routes/routeUrls'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../support/commands'

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
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type`)
    cy.selectRadio('Select your recommendation', 'No recall')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('recall type - directs "no recall" to the no recall task list, even if coming from recall task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(
      `${routeUrls.recommendations}/${recommendationId}/recall-type?fromPageId=task-list&fromAnchor=heading-recommendation`
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
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'NO_RECALL_DECIDED', active: true }] })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('indeterminate recall type - directs "no recall" to the no recall task list even if coming from task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(
      `${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate?fromPageId=task-list&fromAnchor=heading-recommendation`
    )
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'NO_RECALL_DECIDED', active: true }] })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('indeterminate sentence - if extended sentence is selected, task list', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: false },
    })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-extended`)
    cy.selectRadio('Is Jane Bloggs on an extended sentence?', 'Yes')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Consider a recall')
  })

  it('victim contact scheme - directs "no" to the task list page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`)
    cy.selectRadio('Are there any victims in the victim contact scheme?', 'No')
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'RECALL_DECIDED', active: true }] })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a Part A form')
  })

  it('AP-created recommendation - PO directed taken through FTR preconditions page before recall type one', () => {
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: undefined } })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'AP_RECORDED_RATIONALE', active: true }] })

    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.clickLink('Update recommendation')

    cy.pageHeading().should('contain', 'Is Jane Bloggs on an indeterminate sentence?')
    cy.selectRadio('Is Jane Bloggs on an indeterminate sentence?', 'No')
    cy.clickButton('Continue')

    cy.pageHeading().should('contain', 'Is Jane Bloggs on an extended sentence?')
    cy.selectRadio('Is Jane Bloggs on an extended sentence?', 'No')
    cy.clickButton('Continue')

    cy.pageHeading().should('contain', 'Suitability for standard or fixed term recall')
  })
})
