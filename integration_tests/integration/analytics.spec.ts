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
        ec: 'Appointments',
        ea: 'contactHistoryFilterByType',
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
        ec: 'offender manager',
        ea: 'contactHistoryFilterByTerm',
      },
      'searchTermEvent'
    )
    cy.fillInput('Search term', 'offender manager')
    cy.clickButton('Apply filters')
    cy.wait('@searchTermEvent')

    cy.log('======= form validation error')
    cy.interceptGoogleAnalyticsEvent(
      {
        ec: 'missingDateParts',
        ea: 'form_error',
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
        ec: 'contactNotes',
        ea: 'openDetails',
        el: 'Responsible Officer Change',
      },
      'openDetailsEvent'
    )
    cy.viewDetails('View more detail', { parent: `[data-qa="contact-1"]` }).should(
      'contain',
      'Comment added by Eliot Prufrock on 20/04/2022 at 11:35'
    )
    cy.wait('@openDetailsEvent')
    cy.interceptGoogleAnalyticsEvent(
      {
        ec: 'contactNotes',
        ea: 'closeDetails',
        el: 'Responsible Officer Change',
      },
      'closeDetailsEvent'
    )
    cy.get(`[data-qa="contact-1"]`).contains('View more detail').click()
    cy.wait('@closeDetailsEvent')
  })
})
