import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
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
  })

  it('User can log out', () => {
    cy.signIn()
    cy.pageHeading().should('equal', 'Recall Decisions')
    cy.clickLink('Sign out')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details and give feedback', () => {
    cy.signIn()
    cy.pageHeading().should('equal', 'Recall Decisions')
    cy.getLinkHref('J. Smith').should('contain', '/account-details')
    cy.getText('feedback-form-link').should('equal', 'feedback')
    cy.getLinkHref({ qaAttr: 'feedback-form-link' }).should(
      'contain',
      'https://docs.google.com/forms/d/1ZJPD40s-tzr9Uf0HwrrF0YP9bUilCe228Xk-2d2quNE/edit?ts=62d7ca55'
    )
  })
})
