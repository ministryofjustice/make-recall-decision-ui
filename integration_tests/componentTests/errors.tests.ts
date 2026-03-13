export const testForErrorPageTitle = () => {
  cy.title().should('contain', 'Error: ')
}

export const testForErrorSummary = (expectedErrors: { href: string; message?: string }[]) => {
  cy.get('div.govuk-error-summary').should('exist').as('errorSummary')
  cy.get('@errorSummary').should('contain.html', 'h2')
  cy.get('@errorSummary').should('contain.text', 'There is a problem')

  cy.get('@errorSummary')
    .find('ul')
    .should('exist')
    .and('have.class', 'govuk-error-summary__list')
    .and('contain.html', 'li')

  expectedErrors.forEach(expectedError => {
    cy.get('@errorSummary')
      .find(`a[href="#${expectedError.href}"]`)
      .should('exist')
      .then($a => {
        if (expectedError.message) {
          expect($a.text().trim()).to.equal(expectedError.message)
        }
      })
  })
}
