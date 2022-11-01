import { routeUrls } from '../../server/routes/routeUrls'

context('Feature flags', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('override a flag', () => {
    cy.visit(routeUrls.flags)
    cy.pageHeading().should('equal', 'Feature flags')
    cy.getRadioOptionByLabel("Don't send my data to Google Analytics (in prod only)", 'On').should('not.be.checked')
    cy.selectRadio("Don't send my data to Google Analytics (in prod only)", 'On')
    cy.clickButton('Save')
    cy.location().should(loc => expect(loc.search).to.contain('flagExcludeFromAnalytics=1'))
  })
})
