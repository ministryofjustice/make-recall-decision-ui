import { routeUrls } from '../../server/routes/routeUrls'

context('Feature flags', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('override a flag', () => {
    cy.visit(routeUrls.flags)
    cy.pageHeading().should('equal', 'Feature flags')
    cy.getSelectableOptionByLabel('Recommendations tab', 'On').should('not.be.checked')
    cy.selectRadio('Recommendations tab', 'On')
    cy.clickButton('Save')
    cy.location().should(loc => expect(loc.search).to.contain('flagRecommendationsPage=1'))
  })
})
