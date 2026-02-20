export const testBackLink = (expectedHref: string, expectedText: string, isBrowserBack: boolean) => {
  cy.get('a.govuk-back-link')
    .should('exist')
    .and('have.attr', 'href', expectedHref)
    .and('contain.text', expectedText)
    .and(isBrowserBack ? 'have.attr' : 'not.have.attr', 'data-js', 'backlink-btn')
}

export const testStandardBackLink = () => {
  testBackLink('/', 'Back', true)
}
