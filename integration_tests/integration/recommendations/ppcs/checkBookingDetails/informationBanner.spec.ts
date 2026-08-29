import { faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from '../util'
import CUSTODY_GROUP from '../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'

context('Check Booking Details - Information Banner', () => {
  const baseRecommendation = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${baseRecommendation.id}/check-booking-details`
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  it('shows information banner when non-enumerated Part A data differs from PPUD', () => {
    const recommendation = {
      ...baseRecommendation,
      bookRecallToPpud: {
        ...baseRecommendation.bookRecallToPpud,
        firstNames: 'Different First',
        lastName: 'Different Last',
        dateOfBirth: '1990-01-01',
        prisonNumber: 'DIFF123',
        cro: 'DIFF/CRO',
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
        legislationReleasedUnder: faker.string.alpha(10),
      },
      ppudOffender: {
        ...baseRecommendation.ppudOffender,
        firstNames: 'PPUD First',
        familyName: 'PPUD Last',
        dateOfBirth: '1985-05-05',
        prisonNumber: 'PPUD456',
        croOtherNumber: 'PPUD/CRO',
      },
      prisonOffender: {
        ...baseRecommendation.prisonOffender,
        status: 'ACTIVE IN',
      },
    }
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
    const acoSignedStatus = {
      name: RECOMMENDATION_STATUS.ACO_SIGNED,
      active: true,
      createdByUserFullName: faker.person.fullName(),
      emailAddress: faker.internet.email(),
    }
    cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

    cy.visit(testPageUrl)

    cy.get('.moj-banner').should('exist')
    cy.get('.moj-banner').should('contain', 'Some information here does not match what')
    cy.get('.moj-banner').should('contain', 'currently in PPUD')
    cy.get('.moj-banner').should('contain', 'From PPUD')
    cy.get('.moj-banner').should('contain', 'First name:')
    cy.get('.moj-banner').should('contain', 'PPUD First')
    cy.get('.moj-banner').should('contain', 'Last name:')
    cy.get('.moj-banner').should('contain', 'PPUD Last')
    cy.get('.moj-banner').should('contain', 'Prison booking number:')
    cy.get('.moj-banner').should('contain', 'PPUD456')
    cy.get('.moj-banner').should('contain', 'Date of birth:')
    cy.get('.moj-banner').should('contain', 'CRO:')
    cy.get('.moj-banner').should('contain', 'PPUD/CRO')
  })

  it('does not show information banner when Part A data matches PPUD', () => {
    const recommendation = {
      ...baseRecommendation,
      bookRecallToPpud: {
        ...baseRecommendation.bookRecallToPpud,
        firstNames: 'Same First',
        lastName: 'Same Last',
        dateOfBirth: '1990-01-01',
        prisonNumber: 'SAME123',
        cro: 'SAME/CRO',
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
        legislationReleasedUnder: faker.string.alpha(10),
      },
      ppudOffender: {
        ...baseRecommendation.ppudOffender,
        firstNames: 'Same First',
        familyName: 'Same Last',
        dateOfBirth: '1990-01-01',
        prisonNumber: 'SAME123',
        croOtherNumber: 'SAME/CRO',
      },
      prisonOffender: {
        ...baseRecommendation.prisonOffender,
        status: 'ACTIVE IN',
      },
    }
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
    const acoSignedStatus = {
      name: RECOMMENDATION_STATUS.ACO_SIGNED,
      active: true,
      createdByUserFullName: faker.person.fullName(),
      emailAddress: faker.internet.email(),
    }
    cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

    cy.visit(testPageUrl)

    cy.get('.moj-banner--information').should('not.exist')
  })

  it('does not show information banner when no PPUD offender exists', () => {
    const recommendation = {
      ...baseRecommendation,
      ppudOffender: undefined,
      bookRecallToPpud: {
        ...baseRecommendation.bookRecallToPpud,
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
        legislationReleasedUnder: faker.string.alpha(10),
      },
      prisonOffender: {
        ...baseRecommendation.prisonOffender,
        status: 'ACTIVE IN',
      },
    }
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
    const acoSignedStatus = {
      name: RECOMMENDATION_STATUS.ACO_SIGNED,
      active: true,
      createdByUserFullName: faker.person.fullName(),
      emailAddress: faker.internet.email(),
    }
    cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

    cy.visit(testPageUrl)

    cy.get('.moj-banner--information').should('not.exist')
  })
})
