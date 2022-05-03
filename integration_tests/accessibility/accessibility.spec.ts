const urls = ['/', '/search', '/search-results']

context('Accessibility (a11y) Checks', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  urls.forEach(url => {
    it(url, () => {
      cy.visit(url)
      cy.injectAxe()
      cy.checkA11y()
    })
  })
})
