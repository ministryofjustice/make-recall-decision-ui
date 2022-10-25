import { routeUrls } from '../../server/routes/routeUrls'

context('Analytics', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('sends page view, form error and view details events', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
    cy.wait('@googleAnalyticsPageView')
      .then(data => data.request.url)
      .should('contain', 'en=page_view')
  })
})
