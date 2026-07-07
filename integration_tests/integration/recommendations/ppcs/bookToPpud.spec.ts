import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'

context('Select PPUD Sentence', () => {
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
      custodyGroup: CUSTODY_GROUP.DETERMINATE,
      ppudSentenceId: '1',
    },
    bookingMemento: {
      failed: false,
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

    it('Where a PPUD sentence already exists', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.visit(testPageUrl)

      cy.get('.govuk-panel.govuk-panel--confirmation').should('exist')

      cy.get('.govuk-panel__title').should('exist')

      cy.get('.govuk-panel.govuk-panel--confirmation')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-panel__title').should('contain.text', 'Booked on to PPUD')

          cy.get('.govuk-panel__body').eq(0).should('contain.text', 'John Doe')

          cy.get('.govuk-panel__body').eq(1).should('contain.text', 'NOMIS number: J80002')
        })

      cy.get('.govuk-heading-m').should('contain', 'What happens next')

      cy.get('.govuk-body').should(
        'contain',
        'You’ve added this recall to PPUD. A band 4 case manager will review and decide what recall type to use.',
      )

      cy.get('form').within(() => {
        cy.contains('button', 'Continue').should('be.visible')
      })
    })

    it('When user has had to create a new PPUD sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendation, ppudOffender: undefined },
      })
      cy.visit(testPageUrl)

      cy.get('.govuk-panel.govuk-panel--confirmation').should('exist')

      cy.get('.govuk-panel__title').should('exist')

      cy.get('.govuk-panel.govuk-panel--confirmation')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-panel__title').should('contain.text', 'Record created and booked on to PPUD')

          cy.get('.govuk-panel__body').eq(0).should('contain.text', 'John Doe')

          cy.get('.govuk-panel__body').eq(1).should('contain.text', 'NOMIS number: J80002')
        })

      cy.get('.govuk-heading-m').should('contain', 'What happens next')

      cy.get('.govuk-body').should(
        'contain',
        'You’ve added this recall to PPUD. A band 4 case manager will review and decide what recall type to use.',
      )

      cy.get('form').within(() => {
        cy.contains('button', 'Continue').should('be.visible')
      })
    })

    it('When Indeterminate sentences', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendation,
          bookRecallToPpud: { ...recommendation.bookRecallToPpud, custodyGroup: CUSTODY_GROUP.INDETERMINATE },
        },
      })
      cy.visit(testPageUrl)

      cy.get('.govuk-panel.govuk-panel--confirmation').should('exist')

      cy.get('.govuk-panel__title').should('exist')

      cy.get('.govuk-panel.govuk-panel--confirmation')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-panel__title').should('contain.text', 'Booked on in PPUD')

          cy.get('.govuk-panel__body').eq(0).should('contain.text', 'John Doe')

          cy.get('.govuk-panel__body').eq(1).should('contain.text', 'NOMIS number: J80002')
        })

      cy.get('.govuk-heading-m').should('contain', 'What happens next')

      cy.get('.govuk-body').should(
        'contain',
        'You’ve added this recall to PPUD and can issue the revocation order. A parole eligible casework (PEC) manager will be assigned to the case.',
      )

      cy.get('form').within(() => {
        cy.contains('button', 'Continue').should('be.visible')
      })
    })
  })

  describe('Error message display', () => {
    it('should display problem message and Try again button when bookingMemento failed', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendation, bookingMemento: { failed: true } },
      })
      cy.visit(testPageUrl)

      cy.get('.govuk-panel.govuk-panel--confirmation').should('not.exist')

      cy.get('[data-qa="error-list"]')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-error-summary__title').should('contain', 'There is a problem')

          cy.get('.govuk-error-summary__body').should('contain', 'Something went wrong sending the booking to PPUD')

          cy.get('a.govuk-link')
            .should('contain', 'View the information you tried to send to PPUD.')
            .and('have.attr', 'href', 'booking-summary')
        })

      cy.get('form').within(() => {
        cy.contains('button', 'Try again').should('be.visible')
      })
    })
  })
})
