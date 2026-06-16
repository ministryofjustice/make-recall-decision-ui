import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'

context('Edit CRO page', () => {
  const recommendationResponse = RecommendationResponseGenerator.generate()

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  it('shows validation error when CRO is empty and no Part A or PPUD CRO exists', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: { cro: null },
        prisonOffender: { cro: null },
        ppudOffender: null,
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(`/recommendations/${recommendationResponse.id}/edit-cro`)

    cy.get('#cro').clear()
    cy.get('button.govuk-button').click()

    cy.get('.govuk-error-summary').should('contain', 'There is a problem')
    cy.get('.govuk-error-summary').should('contain', 'Enter the CRO')
    cy.get('#cro-error').should('contain', 'Enter the CRO')
  })

  it('allows submission when CRO is empty but Part A CRO exists', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: { cro: null },
        prisonOffender: { cro: '789/01A' },
        ppudOffender: null,
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

    cy.visit(`/recommendations/${recommendationResponse.id}/edit-cro`)

    cy.get('#cro').clear()
    cy.get('button.govuk-button').click()

    cy.get('.govuk-error-summary').should('not.exist')
  })

  it('allows submission when CRO is empty but PPUD CRO exists', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: { cro: null },
        prisonOffender: { cro: null },
        ppudOffender: { croOtherNumber: '456/02B' },
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

    cy.visit(`/recommendations/${recommendationResponse.id}/edit-cro`)

    cy.get('#cro').clear()
    cy.get('button.govuk-button').click()

    cy.get('.govuk-error-summary').should('not.exist')
  })

  it('pre-populates CRO input with Part A value when bookRecallToPpud CRO is empty', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: { cro: null },
        prisonOffender: { cro: '789/01A' },
        ppudOffender: null,
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(`/recommendations/${recommendationResponse.id}/edit-cro`)

    cy.get('#cro').should('have.value', '789/01A')
  })

  it('shows "From Part A" section when prisonOffender CRO exists', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: { cro: null },
        prisonOffender: { cro: '789/01A' },
        ppudOffender: null,
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(`/recommendations/${recommendationResponse.id}/edit-cro`)

    cy.get('[data-qa="nomisCro"]').should('contain', '789/01A')
  })

  it('shows "There is a PPUD record but this field is blank." when ppudOffender exists but croOtherNumber is empty', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: { cro: null },
        prisonOffender: { cro: null },
        ppudOffender: { croOtherNumber: null },
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(`/recommendations/${recommendationResponse.id}/edit-cro`)

    cy.get('[data-qa="ppudCro"]').should('contain', 'There is a PPUD record but this field is blank.')
  })

  it('shows PPUD CRO value when ppudOffender croOtherNumber has a value', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: { cro: null },
        prisonOffender: { cro: null },
        ppudOffender: { croOtherNumber: '456/02B' },
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.visit(`/recommendations/${recommendationResponse.id}/edit-cro`)

    cy.get('[data-qa="ppudCro"]').should('contain', '456/02B')
  })
})
