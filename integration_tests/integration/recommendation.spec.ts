import { routeUrls } from '../../server/routes/routeUrls'

context('Make a recommendation', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('can create a recommendation', () => {
    const crn = 'X34983'
    cy.task('createRecommendation', { statusCode: 201, response: { id: '123' } })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickButton('Make a recommendation')
    cy.pageHeading().should('contain', 'Overview for Paula Smith')
  })

  it('shows an error if creation fails', () => {
    const crn = 'X34983'
    cy.task('createRecommendation', { statusCode: 500, response: 'API save error' })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickButton('Make a recommendation')
    cy.getElement('An error occurred creating a new recommendation').should('exist')
  })
})
