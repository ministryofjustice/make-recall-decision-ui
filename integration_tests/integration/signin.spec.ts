import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('getUser', { user: 'USER1', statusCode: 200, response: { homeArea: { code: 'N07', name: 'London' } } })
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    cy.getText('header-user-name').should('contain', 'J. Smith')
    cy.getText('env-tag').should('equal', 'test')
  })

  it('User can log out', () => {
    cy.signIn()
    cy.pageHeading().should('equal', 'Consider a recall')
    cy.clickLink('Sign out')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User sees development environment blurb', () => {
    cy.signIn()
    cy.getText('banner-text').should(
      'equal',
      'This version of the service is for testing purposes only. It is a replica of the live service to help you get familiar with it.'
    )
  })
})
