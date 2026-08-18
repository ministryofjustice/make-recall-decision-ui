import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'

context('Book to PPUD', () => {
  const recommendationId = faker.number.int()

  const recommendation = RecommendationResponseGenerator.generate({
    nomisIndexOffence: {
      selectedIndex: 1,
    },
    id: recommendationId,
    personOnProbation: {
      nomsNumber: 'J80002',
    },
    bookRecallToPpud: {
      firstName: 'John',
      lastName: 'Doe',
      ppudSentenceId: '1',
    },
    ppudOffender: {
      id: '123',
    },
  })

  const testPageUrl = `/recommendations/${recommendationId}/book-to-ppud`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  describe('Book to Ppud', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
    })

    it('When PPUD record exists', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.visit(testPageUrl)

      cy.get('.govuk-heading-l').should('contain.text', 'Book John Doe onto PPUD')

      cy.get('.govuk-body').should(
        'contain',
        "You are creating a booking for John Doe. This will include all the information you've just checked.",
      )

      cy.get('.govuk-body').should('contain', 'It may take a few minutes to process.')

      cy.get('form').within(() => {
        cy.contains('button', 'Continue').should('be.visible')
      })
    })

    it('When no PPUD record exists', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendation, ppudOffender: undefined },
      })
      cy.visit(testPageUrl)

      cy.get('.govuk-heading-l').should('contain.text', 'Create new PPUD record for John Doe')

      cy.get('.govuk-body').should(
        'contain',
        "You are creating a new PPUD record for John Doe. This will include all the information you've just checked.",
      )

      cy.get('.govuk-body').should('contain', 'It may take a few minutes to process.')

      cy.get('form').within(() => {
        cy.contains('button', 'Continue').should('be.visible')
      })
    })
  })
})
