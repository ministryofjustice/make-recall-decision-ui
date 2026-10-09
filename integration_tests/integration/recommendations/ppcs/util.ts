import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'

const setUpSessionForPpcs = () => {
  cy.session('login', () => {
    cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
    cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
  })
}

const setUpSessionForPpcsAdmin = () => {
  setUpSessionForPpcs()
  // TODO switch to PPCS admin user once the role is ready
  // cy.session('login', () => {
  //   cy.signIn({ roles: [HMPPS_AUTH_ROLE.PPCS_ADMIN] })
  // })
}

export default setUpSessionForPpcs
export { setUpSessionForPpcsAdmin }
