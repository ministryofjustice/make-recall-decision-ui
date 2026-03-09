export interface RadioButtons {
  legend: RadioLegend
  options: RadioButtonOption[]
}

interface RadioLegend {
  text: string
  html?: string
  hintId?: string
  hintText?: string
  hintHtml?: string
}

interface RadioButtonOption {
  input: RadioButtonInput
  label: RadioButtonLabel
  hint?: RadioButtonHint
}

interface RadioButtonInput {
  id: string
  value: string
  name?: string
  checked?: boolean
}

interface RadioButtonLabel {
  text: string
  html?: string
}

interface RadioButtonHint {
  id: string
  text: string
  html?: string
}

const testLegend = (fieldSetLegend: Cypress.Chainable<JQuery<HTMLElement>>, params: RadioLegend) => {
  fieldSetLegend.should('contain.text', params.text)
  if (params.html) {
    fieldSetLegend.should('contain.html', params.html)
  }
  if (params.hintId) {
    fieldSetLegend.get(params.hintId).should('exist').as('legendHint')
    cy.get('@legendHint').should('contain.text', params.hintText)
    if (params.hintHtml) {
      cy.get('@legendHint').should('contain.html', params.hintHtml)
    }
  }
}

const testInput = (radioInput: Cypress.Chainable<JQuery<HTMLElement>>, expectedOption: RadioButtonOption) => {
  radioInput.then($radioInput => {
    cy.wrap($radioInput)
      .should('exist')
      .should('have.id', expectedOption.input.id)
      .should('have.value', expectedOption.input.value)
      .should(expectedOption.input.checked ? 'be.checked' : 'not.be.checked')

    if (expectedOption.input.name) {
      cy.wrap($radioInput).should('have.attr', 'name', expectedOption.input.name)
    }

    if (expectedOption.hint) {
      cy.wrap($radioInput).should('have.attr', 'aria-describedby', expectedOption.hint.id)
    }
  })
}

const testLabel = (radioLabel: Cypress.Chainable<JQuery<HTMLElement>>, expectedOption: RadioButtonOption) => {
  radioLabel.then($radioLabel => {
    cy.wrap($radioLabel)
      .should('exist')
      .should('have.attr', 'for', expectedOption.input.id)
      .should('contain.text', expectedOption.label.text)
    if (expectedOption.label.html) {
      cy.wrap($radioLabel).should('contain.html', expectedOption.label.html)
    }
  })
}

const testHint = (radioHint: Cypress.Chainable<JQuery<HTMLElement>>, expectedHint: RadioButtonHint) => {
  radioHint.then($radioHint => {
    cy.wrap($radioHint).should('exist').should('contain.text', expectedHint.text)
    if (expectedHint.html) {
      cy.wrap($radioHint).should('contain.html', expectedHint.html)
    }
  })
}

const testRadioButtons = (formGroupElement: Cypress.Chainable<JQuery<HTMLElement>>, params: RadioButtons) => {
  formGroupElement.get('fieldset').as('radioFieldset')

  testLegend(cy.get('@radioFieldset').get('legend'), params.legend)

  cy.get('@radioFieldset').get('.govuk-radios').should('exist').as('radioGroup')

  cy.get('@radioGroup').get('div.govuk-radios__item').as('radios')
  cy.get('@radios').should('have.length', params.options.length)
  cy.get('@radios').each((radio, index) => {
    const expectedOption = params.options[index]

    testInput(cy.wrap(radio).find('input'), expectedOption)
    testLabel(cy.wrap(radio).find('label'), expectedOption)
    if (expectedOption.hint) {
      testHint(cy.wrap(radio).find(`#${expectedOption.hint.id}`), expectedOption.hint)
    }
  })
}

export default testRadioButtons
