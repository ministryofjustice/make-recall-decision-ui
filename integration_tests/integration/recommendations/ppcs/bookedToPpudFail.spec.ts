import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import BookingErrorType from '../../../../server/booking/BookingErrorType'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'

context('Booked to PPUD failed', () => {
  const recommendationId = faker.number.int()

  const recommendation = RecommendationResponseGenerator.generate({
    id: recommendationId,
    bookingMemento: {
      failed: true,
      errorType: BookingErrorType.DATA,
    },
  })

  const testPageUrl = `/recommendations/${recommendationId}/booked-to-ppud-fail`

  beforeEach(() => {
    setUpSessionForPpcs()

    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })
  })

  describe('Data error', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: recommendation,
      })
    })

    it('should display the data error page', () => {
      cy.visit(testPageUrl)

      cy.get('h1').should('contain', 'Recall booking not completed')

      cy.get('.govuk-body').should(
        'contain',
        'Something went wrong booking the recall to PPUD. You’ll need to go to PPUD to check what information’s there, and add anything that’s missing.',
      )

      cy.contains('a', 'View a summary of information to check in PPUD').should('have.attr', 'href', '/booking-summary')

      cy.contains('a.govuk-button', 'Open PPUD to complete the booking')
        .should('have.attr', 'href', 'https://internaltest.ppud.justice.gov.uk')
        .and('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')
    })
  })

  describe('Document upload error', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendation,
          bookingMemento: {
            failed: true,
            errorType: BookingErrorType.DOCUMENTS,
            uploadFailedDocName: 'Licence.pdf',
          },
        },
      })
    })

    it('should display the document upload error page', () => {
      cy.visit(testPageUrl)

      cy.get('h1').should('contain', 'Document not uploaded to PPUD')

      cy.get('.govuk-body').should('contain', 'The Licence.pdf did not upload to PPUD.')

      cy.contains('a', 'View a summary of information to check in PPUD').should('have.attr', 'href', '/booking-summary')

      cy.contains('a.govuk-button', 'Open PPUD to complete the booking')
        .should('have.attr', 'href', 'https://internaltest.ppud.justice.gov.uk')
        .and('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')
    })
  })

  describe('No uploadFailedDocName', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendation,
          bookingMemento: {
            failed: true,
            errorType: BookingErrorType.DOCUMENTS,
          },
        },
      })
    })

    it('should still render the document error page', () => {
      cy.visit(testPageUrl)

      cy.get('h1').should('contain', 'Document not uploaded to PPUD')

      cy.get('.govuk-body').should('contain', 'The document did not upload to PPUD')
    })
  })
})
