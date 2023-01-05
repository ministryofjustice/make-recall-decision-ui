/// <reference path = "../../cypress_shared/index.d.ts" />
import '../../cypress_shared/commands'

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})

const userName = Cypress.env('USERNAME')
const password = Cypress.env('PASSWORD')

const userNameSpo = Cypress.env('USERNAME_SPO')
const passwordSpo = Cypress.env('PASSWORD_SPO')

Cypress.Commands.add('visitPage', (url, isSpoUser = false) => {
  cy.visit(url)
  cy.pageHeading().should('equal', 'Sign in')
  cy.get('#username').type(isSpoUser ? userNameSpo : userName, { log: false })
  cy.get('#password').type(isSpoUser ? passwordSpo : password, { log: false })
  cy.get('#submit').click()
})
