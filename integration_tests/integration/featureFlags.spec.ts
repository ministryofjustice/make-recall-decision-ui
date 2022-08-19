import { routeUrls } from '../../server/routes/routeUrls'

context('Feature flags', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('override a flag', () => {
    cy.visit(routeUrls.flags)
    cy.pageHeading().should('equal', 'Feature flags')
    cy.getRadioOptionByLabel('Contact types filter', 'On').should('be.checked')
    cy.selectRadio('Contact types filter', 'Off')
    cy.clickButton('Save')
    cy.location().should(loc => expect(loc.search).to.contain('contactTypesFilter=0'))
  })
})
