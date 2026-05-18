import routeUrls from '../../server/routes/routeUrls'

context('Feature flags', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('override a flag', () => {
    cy.visit(routeUrls.flags)
    cy.pageHeading().should('equal', 'Feature flags')
    cy.getElement('mockedFlag')
      .should('exist')
      .parent()
      .within(() => {
        cy.get('.govuk-summary-list__actions').should('exist')
        cy.get('input[value=1]').click()
      })

    cy.clickButton('Save')
    cy.location().should(loc => expect(loc.search).to.contain('mockedFlag=1'))
  })
})
