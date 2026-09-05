import { fakerEN_GB as faker } from '@faker-js/faker'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import setUpSessionForPpcs from './util'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { SentenceGroup } from '../../../../server/controllers/recommendations/sentenceInformation/formOptions'
import { RoshEnum } from '../../../../server/@types/make-recall-decision-api/models/RoshData'

const recommendationId = faker.number.int()
const completeRecommendationResponse = RecommendationResponseGenerator.generate({
  id: recommendationId,
  nomisIndexOffence: {
    selectedIndex: 1,
  },
  personOnProbation: {
    nomsNumber: 'J80002',
  },
  bookRecallToPpud: {
    firstName: 'John',
    lastName: 'Doe',
    ppudSentenceId: '1',
  },
})

context('Add minute', () => {
  beforeEach(() => {
    setUpSessionForPpcs()

    cy.task('getStatuses', {
      statusCode: 200,
      response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
    })
  })

  describe('Add minute page', () => {
    it('displays the default minute when no minute has been saved', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          sentenceGroup: SentenceGroup.EXTENDED,
          currentRoshForPartA: {
            riskToChildren: RoshEnum.LOW,
            riskToPublic: RoshEnum.LOW,
            riskToKnownAdult: RoshEnum.LOW,
            riskToPrisoners: RoshEnum.HIGH,
            riskToStaff: RoshEnum.VERY_HIGH,
          },
          prisonOffender: {
            status: 'ACTIVE IN',
            locationDescription: 'Glasgow Prison',
          },
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
        .should('exist')
        .and(
          'have.value',
          `Background information
Extended sentence: Yes
Risk of serious harm level: VERY HIGH
In custody: Yes (at HMP Glasgow Prison)
Sentencing court: Winchester Crown Court

More information
`,
        )
    })
    it('displays the saved minute', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          personOnProbation: {
            name: 'Joseph Bluggs',
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            minute: 'Last time saved minutes here',
          },
        },
      })

      cy.visit(`/recommendations/252523937/add-minute`)

      cy.get('textarea[name="minute"]').should('have.value', 'Last time saved minutes here')
    })

    it('uses HMP Prison when the prison location is not available', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            status: 'ACTIVE IN',
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        },
      })
      cy.visit(`/recommendations/252523937/add-minute`)
      cy.get('textarea[name="minute"]').should('contain.value', 'In custody: Yes')
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
})
