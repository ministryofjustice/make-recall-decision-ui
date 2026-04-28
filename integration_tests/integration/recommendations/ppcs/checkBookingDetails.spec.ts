import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'

context('Check Booking Details page', () => {
  const recommendationResponse = RecommendationResponseGenerator.generate()

  beforeEach(() => {
    cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
    cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
  })

  it('shows "You must enter a date" and "You must enter a time" when receivedDateTime is null', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: {
          receivedDateTime: null,
        },
        prisonOffender: {},
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

    cy.visit(`/recommendations/252523937/check-booking-details`)

    cy.get('#check-booking-recall-information-list').should('contain', 'You must enter a date')
    cy.get('#check-booking-recall-information-list').should('contain', 'You must enter a time')
  })

  it('check booking details shows the recall received date and time when receivedDateTimeUpdatedByPpcs is set', () => {
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
        bookRecallToPpud: {
          receivedDateTime: '2024-01-31T15:17:58Z',
          receivedDateTimeUpdatedByPpcs: true,
        },
        prisonOffender: {},
      },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

    cy.visit(`/recommendations/252523937/check-booking-details`)

    cy.get('#check-booking-recall-information-list').should('not.contain', 'You must enter a date')
    cy.get('#check-booking-recall-information-list').should('not.contain', 'You must enter a time')
    cy.get('#check-booking-recall-information-list').should('contain', '31 January 2024')
    cy.get('#check-booking-recall-information-list').should('contain', '15:17')
  })
})
