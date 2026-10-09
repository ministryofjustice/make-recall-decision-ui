import { FormGroup, testFormGroup } from './formGroup.tests'

export interface FieldSet {
  legend: string
  formGroups: FormGroup[]
}

export const testFieldset = (fieldset: Cypress.Chainable<JQuery<HTMLElement>>, params: FieldSet) => {
  fieldset.then($fieldset => {
    cy.wrap($fieldset).find('legend.govuk-fieldset__legend').should('contain.text', params.legend)

    cy.wrap($fieldset)
      .find('.govuk-form-group')
      .each((formGroup, index) => {
        const expectedFormGroup = params.formGroups[index]
        testFormGroup(cy.wrap(formGroup), expectedFormGroup)
      })
  })
}
