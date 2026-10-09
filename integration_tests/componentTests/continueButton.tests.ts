const testContinueButton = (label?: string) => {
  cy.get('button')
    .should('have.class', 'govuk-button')
    .should('contain.text', label ?? 'Continue')
}

export default testContinueButton
