import { When } from 'cypress-cucumber-preprocessor/steps'


When('Maria views the no recall task list', () => {
  cy.downloadDocX('Download the Part A').then(contents => {
    cy.pageHeading().should('equal', 'Create a Decision not to Recall letter')
  })
})
