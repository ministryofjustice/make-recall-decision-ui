/// <reference path = "../../cypress_shared/index.d.ts" />
import '../../cypress_shared/commands'

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})

export enum UserType {
  PO = 'PO',
  SPO = 'SPO',
  ACO = 'ACO',
}

const userName = Cypress.env('USERNAME')
const password = Cypress.env('PASSWORD')

const userNameSpo = Cypress.env('USERNAME_SPO')
const passwordSpo = Cypress.env('PASSWORD_SPO')

const userNameAco = Cypress.env('USERNAME_ACO')
const passwordAco = Cypress.env('PASSWORD_ACO')

const getUserDetails = function (userType: UserType) {
  let userDetails = {}
  cy.visit('/account-details')
  cy.getText('name').then(text => {
    userDetails['name'] = text
  })
  cy.getText('username').then(text => {
    userDetails['username'] = text
  })
  cy.getText('email').then(text => {
    userDetails['email'] = text
  })
  cy.go('back')
  return cy.wrap(userDetails).as(UserType[userType])
}

Cypress.Commands.add('visitPage', (url, isSpoUser = false) => {
  cy.clearCookies()
  cy.visit(url)
  cy.pageHeading().should('equal', 'Sign in')
  cy.get('#username').type(isSpoUser ? userNameSpo : userName, { log: false })
  cy.get('#password').type(isSpoUser ? passwordSpo : password, { log: false })
  cy.get('#submit').click()
  getUserDetails(isSpoUser ? UserType.SPO : UserType.PO)
})

Cypress.Commands.add('visitPageAndLogin', function (url, userType = UserType.PO) {
  cy.clearCookies()
  cy.visit(url)
  cy.pageHeading().should('equal', 'Sign in')
  cy.get('#username').type(userType === UserType.ACO ? userNameAco : userType === UserType.SPO ? userNameSpo : userName, { log: false })
  cy.get('#password').type(userType === UserType.ACO ? passwordAco : userType === UserType.SPO ? passwordSpo : password, { log: false })
  cy.get('#submit').click()
  getUserDetails(userType)
})
