import { routeUrls } from '../../server/routes/routeUrls'

context('Analytics', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('sends page view and form error events to Google Analytics', () => {
    cy.interceptGoogleAnalyticsEvent()
    cy.visit(`${routeUrls.searchResults}?crn=`)
    cy.wait('@googleAnalyticsPageView')
      .then(data => data.request.url)
      .should('contain', 't=pageview')
    // form validation error ('missingCrn')
    cy.wait('@googleAnalyticsEvent')
      .then(data => data.request.url)
      .should('contain', 'ec=missingCrn&ea=form_error&el=crn')
  })
})
