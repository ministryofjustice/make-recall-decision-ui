export interface FormGroup {
  id: string
  label: string
  name: string
  value: string
}

export const testFormGroup = (formGroup: Cypress.Chainable<JQuery<HTMLElement>>, params: FormGroup) => {
  formGroup.then($formGroup => {
    cy.wrap($formGroup).find('label.govuk-label').should('contain.text', params.label)
    cy.wrap($formGroup)
      .find('input')
      .should('have.attr', 'id', params.id)
      .should('have.attr', 'name', params.name)
      .should('have.value', params.value)
  })
}
