import { routeUrls } from '../../server/routes/routeUrls'

context('Analytics', () => {
  beforeEach(() => {
    cy.signIn()
    cy.mockCaseSummaryData()
  })

  it('sends a page view event to Google Analytics', () => {
    const crn = 'X34983'
    cy.intercept('GET', 'https://www.google-analytics.com/collect?*', { statusCode: 200 }).as('collect')
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect', { statusCode: 200 })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.wait('@collect')
      .then(data => data.request.url)
      .should('contain', 't=pageview')
  })
})
