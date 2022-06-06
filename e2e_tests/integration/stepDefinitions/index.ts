import { When } from 'cypress-cucumber-preprocessor/steps'

export const crn = Cypress.env('CRN') || 'X098092'

When('Maria signs in', () => {
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
  cy.getDefinitionListValue('Offences').should('not.be.empty')
})

When('Maria views the risk page', () => {
  cy.clickLink('Risk')
  cy.pageHeading().should('equal', 'Risk')
  cy.getElement('Details of the risk').should('exist')
})

When('Maria views the personal details page', () => {
  cy.clickLink('Personal details')
  cy.pageHeading().should('equal', 'Personal details')
})

When('Maria views the licence conditions page', () => {
  cy.clickLink('Licence conditions')
  cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
})

When('Maria views the Contact history page', () => {
  cy.clickLink('Contact history')
  cy.pageHeading().should('equal', 'Contact history')
})

When('Maria filters contacts by date range', () => {
  cy.get('.app-summary-card')
    .its('length')
    .then(numberOfContacts => {
      cy.getElement(`${numberOfContacts} contacts`).should('exist')
    })
  cy.enterDateTime('2022-03-13', { parent: '#dateFrom' })
  cy.enterDateTime('2022-04-13', { parent: '#dateTo' })
  cy.clickButton('Apply filters')
  cy.getLinkHref('13 Mar 2022 to 13 Apr 2022').should('equal', `/cases/${crn}/contact-history`)
})
