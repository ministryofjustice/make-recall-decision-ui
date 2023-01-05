import { When } from '@badeball/cypress-cucumber-preprocessor'
import { crns } from './index'

const crn = crns['1']

When('Maria signs in to start page', () => {
  cy.visitPage('/')
})

When('Maria searches for a case', () => {
  cy.clickLink('Start now')
  cy.pageHeading().should('equal', 'Search for a person on probation')
  cy.fillInput('Search', crn)
  cy.clickButton('Search')
  cy.get(`[data-qa="row-${crn}"] [data-qa="name"]`).first().click().invoke('text').as('offenderName')
})

When('Maria views the overview page', () => {
  cy.get('@offenderName').then(offenderName => cy.getText('sectionHeading').should('equal', offenderName))
})

When('Maria views the risk page', () => {
  cy.clickLink('Risk')
  cy.pageHeading().should('contain', 'Risk')
})

When('Maria views the vulnerabilities page', () => {
  cy.clickLink('Vulnerabilities')
  cy.pageHeading().should('contain', 'Vulnerabilities')
})

When('Maria views the personal details page', () => {
  cy.clickLink('Personal details')
  cy.pageHeading().should('contain', 'Personal details')
})

When('Maria views the licence conditions page', () => {
  cy.clickLink('Licence conditions')
  cy.pageHeading().should('contain', 'Licence conditions')
})

When('Maria views the Contact history page', () => {
  cy.clickLink('Contact history')
  cy.pageHeading().should('contain', 'Contact history')
})

When('Henry views the Recommendations page', () => {
  cy.clickLink('Recommendations')
  cy.pageHeading().should('contain', 'Recommendations')
})

When('Maria filters contacts by date range', () => {
  cy.get('.app-summary-card')
    .its('length')
    .then(numberOfContacts => {
      cy.getElement(`${numberOfContacts} contacts`).should('exist')
    })
  cy.enterDateTime({ year: '2022', month: '03', day: '13' }, { parent: '#dateFrom' })
  cy.enterDateTime({ year: '2022', month: '04', day: '13' }, { parent: '#dateTo' })
  cy.clickButton('Apply filters')
  cy.getLinkHref('13 Mar 2022 to 13 Apr 2022').should('equal', `/cases/${crn}/contact-history`)
})
