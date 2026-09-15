import { sharedPaths } from '../../../../server/routes/paths/shared.paths'
import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'
import setUpSessionForPpcs from './util'

context('PPCS Start Page', () => {
  beforeEach(() => {
    setUpSessionForPpcs()
  })

  describe('landing page for PPCS', () => {
    it('displays page content', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })

      cy.visit(`${sharedPaths.start}`)

      cy.pageHeading().should('contain', 'Check and book a recall')

      cy.get('.govuk-list--bullet').within(() => {
        cy.get('li').eq(0).should('contain', 'review in-hours recall requests created in the Consider a recall service')
        cy.get('li').eq(1).should('contain', 'upload supporting documents')
        cy.get('li').eq(2).should('contain', 'add minutes')
        cy.get('li').eq(3).should('contain', 'book recalls on to PPUD')
      })

      cy.get('p').should('contain', 'You can only use this service for people serving')
      cy.get('strong').should('contain', 'determinate sentences')

      cy.get('p').should('contain', 'To book on a recall for someone serving an indeterminate sentence, use PPUD.')

      cy.get('.govuk-button--start').should('contain', 'Start now')
    })
  })

  describe('landing page for PPCS without correct mapping or ppud user account', () => {
    it('shows error when no mapping present', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: { ppudUserMapping: null } })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: { results: [] } })

      cy.visit(`${sharedPaths.start}`)

      cy.pageHeading().should('contain', 'Check and book a recall')
      cy.getElement('Your account needs updating before you can book a recall').should('exist')
    })

    it('shows error when mapping present but no active ppud user', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: { results: [] } })

      cy.visit(`${sharedPaths.start}`)

      cy.pageHeading().should('contain', 'Check and book a recall')
      cy.getElement('Your account needs updating before you can book a recall').should('exist')
    })
  })
})
