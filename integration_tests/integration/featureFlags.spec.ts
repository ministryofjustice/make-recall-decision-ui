import { sharedPaths } from '../../server/routes/paths/shared.paths'

context('Feature flags', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('override a flag', () => {
    cy.visit(sharedPaths.flags)
    cy.pageHeading().should('equal', 'Feature flags')
    cy.getSelectableOptionByLabel('Recommendations tab', 'On').should('not.be.checked')
    cy.selectRadio('Recommendations tab', 'On')
    cy.clickButton('Save')
    cy.location().should(loc => expect(loc.search).to.contain('flagRecommendationsPage=1'))
  })
})
