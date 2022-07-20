import { routeUrls } from '../../server/routes/routeUrls'

context('Analytics', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('sends page view, form error and view details events to Google Analytics', () => {
    const crn = 'X34983'
    cy.interceptGoogleAnalyticsEvent()
    cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
    cy.wait('@googleAnalyticsPageView')
      .then(data => data.request.url)
      .should('contain', 't=pageview')
    // form validation error
    cy.fillInput('Day', '12', { parent: '#dateFrom' })
    cy.fillInput('Month', '04', { parent: '#dateFrom' })
    cy.fillInput('Day', '13', { parent: '#dateTo' })
    cy.fillInput('Month', '05', { parent: '#dateTo' })
    cy.fillInput('Year', '2022', { parent: '#dateTo' })
    cy.clickButton('Apply filters')
    cy.wait('@googleAnalyticsEvent')
      .then(data => data.request.url)
      .should('contain', 'ec=missingDateParts&ea=form_error&el=dateFrom')
    // open / close contact details
    cy.viewDetails('View more detail', { parent: `[data-qa="contact-1"]` }).should(
      'contain',
      'Comment added by Eliot Prufrock on 20/04/2022 at 11:35'
    )
    cy.wait('@googleAnalyticsEvent')
      .then(data => data.request.url)
      .should('contain', `ec=contactNotes&ea=openDetails&el=Responsible%20Officer%20Change`)
    cy.get(`[data-qa="contact-1"]`).contains('View more detail').click()
    cy.wait('@googleAnalyticsEvent')
      .then(data => data.request.url)
      .should('contain', `ec=contactNotes&ea=closeDetails&el=Responsible%20Officer%20Change`)
  })
})
