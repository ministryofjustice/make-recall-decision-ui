import completeRecommendationResponse from '../../../../api/responses/get-recommendation.json'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import setUpSessionForPpcs from './util'

context('Add minute', () => {
  beforeEach(() => {
    setUpSessionForPpcs()

    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })

    cy.task('getSupportingDocuments', {
      statusCode: 200,
      response: [],
    })
  })

  describe('Add minute page', () => {
    it('displays the saved minute', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            minute: 'Cannot access OASys at the moment',
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.pageHeading().should('contain', 'Add a minute')

      cy.get('textarea[name="minute"]').should('exist').and('have.value', 'Cannot access OASys at the moment')
    })

    it('generates the default minute when no minute has been saved', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            status: 'ACTIVE IN',
            locationDescription: 'HMP Prison',
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          nomisIndexOffence: {
            allOptions: [
              {
                offenderChargeId: 3934369,
                courtDescription: 'Winchester Crown Court',
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.pageHeading().should('contain', 'Add a minute')

      cy.get('textarea[name="minute"]')
        .should('exist')
        .and('contain.value', 'Background information')
        .and('contain.value', 'All mandatory documents received')
        .and('contain.value', 'Extended sentence: No')
        .and('contain.value', 'Risk of serious harm level:')
        .and('contain.value', 'In custody: Yes (at HMP Prison)')
        .and('contain.value', 'Sentencing court: Winchester Crown Court')
        .and('contain.value', 'More information')
    })

    it('displays extended sentence as Yes for an extended sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          sentenceGroup: 'EXTENDED',
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          nomisIndexOffence: {
            allOptions: [
              {
                offenderChargeId: 3934369,
                courtDescription: 'Winchester Crown Court',
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.get('textarea[name="minute"]').should('contain.value', 'Extended sentence: Yes')
    })

    it('displays No when the offender is not in custody', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            status: 'ACTIVE OUT',
            locationDescription: 'HMP Prison',
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.get('textarea[name="minute"]').should('contain.value', 'In custody: No')
    })

    it('uses HMP Prison when the prison location is not available', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            status: 'ACTIVE IN',
            locationDescription: null,
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.get('textarea[name="minute"]').should('contain.value', 'In custody: Yes (at HMP Prison)')
    })

    it('displays the sentencing court from the selected NOMIS offence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          nomisIndexOffence: {
            allOptions: [
              {
                offenderChargeId: 111111,
                courtDescription: 'Manchester Crown Court',
              },
              {
                offenderChargeId: 3934369,
                courtDescription: 'Winchester Crown Court',
              },
            ],
            selected: 3934369,
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.get('textarea[name="minute"]')
        .should('contain.value', 'Sentencing court: Winchester Crown Court')
        .and('not.contain.value', 'Manchester Crown Court')
    })
  })

  describe('Submit minute', () => {
    it('saves the minute and redirects to the next page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.get('textarea[name="minute"]').clear()
      cy.get('textarea[name="minute"]').type('This is the updated recall minute')
      cy.get('button').click()

      cy.url().should('include', '/recommendations/252523937/')
    })

    it('submits the existing minute unchanged', () => {
      const minute =
        `BACKGROUND INFO \n` +
        `Extended sentence: YES\n` +
        `Risk of Serious Harm Level: VERY HIGH\n` +
        `In custody: YES at HMP\n` +
        `Sentencing court: Winchester Crown Court\n` +
        `More information\n` +
        ` Booking details reviewed and contersigned by Andy`

      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            minute,
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.get('textarea[name="minute"]').should('have.value', minute)

      cy.get('button').click()

      cy.url().should('include', '/recommendations/252523937/')
    })
  })
})
