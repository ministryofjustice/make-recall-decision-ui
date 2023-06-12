import { DateTime } from 'luxon'
import getCaseContactHistoryResponse from '../../api/responses/get-case-contact-history.json'
import { europeLondon, sortListByDateField } from '../../server/utils/dates'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'
import { dedupeList } from '../../server/utils/lists'
import { removeSystemGenerated } from '../../server/controllers/caseSummary/contactHistory/filterContactsBySystemGenerated'

context('Contact history', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.signIn()
  })

  describe('List of contacts', () => {
    it('shows all contacts, sorted by date', () => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.pageHeading().should('equal', 'Contact history for Charles Edwin')
      // contacts
      const filtered = removeSystemGenerated(getCaseContactHistoryResponse.contactSummary)
      const sortedByDate = sortListByDateField({
        list: filtered,
        dateKey: 'contactStartDate',
        newestFirst: true,
      })
      const dates = []
      sortedByDate.forEach((contact, index) => {
        dates.push(DateTime.fromISO(contact.contactStartDate, { zone: europeLondon }).toISODate())
        const opts = { parent: `[data-qa="contact-${index}"]` }
        cy.getText('heading', opts).should('contain', contact.descriptionType)
        if (contact.sensitive) {
          cy.getText('heading', opts).should('contain', '(sensitive)')
        }
        cy.getText('time', opts).should(
          'contain',
          formatDateTimeFromIsoString({ isoDate: contact.contactStartDate, timeOnly: true })
        )
        if (contact.notes) {
          cy.getText('notes', opts).should('equal', contact.notes)
        }
      })
      const dedupedDates = dedupeList(dates)
      dedupedDates.forEach((date, index) => {
        cy.getText(`date-${index}`).should('equal', formatDateTimeFromIsoString({ isoDate: date, dateOnly: true }))
      })
    })

    it('does not show future contacts', () => {
      // add a future contact to the list
      const responseWithFutureContact = {
        ...getCaseContactHistoryResponse,
        contactSummary: [
          ...getCaseContactHistoryResponse.contactSummary,
          {
            ...getCaseContactHistoryResponse.contactSummary[0],
            contactStartDate: DateTime.now().plus({ minutes: 30 }).toISO(),
          },
        ],
      }
      cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: responseWithFutureContact })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.getElement('12 contacts').should('exist')
    })

    it('can view collapsible notes on the contact history page', () => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
        if (contact.notes) {
          cy.viewDetails('View more detail', opts).should('contain', contact.notes)
        }
        if (contact.description) {
          cy.getElement({ qaAttr: 'description' }, opts).should('contain', contact.description)
        }
      })
    })

    it('can download contact documents', () => {
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)

      cy.log('Documents sorted by last modified date (newest first)')
      cy.getListLabels('contact-document-label', { parent: '[data-qa="contact-2"]' }).should('deep.equal', [
        'my.doc.docx',
        'v1-1.pdf',
        'v1.txt',
      ])

      cy.log('Download a PDF')
      const pdfFileName = 'v1-1.pdf'
      cy.readBase64File('test.pdf').then(contents => {
        cy.task('getDownloadDocument', {
          contents,
          fileName: pdfFileName,
          contentType: 'application/pdf',
        })
        cy.downloadPdf('v1-1.pdf').should('contain', 'This is a test PDF document')
      })

      cy.log('Download a .docx')
      const docFileName = 'my.doc.docx'
      cy.readBase64File('test.docx').then(contents => {
        cy.task('getDownloadDocument', {
          contents,
          fileName: docFileName,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        cy.downloadDocX('my.doc.docx').should('contain', 'Lorem ipsum')
      })
    })
  })

  describe('Filter contacts', () => {
    it('by date range', () => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)

      // apply filters without entering dates
      cy.clickButton('Apply filters')
      cy.getElement('12 contacts').should('exist')

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
      cy.getElement('12 contacts').should('exist')

      cy.log('invalid dates - from date after to date')
      cy.enterDateTime({ year: '2022', month: '04', day: '14' }, { parent: '#dateFrom' })
      cy.enterDateTime({ year: '2022', month: '04', day: '13' }, { parent: '#dateTo' })
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
      cy.enterDateTime({ year: '2022', month: '03', day: '13' }, { parent: '#dateFrom' })
      cy.enterDateTime({ year: '2022', month: '04', day: '13' }, { parent: '#dateTo' })
      cy.clickButton('Apply filters')
      cy.getElement('2 contacts').should('exist')
      cy.getLinkHref('13 Mar 2022 to 13 Apr 2022').should('equal', `/cases/${crn}/contact-history`)

      // clear filters
      cy.clickLink('Clear filters')
      cy.getElement('12 contacts').should('exist')
    })

    it('by free text search', () => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.fillInput('Search term', 'letter')
      cy.clickButton('Apply filters')
      cy.getElement('4 contacts').should('exist')
      // one of the contacts was matched on notes, so check the details were expanded
      cy.isDetailsOpen('View more detail', { parent: '[data-qa="contact-1"]' }).should('equal', true)
      // one of the contacts was matched on description, so check the details were not expanded
      cy.isDetailsOpen('View more detail', { parent: '[data-qa="contact-3"]' }).should('equal', false)
      cy.fillInput('Search term', 'Eliot Prufrock')
      cy.clickButton('Apply filters')
      // all text search terms are required, so result set is reduced
      cy.getElement('3 contacts').should('exist')
      // clear filters
      cy.clickLink('letter')
      cy.getElement('7 contacts').should('exist')
      cy.clickLink('Eliot Prufrock')
      cy.getElement('12 contacts').should('exist')
    })

    it('by contact type group', () => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.contains('Appointments (5 contacts)').click()
      cy.selectCheckboxes('Appointments', ['Responsible Officer Change (1 contact)'])
      cy.clickButton('Apply filters')
      cy.getElement('1 contact').should('exist')
    })

    it('by system generated contacts', () => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.getElement('12 contacts').should('exist')
      cy.selectCheckboxes('NDelius automatic contacts', ['Show NDelius automatic contacts'])
      cy.clickButton('Apply filters')
      cy.getElement('14 contacts').should('exist')
      // clear filter
      cy.clickLink('NDelius automatic contacts')
      cy.getElement('12 contacts').should('exist')
    })

    it('by multiple filters combined', () => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/contact-history`)
      cy.getElement('12 contacts').should('exist')

      // include system generated contacts
      cy.selectCheckboxes('NDelius automatic contacts', ['Show NDelius automatic contacts'])
      cy.clickButton('Apply filters')
      cy.getElement('14 contacts').should('exist')

      // combine date, contact type and text filters
      cy.enterDateTime({ year: '2022', month: '03', day: '16' }, { parent: '#dateFrom' })
      cy.enterDateTime({ year: '2022', month: '04', day: '21' }, { parent: '#dateTo' })
      cy.contains('Appointments').click()
      cy.selectCheckboxes('Appointments', ['Planned Office Visit (NS)'])
      cy.clickButton('Apply filters')
      cy.getElement('2 contacts').should('exist')
      cy.fillInput('Search term', 'Failed to attend')
      cy.clickButton('Apply filters')
      cy.getElement('1 contact').should('exist')
      // the results subheading should be focussed
      cy.focused().should('have.attr', 'data-js', 'focus-on-page-load')

      // clear the contact type filter
      cy.clickLink('Planned Office Visit (NS)')
      cy.getElement('2 contacts').should('exist')
      cy.clickLink('Clear filters')
      cy.fillInput('Search term', 'Planned office visit')
      cy.clickButton('Apply filters')

      // none of the contact type filters are selected, so the total counts of all filters should match the number of listed contacts
      cy.getElement('3 contacts').should('exist')
      cy.contains('Appointments').click()
      cy.contactTypeFiltersTotalCount().should('equal', 3)
    })
  })
})
