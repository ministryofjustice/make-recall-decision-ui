import 'cypress-audit/commands'
import { exactMatchIgnoreWhitespace } from './utils'

Cypress.Commands.add('pageHeading', () =>
  cy
    .get('h1')
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Commands.add('fillInput', (label, text, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('label', label)
    .invoke('attr', 'for')
    .then(id =>
      cy
        .get(`#${id}`)
        .then($input =>
          opts.clearExistingText ? cy.wrap($input).clear({ force: true }).type(text) : cy.wrap($input).type(text)
        )
    )
})

const clickElement = (label, tagName, opts) => {
  const parent = opts?.parent || 'body'
  if (label.qaAttr) {
    cy.get(parent).find(`${tagName}[data-qa="${label.qaAttr}"]`).click()
  } else {
    cy.get(parent).find(tagName).contains(label).click()
  }
}

Cypress.Commands.add('clickButton', (label, opts = { parent: 'body' }) => clickElement(label, 'button', opts))

Cypress.Commands.add('clickLink', (label, opts = { parent: 'body' }) => {
  clickElement(label, 'a', opts)
})

Cypress.Commands.add('getElement', (selector, opts = { parent: 'body' }) =>
  (selector as Cypress.Selector).qaAttr
    ? cy.get(`[data-qa="${(selector as Cypress.Selector).qaAttr}"]`)
    : cy.get(opts.parent).contains(selector as string)
)

Cypress.Commands.add('getLinkHref', (selector, opts = { parent: 'body' }) =>
  cy.getElement(selector, opts).invoke('attr', 'href')
)

Cypress.Commands.add('getRowValuesFromTable', ({ tableCaption, rowQaAttr, firstColValue }, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .contains('caption', tableCaption)
    .parent('table')
    .then($table => {
      if (rowQaAttr) {
        return cy.wrap($table).find(`[data-qa="${rowQaAttr}"]`).find('.govuk-table__cell')
      }
      if (firstColValue) {
        return cy
          .wrap($table)
          .contains(exactMatchIgnoreWhitespace(firstColValue))
          .parent('tr')
          .find('.govuk-table__cell')
      }
    })
    .then($els => Cypress.$.makeArray($els).map(el => el.innerText.trim()))
)

Cypress.Commands.add('getText', (qaAttr, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .find(`[data-qa="${qaAttr}"]`)
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Commands.add('getDefinitionListValue', (label: string, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .find('.govuk-summary-list__key')
    .contains(exactMatchIgnoreWhitespace(label))
    .next('.govuk-summary-list__value')
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Commands.add('assertErrorMessage', ({ fieldId, errorText }) => {
  cy.get(`[href="#${fieldId}"]`).should('have.text', errorText)
  cy.get(`#${fieldId}-error`)
    .invoke('text')
    .then(text => expect(text.trim()).to.contain(errorText))
})

Cypress.Commands.add('getTextInputValue', (label, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('label', label)
    .invoke('attr', 'for')
    .then(id => cy.get(`#${id}`))
    .invoke('val')
    .then(textVal => (textVal as string).trim())
})
