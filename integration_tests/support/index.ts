import './commands'

beforeEach(() => {
  cy.task('getUser', { user: 'USER1', statusCode: 200, response: { homeArea: { code: 'N07', name: 'London' } } })
})
