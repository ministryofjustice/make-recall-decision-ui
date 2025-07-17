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
    .as('errorSummaryList')
  cy.get('@errorSummaryList').find('li').should('have.length.at.least', 1).as('errorSummaryListItems')

  expectedErrors.forEach(expectedError => {
    if (expectedError.message) {
      cy.get('@errorSummaryListItems').should('contain.text', expectedError.message)
    }
    cy.get('@errorSummaryListItems').should('contain.html', `a href="#${expectedError.href}"`)
  })
}
