context('Healthcheck', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthPing')
    cy.task('stubTokenVerificationPing')
    cy.task('getHealthCheck')
  })

  it('Health check page is visible', () => {
    cy.request('/health').its('body.status').should('equal', 'UP')
  })

  it('Ping is visible and UP', () => {
    cy.request('/ping').its('body.status').should('equal', 'UP')
  })

  it('Info is visible', () => {
    cy.request('/info').its('body.build.name').should('equal', 'make-recall-decision-ui')
  })
})
