import { When } from 'cypress-cucumber-preprocessor/steps'


When('Maria views the no recall task list', () => {
  cy.pageHeading().should('equal', 'Create a Decision not to Recall letter')
})
