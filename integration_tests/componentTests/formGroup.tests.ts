export interface FormGroup {
  id: string
  label: string
  name: string
  value: string
  element?: 'input' | 'select'
}

export const testFormGroup = (formGroup: Cypress.Chainable<JQuery<HTMLElement>>, params: FormGroup) => {
  const elementType = params.element ?? 'input'
  formGroup.then($formGroup => {
    cy.wrap($formGroup).find('label.govuk-label').should('contain.text', params.label)
    cy.wrap($formGroup)
      .find(elementType)
      .should('have.attr', 'id', params.id)
      .should('have.attr', 'name', params.name)
      .should('have.value', params.value)
  })
}
