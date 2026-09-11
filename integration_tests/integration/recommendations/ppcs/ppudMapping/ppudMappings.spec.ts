import { faker } from '@faker-js/faker/locale/en_GB'
import ppcsPaths from '../../../../../server/routes/paths/ppcs.paths'
import { PpudUserMappingFullGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingFullGenerator'
import { HMPPS_AUTH_ROLE } from '../../../../../server/middleware/authorisationMiddleware'

context('PPUD Mappings', () => {
  beforeEach(() => {
    cy.session('login', () => {
      // TODO switch to PPCS admin user
      cy.signIn({ roles: [HMPPS_AUTH_ROLE.PPCS_ADMIN] })
    })
  })

  it('Load page', () => {
    const allUserMappings = faker.helpers.multiple(() => PpudUserMappingFullGenerator.generate())
    cy.task('ppudSearchAllPpudUserMappings', { statusCode: 200, response: allUserMappings })

    cy.visit(`${ppcsPaths.ppudUserMappings}`)

    cy.pageHeading().should('equal', 'Consider a Recall to PPUD mappings')

    cy.get('.govuk-table').within(() => {
      cy.get('caption.govuk-table__caption').should('contain.text', 'Mapped users')
      cy.get('thead.govuk-table__head').within(() => {
        cy.get('th').should('have.attr', 'scope', 'col').should('have.length', 6)
        cy.get('th').eq(0).should('contain.text', 'User name')
        cy.get('th').eq(1).should('contain.text', 'PPUD full name')
        cy.get('th').eq(2).should('contain.text', 'PPUD team name')
        cy.get('th').eq(3).should('contain.text', 'PPUD user name')
      })
    })

    cy.get('.govuk-table__body').within(() => {
      cy.get('tr').should('have.length', allUserMappings.length)
      allUserMappings.forEach((userMapping, index) => {
        cy.get('tr')
          .eq(index)
          .within(() => {
            cy.get('td').eq(0).should('contain.text', userMapping.userName)
            cy.get('td').eq(1).should('contain.text', userMapping.ppudUserFullName)
            cy.get('td').eq(2).should('contain.text', userMapping.ppudTeamName)
            cy.get('td').eq(3).should('contain.text', userMapping.ppudUserName)
            cy.get('td')
              .eq(4)
              .within(() => {
                cy.get('a')
                  .should('have.attr', 'href', `/${ppcsPaths.ppudUserMappings}/${userMapping.id}`)
                  .should('contain.text', 'Edit')
              })
            cy.get('td')
              .eq(5)
              .within(() => {
                cy.get('a')
                  .should('have.attr', 'href', `/${ppcsPaths.ppudUserMappings}/${userMapping.id}/delete`)
                  .should('contain.text', 'Delete')
              })
          })
      })
    })

    cy.get('.govuk-button')
      .should('contain.text', 'Add new entry')
      .should('have.attr', 'href', `/${ppcsPaths.ppudUserMappings}/add`)
  })
})
