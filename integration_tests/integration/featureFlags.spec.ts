import { routeUrls } from '../../server/routes/routeUrls'

context('Feature flags', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('override a flag', () => {
    cy.visit(routeUrls.flags)
    cy.pageHeading().should('equal', 'Feature flags')
    cy.getRadioOptionByLabel("Don't send events to Google Analytics or App Insights for my activity", 'On').should(
      'not.be.checked'
    )
    cy.selectRadio("Don't send events to Google Analytics or App Insights for my activity", 'On')
    cy.clickButton('Save')
    cy.location().should(loc => expect(loc.search).to.contain('flagExcludeFromAnalytics=1'))
  })
})
