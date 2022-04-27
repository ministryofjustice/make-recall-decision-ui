/// <reference path = "../../cypress_shared/index.d.ts" />
import '../../cypress_shared/commands'

const userName = Cypress.env('USERNAME') || 'AUTH_USER'
const password = Cypress.env('PASSWORD') || 'password123456'

Cypress.Commands.add('visitPage', url => {
  cy.visit(url)
  cy.pageHeading().should('equal', 'Sign in')
  cy.get('#username').type(userName)
  cy.get('#password').type(password)
  cy.get('#submit').click()
})
