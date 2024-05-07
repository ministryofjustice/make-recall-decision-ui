import { routeUrls } from '../../server/routes/routeUrls'
import getLastCompletedRecommendationsResponse from '../../api/responses/get-case-last-completed.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

context('Recommendations tab in case summary', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.task('reset')
    cy.window().then(win => win.sessionStorage.clear())
    cy.task('getUser', { user: 'USER1', statusCode: 200, response: { homeArea: { code: 'N07', name: 'London' } } })
    cy.signIn()
  })

  const checkValuesInTable = expectedTableRows => {
    for (let i = 0; i < expectedTableRows.length; i += 1) {
      cy.getRowValuesFromTable({ tableCaption: 'Recommendations', rowSelector: `[data-qa="${i + 1}"]` }).then(row1 => {
        expect(row1).to.deep.eq(expectedTableRows[i])
      })
    }
  }

  it('list last completed', () => {
    cy.task('getCase', {
      sectionId: 'last-completed',
      statusCode: 200,
      response: {
        ...getLastCompletedRecommendationsResponse,
      },
    })
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/last-completed`)
    cy.pageHeading().should('equal', 'Completed for Harry Smith')

    checkValuesInTable([['31 Jul 2023', 'Part A', 'This is the most recent completed document. It is not a draft.']])
  })

  it('shows a message if no last completed', () => {
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.task('getCase', {
      sectionId: 'last-completed',
      statusCode: 200,
      response: {
        ...getLastCompletedRecommendationsResponse,
        recommendations: null,
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/last-completed`)
    cy.getElement('There are no documents to download').should('exist')
    cy.getElement(
      'There are no documents to download. This is because this service has not been used to make a recommendation for Harry Smith yet. Check NDelius if you need an old Part A or decision not to recall letter.'
    ).should('exist')
  })
})
