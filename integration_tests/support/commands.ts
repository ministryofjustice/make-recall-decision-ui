// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path = "../../cypress_shared/index.d.ts" />
import '../../cypress_shared/commands'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})
