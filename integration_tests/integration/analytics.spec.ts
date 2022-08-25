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
      .should('contain', 't=pageview')

    cy.log('======= contact type filters')
    cy.interceptGoogleAnalyticsEvent(
      {
        ea: 'Appointments',
        ec: 'contactFilterType',
        el: 'Responsible Officer Change',
      },
      'contactTypeEvent'
    )
    cy.contains('Appointments').click()
    cy.selectCheckboxes('Appointments', ['Responsible Officer Change'])
    cy.clickButton('Apply filters')
    cy.wait('@contactTypeEvent')

    cy.log('======= search term filter')
    cy.interceptGoogleAnalyticsEvent(
      {
        ea: 'offender manager',
        ec: 'contactFilterTerm',
      },
      'searchTermEvent'
    )
    cy.fillInput('Search term', 'offender manager')
    cy.clickButton('Apply filters')
    cy.wait('@searchTermEvent')

    cy.log('======= form validation error')
    cy.interceptGoogleAnalyticsEvent(
      {
        ec: 'formValidationError',
        ea: 'missingDateParts',
        el: 'dateFrom',
      },
      'dateValidationEvent'
    )
    cy.fillInput('Day', '12', { parent: '#dateFrom' })
    cy.fillInput('Month', '04', { parent: '#dateFrom' })
    cy.fillInput('Day', '13', { parent: '#dateTo' })
    cy.fillInput('Month', '05', { parent: '#dateTo' })
    cy.fillInput('Year', '2022', { parent: '#dateTo' })
    cy.clickButton('Apply filters')
    cy.wait('@dateValidationEvent')

    cy.log('======= open / close contact details')
    cy.clickLink('Clear filters')
    cy.interceptGoogleAnalyticsEvent(
      {
        ec: 'contactViewDetail',
        ea: '2022-04-21T11:30:00Z',
        el: 'Responsible Officer Change',
      },
      'openDetailsEvent'
    )
    cy.viewDetails('View more detail', { parent: `[data-qa="contact-1"]` }).should(
      'contain',
      'Comment added by Eliot Prufrock on 20/04/2022 at 11:35'
    )
    cy.wait('@openDetailsEvent')
  })
})
