import { fakerEN_GB as faker } from '@faker-js/faker'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'

context('Booked to PPUD success', () => {
  const recommendationId = faker.number.int()

  const recommendation = RecommendationResponseGenerator.generate({
    nomisIndexOffence: {
      selectedIndex: 1,
    },
    id: recommendationId,
    personOnProbation: {
      nomsNumber: 'J80002',
      name: 'John Doe',
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

  const indeterminateRecommendation = RecommendationResponseGenerator.generate({
    nomisIndexOffence: {
      selectedIndex: 1,
    },
    id: faker.number.int(),
    personOnProbation: {
      nomsNumber: 'J80002',
      name: 'John Doe',
    },
    bookRecallToPpud: {
      firstName: 'John',
      lastName: 'Doe',
      custodyGroup: CUSTODY_GROUP.INDETERMINATE,
      ppudSentenceId: '1',
    },
    bookingMemento: {
      failed: false,
    },
  })

  const newSentenceRecommendation = RecommendationResponseGenerator.generate({
    nomisIndexOffence: {
      selectedIndex: 1,
    },
    id: faker.number.int(),
    personOnProbation: {
      nomsNumber: 'J80002',
      name: 'John Doe',
    },
    bookRecallToPpud: {
      firstName: 'John',
      lastName: 'Doe',
      custodyGroup: CUSTODY_GROUP.INDETERMINATE,
      ppudSentenceId: 'ADD_NEW',
    },
    bookingMemento: {
      failed: false,
    },
  })

  const testPageUrl = `/recommendations/${recommendationId}/booked-to-ppud-success`

  beforeEach(() => {
    setUpSessionForPpcs()

    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.BOOKED_TO_PPUD, active: true }],
    })
  })

  describe('Determinate sentence', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: recommendation,
      })

      cy.visit(testPageUrl)
    })

    it('should display the booked on to PPUD confirmation', () => {
      cy.get('.govuk-panel.govuk-panel--confirmation')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-panel__title').should('be.visible').and('contain.text', 'Booked on to PPUD')

          cy.get('.govuk-panel__body').eq(0).should('contain.text', 'John Doe')

          cy.get('.govuk-panel__body').eq(1).should('contain.text', 'NOMIS number: J80002')
        })
    })

    it('should display the what happens next content', () => {
      cy.get('.govuk-heading-m').should('be.visible').and('contain.text', 'What happens next')

      cy.get('.govuk-body').should(
        'contain.text',
        'You’ve added this recall to PPUD and can issue the revocation order. A parole eligible casework (PEC) manager will be assigned to the case.',
      )
    })
  })

  describe('Indeterminate sentence', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: indeterminateRecommendation,
      })

      cy.visit(testPageUrl)
    })

    it('should display the booked on in PPUD confirmation', () => {
      cy.get('.govuk-panel.govuk-panel--confirmation')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-panel__title').should('be.visible').and('contain.text', 'Booked on in PPUD')

          cy.get('.govuk-panel__body').eq(0).should('contain.text', 'John Doe')

          cy.get('.govuk-panel__body').eq(1).should('contain.text', 'NOMIS number: J80002')
        })
    })

    it('should display the standard what happens next content', () => {
      cy.get('.govuk-heading-m').should('be.visible').and('contain.text', 'What happens next')

      cy.get('.govuk-body').should(
        'contain.text',
        'You’ve added this recall to PPUD. A band 4 case manager will review and decide what recall type to use.',
      )
    })
  })

  describe('New sentence', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: newSentenceRecommendation,
      })

      cy.visit(testPageUrl)
    })

    it('should display the record created and booked on to PPUD confirmation', () => {
      cy.get('.govuk-panel.govuk-panel--confirmation')
        .should('be.visible')
        .within(() => {
          cy.get('.govuk-panel__title').should('be.visible').and('contain.text', 'Record created and booked on to PPUD')

          cy.get('.govuk-panel__body').eq(0).should('contain.text', 'John Doe')

          cy.get('.govuk-panel__body').eq(1).should('contain.text', 'NOMIS number: J80002')
        })
    })

    it('should display the standard what happens next content', () => {
      cy.get('.govuk-heading-m').should('be.visible').and('contain.text', 'What happens next')

      cy.get('.govuk-body').should(
        'contain.text',
        'You’ve added this recall to PPUD. A band 4 case manager will review and decide what recall type to use.',
      )
    })
  })

  describe('Start a new booking', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: recommendation,
      })

      cy.visit(testPageUrl)
    })

    it('should render a Start a new booking button linking to the PPCS search page', () => {
      cy.contains('a.govuk-button', 'Start a new booking')
        .should('be.visible')
        .and('have.class', 'govuk-button--secondary')
        .and('have.attr', 'href', '/ppcs-search')
    })
  })
})
