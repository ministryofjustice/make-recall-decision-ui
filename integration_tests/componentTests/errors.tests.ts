export const testForErrorPageTitle = () => {
  cy.title().should('contain', 'Error: ')
}

export const testForErrorSummary = (
  expectedErrors: {
    href: string
    message: string
    checkFieldHasErrorStyling?: boolean
    errorStyleClass?: string
    errorComponentId?: string
  }[],
) => {
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
      .then($a => expect($a.text().trim()).to.equal(expectedError.message))

    cy.get(`#${expectedError.href}`).should('exist')
    if (expectedError.checkFieldHasErrorStyling ?? true) {
      cy.get(`#${expectedError.href}`).should('have.class', expectedError.errorStyleClass ?? 'govuk-input--error')
    }

    cy.get(`#${expectedError.errorComponentId ?? `${expectedError.href}-error`}`)
      .should('exist')
      .should('contain.text', expectedError.message)
  })
}
