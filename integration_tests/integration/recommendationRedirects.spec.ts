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
      name: 'Paula Smith',
      addresses: [
        {
          line1: '41 Newport Pagnell Rd',
          line2: 'Newtown',
          town: 'Northampton',
          postcode: 'NN4 6HP',
        },
      ],
    },
    recallType: { selected: { value: 'STANDARD' } },
  }

  beforeEach(() => {
    cy.signIn()
  })

  it('recall type - directs "no recall" to the no recall task list', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type`)
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('recall type - directs "no recall" to the no recall task list, even if coming from recall task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(
      `${routeUrls.recommendations}/${recommendationId}/recall-type?fromPageId=task-list&fromAnchor=heading-recommendation`
    )
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('indeterminate recall type - directs "no recall" to the no recall task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('indeterminate recall type - directs "no recall" to the no recall task list even if coming from task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(
      `${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate?fromPageId=task-list&fromAnchor=heading-recommendation`
    )
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
    })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a decision not to recall letter')
  })

  it('indeterminate recall type - links back to indeterminate sentence type if indeterminate sentence', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: true, isExtendedSentence: false },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
    cy.getLinkHref('Back').should('contain', '/indeterminate-type')
  })

  it('indeterminate recall type - links back to extended sentence if extended sentence', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: false, isExtendedSentence: true },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
    cy.getLinkHref('Back').should('contain', '/is-extended')
  })

  it('indeterminate sentence - if extended sentence is selected, redirect to indeterminate recommendation page', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: false },
    })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-extended`)
    cy.selectRadio('Is Paula Smith on an extended sentence?', 'Yes')
    cy.clickButton('Continue')
    cy.selectRadio('What do you recommend?', 'Emergency recall')
  })

  it('victim contact scheme - directs "no" to the task list page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`)
    cy.selectRadio('Are there any victims in the victim contact scheme?', 'No')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a Part A form')
  })

  it('sensitive info - links back to indeterminate/extended criteria if indeterminate sentence', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: true, isExtendedSentence: false },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
    cy.getLinkHref('Back').should('contain', '/indeterminate-details')
  })

  it('sensitive info - links back to indeterminate/extended criteria if extended sentence', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, isIndeterminateSentence: false, isExtendedSentence: true },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
    cy.getLinkHref('Back').should('contain', '/indeterminate-details')
  })

  it('sensitive info - links back to emergency recall if determinate sentence / standard recall', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        isIndeterminateSentence: false,
        isExtendedSentence: false,
        recallType: {
          selected: { value: 'STANDARD' },
        },
      },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
    cy.getLinkHref('Back').should('contain', '/emergency-recall')
  })

  it('sensitive info - links back to fixed term licence conditions if determinate sentence / fixed term recall', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        isIndeterminateSentence: false,
        isExtendedSentence: false,
        recallType: {
          selected: { value: 'FIXED_TERM' },
        },
      },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
    cy.getLinkHref('Back').should('contain', '/fixed-licence')
  })

  it('completed recommendation - redirect to case overview', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, status: 'DOCUMENT_DOWNLOADED' },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/confirmation-part-a`)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
  })
})
