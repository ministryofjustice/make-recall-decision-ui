const testContinueButton = () => {
  cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
}

export default testContinueButton
