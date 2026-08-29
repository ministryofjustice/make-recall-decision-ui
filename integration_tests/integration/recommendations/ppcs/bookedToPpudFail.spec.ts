import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import StageEnum from '../../../../server/booking/StageEnum'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'

context('Booked to PPUD failed', () => {
  const recommendationId = faker.number.int()

  const recommendation = RecommendationResponseGenerator.generate({
    id: recommendationId,
    bookingMemento: {
      failed: true,
      stage: StageEnum.POSTING_RECALL_DATA,
    },
  })

  const testPageUrl = `/recommendations/${recommendationId}/booked-to-ppud-fail`

  beforeEach(() => {
    setUpSessionForPpcs()

    cy.task('getStatuses', {
      statusCode: 200,
      response: [
        {
          name: RECOMMENDATION_STATUS.SENT_TO_PPCS,
          active: true,
        },
      ],
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

      cy.contains('a', 'View a summary of information to check in PPUD').should(
        'have.attr',
        'href',
        `/recommendations/${recommendation.id}/booking-summary`,
      )

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
            stage: StageEnum.UPLOADING_DOCUMENTS,
            uploadFailedDocName: 'Licence.pdf',
          },
        },
      })
    })

    it('should display the document upload error page', () => {
      cy.visit(testPageUrl)

      cy.get('h1').should('contain', 'Document not uploaded to PPUD')

      cy.get('.govuk-body').should(
        'contain',
        'The Licence.pdf did not upload to PPUD. You’ll need to go to PPUD to add the document manually and add any other missing documents.',
      )

      cy.contains('a', 'View a summary of information to check in PPUD').should(
        'have.attr',
        'href',
        `/recommendations/${recommendation.id}/booking-summary`,
      )

      cy.contains('a.govuk-button', 'Open PPUD to complete the booking')
        .should('have.attr', 'href', 'https://internaltest.ppud.justice.gov.uk')
        .and('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')
    })
  })

  describe('Document upload error without uploadFailedDocName', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendation,
          bookingMemento: {
            failed: true,
            stage: StageEnum.UPLOADING_DOCUMENTS,
          },
        },
      })
    })

    it('should use the default document name', () => {
      cy.visit(testPageUrl)

      cy.get('h1').should('contain', 'Document not uploaded to PPUD')

      cy.get('.govuk-body').should(
        'contain',
        'The document did not upload to PPUD. You’ll need to go to PPUD to add the document manually and add any other missing documents.',
      )
    })
  })

  describe('Minute upload error', () => {
    beforeEach(() => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendation,
          bookingMemento: {
            failed: true,
            stage: StageEnum.BOOKING_MINUTE,
          },
        },
      })
    })

    it('should display the minute upload error page', () => {
      cy.visit(testPageUrl)

      cy.get('h1').should('contain', 'Minute not uploaded to PPUD')

      cy.get('.govuk-body').should(
        'contain',
        'The minute did not upload to PPUD. You’ll need to go to PPUD to add it manually.',
      )

      cy.contains('a', 'View a summary of information to check in PPUD').should(
        'have.attr',
        'href',
        `/recommendations/${recommendation.id}/booking-summary`,
      )

      cy.contains('a.govuk-button', 'Open PPUD to add the minute')
        .should('have.attr', 'href', 'https://internaltest.ppud.justice.gov.uk')
        .and('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')
    })
  })
})
