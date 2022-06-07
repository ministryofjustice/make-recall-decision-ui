import { routeUrls } from '../../server/routes/routeUrls'

context('Analytics', () => {
  beforeEach(() => {
    cy.signIn()
    cy.mockCaseSummaryData()
  })

  it('sends a page view event to Google Analytics', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.wait('@googleAnalytics')
      .then(data => data.request.url)
      .should('contain', 't=pageview')
  })
})
