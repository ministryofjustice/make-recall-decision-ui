const pa11yArgs = { runners: ['axe'], standard: 'WCAG2AA', hideElements: '.govuk-footer' }

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
      cy.pa11y(pa11yArgs as Cypress.Options)
    })
  })
})
