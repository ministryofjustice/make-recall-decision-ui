import { When } from 'cypress-cucumber-preprocessor/steps'

When('Maria signs in', () => {
  cy.visitPage('/')
})

When('Maria searches for a case', () => {
  cy.clickLink('Start')
  const crnQuery = 'A12345'
  cy.pageHeading().should('equal', 'Search for a person on probation')
  cy.fillInput('Search', crnQuery)
})
