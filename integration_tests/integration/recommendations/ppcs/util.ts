import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'

export function setUpSessionForPpcs() {
  cy.session('login', () => {
    cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
    cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
  })
}
