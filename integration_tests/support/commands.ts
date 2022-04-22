Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

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

const clickElement = (label, tagName, opts = { parent: 'body' }) => {
  if (label.qaAttr) {
    cy.get(opts.parent).find(`${tagName}[data-qa="${label.qaAttr}"]`).click()
  } else {
    cy.get(opts.parent).find(tagName).contains(label).click()
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

Cypress.Commands.add('getRowValuesFromTable', ({ tableCaption, rowQaAttr }, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .contains('caption', tableCaption)
    .parent('table')
    .find(`[data-qa="${rowQaAttr}"]`)
    .find('.govuk-table__cell')
    .then($els => Cypress.$.makeArray($els).map(el => el.innerText.trim()))
)

Cypress.Commands.add('getText', (qaAttr, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .find(`[data-qa="${qaAttr}"]`)
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
})
