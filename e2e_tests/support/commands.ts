/// <reference path = "../../cypress_shared/index.d.ts" />
import '../../cypress_shared/commands'

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})

export enum UserType {
  PO,
  SPO,
  ACO,
}

const userName = Cypress.env('USERNAME')
const password = Cypress.env('PASSWORD')

const userNameSpo = Cypress.env('USERNAME_SPO')
const passwordSpo = Cypress.env('PASSWORD_SPO')

const userNameAco = Cypress.env('USERNAME_ACO')
const passwordAco = Cypress.env('PASSWORD_ACO')

Cypress.Commands.add('visitPage', (url, isSpoUser = false) => {
  cy.clearCookies()
  cy.visit(url)
  cy.pageHeading().should('equal', 'Sign in')
  cy.get('#username').type(isSpoUser ? userNameSpo : userName, { log: false })
  cy.get('#password').type(isSpoUser ? passwordSpo : password, { log: false })
  cy.get('#submit').click()
})

Cypress.Commands.add('visitPageAndLogin', (url, userType = UserType.PO) => {
  cy.clearCookies()
  cy.visit(url)
  cy.pageHeading().should('equal', 'Sign in')
  cy.get('#username').type(userType === UserType.ACO ? userNameAco : userType === UserType.SPO ? userNameSpo : userName, { log: false })
  cy.get('#password').type(userType === UserType.ACO ? passwordAco : userType === UserType.SPO ? passwordSpo : password, { log: false })
  cy.get('#submit').click()
})
