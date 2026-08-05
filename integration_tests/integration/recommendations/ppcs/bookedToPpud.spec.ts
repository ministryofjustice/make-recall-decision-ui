import { fakerEN_GB as faker } from '@faker-js/faker'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'

context('Select PPUD Sentence', () => {
  const recommendationId = faker.number.int()

  const testPageUrl = `/recommendations/${recommendationId}/booked-to-ppud`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  describe('Book to Ppud', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.BOOKED_TO_PPUD, active: true }],
      })
    })

    it('Booked to PPUD success', () => {
      cy.visit(testPageUrl)

      cy.get('.govuk-panel.govuk-panel--confirmation').should('exist')

      cy.get('.govuk-panel__title').should('exist')

      cy.get('.govuk-panel.govuk-panel--confirmation')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-panel__title').should('contain.text', 'Booked onto PPUD')

          cy.get('.govuk-panel__body').eq(0).should('contain.text', 'John Doe')

          cy.get('.govuk-panel__body').eq(1).should('contain.text', 'NOMIS number: J80002')
        })

      cy.get('.govuk-heading-m').should('contain', 'What happens next')

      cy.get('.govuk-body').should(
        'contain',
        'You’ve added this recall to PPUD. A band 4 case manager will review and decide what recall type to use.',
      )
      cy.contains('a.govuk-button', 'Start a new booking')
        .should('be.visible')
        .and('have.class', 'govuk-button--secondary')

      cy.contains('a.govuk-button', 'Start a new booking').should('have.attr', 'href', '/ppcs-search')
    })

    it('should render a Start a new booking button linking to the PPCS search page', () => {
      cy.visit(testPageUrl)

      cy.contains('a.govuk-button', 'Start a new booking').should('have.attr', 'href', '/ppcs-search')
    })
  })
})
