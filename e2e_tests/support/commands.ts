/// <reference path = "../../cypress_shared/index.d.ts" />
import '../../cypress_shared/commands'

const userName = Cypress.env('USERNAME')
const password = Cypress.env('PASSWORD')

Cypress.Commands.add('visitPage', url => {
  cy.visit(url)
  cy.pageHeading().should('equal', 'Sign in')
  cy.get('#username').type(userName)
  cy.get('#password').type(password)
  cy.get('#submit').click()
})
