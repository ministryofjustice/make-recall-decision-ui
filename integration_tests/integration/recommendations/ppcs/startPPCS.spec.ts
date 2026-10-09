import { sharedPaths } from '../../../../server/routes/paths/shared.paths'
import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'
import setUpSessionForPpcs from './util'

const assertPpudUserNotMappedPageContent = () => {
  cy.pageHeading().should('contain', 'You cannot book on a recall')

  cy.get('p').should('contain', 'Your NDelius and PPUD accounts need to be connected before you can book on a recall.')
  cy.get('[data-qa="user-admin-link"]')
    .should('contain', 'user admin page')
    .and('have.attr', 'href', '/ppud-user-mappings')
  cy.get('p').should('contain', 'You will need your:')

  cy.get('[data-qa="required-details"]').within(() => {
    cy.get('li').should('have.length', 4)
    cy.get('li').eq(0).should('contain', 'NDelius username')
    cy.get('li').eq(1).should('contain', 'PPUD username')
    cy.get('li').eq(2).should('contain', 'full name as it appears in PPUD')
    cy.get('li').eq(3).should('contain', 'team name as it appears in PPUD')
  })

  cy.contains('a.govuk-link', 'Back to sign in')
    .should('have.attr', 'href', '/sign-out')
    .parent()
    .should('have.class', 'govuk-body')
  // the PPCS start page content must not be shown
  cy.get('.govuk-button--start').should('not.exist')
}

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

  describe('PPCS user without a valid PPUD user mapping', () => {
    it('shows PPUD user not mapped page when no mapping is present', () => {
      cy.task('searchMappedUsers', {
        statusCode: 200,
        response: {
          ppudUserMapping: null,
        },
      })

      cy.task('ppudSearchActiveUsers', {
        statusCode: 200,
        response: {
          results: [],
        },
      })

      cy.visit(sharedPaths.start)

      assertPpudUserNotMappedPageContent()
    })

    it('shows PPUD user not mapped page when mapping exists but PPUD user is inactive', () => {
      cy.task('searchMappedUsers', {
        statusCode: 200,
        response: searchMappedUserResponse,
      })

      cy.task('ppudSearchActiveUsers', {
        statusCode: 200,
        response: {
          results: [],
        },
      })

      cy.visit(sharedPaths.start)

      assertPpudUserNotMappedPageContent()
    })
  })
})
