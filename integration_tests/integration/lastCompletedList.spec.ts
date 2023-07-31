import { routeUrls } from '../../server/routes/routeUrls'
import getLastCompletedRecommendationsResponse from '../../api/responses/get-case-last-completed.json'

context('Recommendations tab in case summary', () => {
  const crn = 'X34983'

  const checkValuesInTable = expectedTableRows => {
    for (let i = 0; i < expectedTableRows.length; i += 1) {
      cy.getRowValuesFromTable({ tableCaption: 'Recommendations', rowSelector: `[data-qa="${i + 1}"]` }).then(row1 => {
        expect(row1).to.deep.eq(expectedTableRows[i])
      })
    }
  }

  it('list last completed', () => {
    cy.signIn()
    cy.task('getCase', {
      sectionId: 'last-completed',
      statusCode: 200,
      response: {
        ...getLastCompletedRecommendationsResponse,
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/last-completed?flagLastCompleted=1`)
    cy.pageHeading().should('equal', 'Completed for Harry Smith')

    checkValuesInTable([['31 Jul 2023', 'Part A', 'This is the most recent completed document. It is not a draft.']])
  })

  it('shows a message if no last completed', () => {
    cy.signIn()
    cy.task('getCase', {
      sectionId: 'last-completed',
      statusCode: 200,
      response: {
        ...getLastCompletedRecommendationsResponse,
        recommendations: null,
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/last-completed?flagLastCompleted=1`)
    cy.getElement('There are no documents to download').should('exist')
    cy.getElement(
      'There are no documents to download. This is because this service has not been used to make a recommendation for Harry Smith yet. Check NDelius if you need an old Part A or decision not to recall letter.'
    ).should('exist')
  })
})
