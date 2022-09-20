import { When } from 'cypress-cucumber-preprocessor/steps'


When('Maria views the no recall task list', () => {
  cy.pageHeading().should('equal', 'Create a Decision not to Recall letter')
})

When('Maria confirms why recall was considered', () => {
  cy.clickLink('Why you considered recall')
})
