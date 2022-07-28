import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'

context('Make a recommendation', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('can create a recommendation', () => {
    const crn = 'X34983'
    const response = {
      recommendationId: '123',
      crn,
    }
    const updatedResponse = {
      ...response,
      recallType: 'FIXED_TERM',
    }
    const caseResponse = {
      ...getCaseOverviewResponse,
      activeRecommendation: undefined,
    }
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
    cy.task('createRecommendation', { statusCode: 201, response })
    cy.task('getRecommendation', { statusCode: 200, response })
    cy.task('updateRecommendation', { statusCode: 200, response: updatedResponse })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickButton('Make a recommendation')
    cy.pageHeading().should('equal', 'What do you recommend?')
    // validation error
    cy.clickButton('Continue')
    cy.assertErrorMessage({ fieldName: 'recallType', errorText: 'Select a recommendation' })
    cy.selectRadio('What do you recommend?', 'Fixed term')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Overview for Paula Smith')
  })

  it('shows an error if creation fails', () => {
    const crn = 'X34983'
    const caseResponse = {
      ...getCaseOverviewResponse,
      activeRecommendation: undefined,
    }
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
    cy.task('createRecommendation', { statusCode: 500, response: 'API save error' })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickButton('Make a recommendation')
    cy.getElement('An error occurred creating a new recommendation').should('exist')
  })

  it('can update a draft recommendation', () => {
    const crn = 'X34983'
    const recommendation = {
      recommendationId: '123',
      crn,
    }
    const caseResponse = {
      ...getCaseOverviewResponse,
      activeRecommendation: {
        recommendationId: '123',
        lastModifiedDate: '2022-07-01-01T00:00:000',
        lastModifiedBy: 'John Smith',
      },
    }
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
    cy.task('getRecommendation', { statusCode: 200, recommendation })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickLink('Update recommendation')
    cy.pageHeading().should('equal', 'What do you recommend?')
  })
})
