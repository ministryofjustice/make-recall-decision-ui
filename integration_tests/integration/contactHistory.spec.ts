import { DateTime } from 'luxon'
import getCaseContactHistoryResponse from '../../api/responses/get-case-contact-history.json'
import { europeLondon, sortListByDateField } from '../../server/utils/dates'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'
import { dedupeList } from '../../server/utils/lists'

context('Contact history', () => {
  beforeEach(() => {
    cy.signIn()
    cy.mockCaseSummaryData()
  })

  it('can view the contact history page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
    cy.pageHeading().should('equal', 'Contact history for Charles Edwin')

    // contacts
    const systemGeneratedRemoved = getCaseContactHistoryResponse.contactSummary.filter(
      contact => contact.systemGenerated === false
    )
    const sortedByDate = sortListByDateField({
      list: systemGeneratedRemoved,
      dateKey: 'contactStartDate',
      newestFirst: true,
    })
    const dates = []
    sortedByDate.forEach((contact, index) => {
      dates.push(DateTime.fromISO(contact.contactStartDate, { zone: europeLondon }).toISODate())
      const opts = { parent: `[data-qa="contact-${index}"]` }
      cy.getText('heading', opts).should('equal', contact.descriptionType)
      cy.getText('time', opts).should(
        'contain',
        formatDateTimeFromIsoString({ isoDate: contact.contactStartDate, timeOnly: true })
      )
      cy.getText('notes', opts).should('equal', contact.notes)
    })
    const dedupedDates = dedupeList(dates)
    dedupedDates.forEach((date, index) => {
      cy.getText(`date-${index}`).should('equal', formatDateTimeFromIsoString({ isoDate: date, dateOnly: true }))
    })
  })

  it('can view collapsible notes on the contact history page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/contact-history`)

    // contacts
    const systemGeneratedRemoved = getCaseContactHistoryResponse.contactSummary.filter(
      contact => contact.systemGenerated === false
    )
    const sortedByDate = sortListByDateField({
      list: systemGeneratedRemoved,
      dateKey: 'contactStartDate',
      newestFirst: true,
    })
    const dates = []
    sortedByDate.forEach((contact, index) => {
      dates.push(contact.contactStartDate.substring(0, 10))
      const opts = { parent: `[data-qa="contact-${index}"]` }
      cy.viewDetails('View more detail', opts).should('equal', contact.notes)
    })
  })

  it('can filter contacts by date range', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/contact-history`)

    // apply filters without entering dates
    cy.clickButton('Apply filters')
    cy.getElement('10 contacts').should('exist')

    cy.log('invalid dates - part of date missing')
    cy.fillInput('Day', '12', { parent: '#dateFrom' })
    cy.fillInput('Month', '04', { parent: '#dateFrom' })
    cy.fillInput('Year', '2022', { parent: '#dateTo' })
    cy.clickButton('Apply filters')
    cy.assertErrorMessage({
      fieldGroupId: 'dateFrom-year',
      fieldName: 'dateFrom',
      errorText: 'The from date must include a year',
    })
    cy.assertErrorMessage({
      fieldGroupId: 'dateTo-day',
      fieldName: 'dateTo',
      errorText: 'The to date must include a day and month',
    })
    cy.getElement('10 contacts').should('exist')

    cy.log('invalid dates - from date after to date')
    cy.enterDateTime('2022-04-14', { parent: '#dateFrom' })
    cy.enterDateTime('2022-04-13', { parent: '#dateTo' })
    cy.clickButton('Apply filters')
    cy.assertErrorMessage({
      fieldGroupId: 'dateFrom-day',
      fieldName: 'dateFrom',
      errorText: 'The from date must be on or before the to date',
    })

    cy.log('invalid date - out of bounds value')
    cy.fillInput('Day', '36', { parent: '#dateFrom', clearExistingText: true })
    cy.fillInput('Month', '04', { parent: '#dateFrom', clearExistingText: true })
    cy.fillInput('Year', '2021', { parent: '#dateFrom', clearExistingText: true })
    cy.clickButton('Apply filters')
    cy.assertErrorMessage({
      fieldGroupId: 'dateFrom-day',
      fieldName: 'dateFrom',
      errorText: 'The from date must have a real day',
    })

    cy.log('successful date filter')
    cy.enterDateTime('2022-03-13', { parent: '#dateFrom' })
    cy.enterDateTime('2022-04-13', { parent: '#dateTo' })
    cy.clickButton('Apply filters')
    cy.getElement('2 contacts').should('exist')
    cy.getLinkHref('13 Mar 2022 to 13 Apr 2022').should('equal', `/cases/${crn}/contact-history`)

    // clear filters
    cy.clickLink('Clear filters')
    cy.getElement('10 contacts').should('exist')
  })

  it('can filter contacts by free text search', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/contact-history?flagSearchFilter=1`)
    cy.fillInput('Search contacts', 'letter')
    cy.clickButton('Apply filters')
    cy.getElement('3 contacts').should('exist')
    // one of the 3 contacts was matched on notes, so check the notes were expanded
    cy.isDetailsOpen('View more detail', { parent: '[data-qa="contact-1"]' }).should('equal', true)
    // clear filter
    cy.clickLink('letter')
    cy.getElement('10 contacts').should('exist')
  })

  it('can filter contacts by date, contact types and text search', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/contact-history?contactTypesFilter=1&flagSearchFilter=1`)

    // combine date, contact type and text filters
    cy.enterDateTime('2022-03-16', { parent: '#dateFrom' })
    cy.enterDateTime('2022-04-21', { parent: '#dateTo' })
    cy.selectCheckboxes('Contact type', ['IOM 3rd Party Office Visit'])
    cy.clickButton('Apply filters')
    cy.getElement('2 contacts').should('exist')
    cy.fillInput('Search contacts', 'Failed to attend')
    cy.clickButton('Apply filters')
    cy.getElement('1 contact').should('exist')

    // clear the contact type filter
    cy.clickLink('IOM 3rd Party Office Visit')
    cy.getElement('2 contacts').should('exist')
    cy.clickLink('Clear filters')
    cy.fillInput('Search contacts', 'Planned office visit')
    cy.clickButton('Apply filters')

    // none of the contact type filters are selected, so the total counts of all filters should match the number of listed contacts
    cy.getElement('3 contacts').should('exist')
    cy.contactTypeFiltersTotalCount().should('equal', 3)
  })
})
