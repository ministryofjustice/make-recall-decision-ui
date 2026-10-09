import { fakerEN as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from '../util'
import ppcsPaths from '../../../../../server/routes/paths/ppcs.paths'
import testRadioButtons from '../../../../componentTests/radioButtons.tests'
import config from '../../../../../server/config'
import { testStandardBackLink } from '../../../../componentTests/backLink.tests'
import testContinueButton from '../../../../componentTests/continueButton.tests'

context('Edit MAPPA Level page', () => {
  const recommendationResponse = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${recommendationResponse.id}/${ppcsPaths.editMappaLevel}`
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]
  const ppudMappaLevels = faker.helpers.multiple(() => faker.lorem.words(), { count: { min: 3, max: 6 } })

  beforeEach(() => {
    setUpSessionForPpcs()
    cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
    cy.task('getReferenceList', {
      name: 'mappa-levels',
      statusCode: 200,
      response: {
        values: ppudMappaLevels,
      },
    })
  })

  describe('Page Data', () => {
    function checkHeaderData() {
      cy.title().should('equal', `Edit MAPPA level - ${config.applicationName}`)

      testStandardBackLink()

      cy.pageHeading().should('equal', 'Edit MAPPA level')
    }

    function checkPartASection(expectedLevelText: string) {
      cy.get('.car-text-list').within(() => {
        cy.get('.govuk-heading-m').should('contain', 'From Part A')
        cy.get('.car-text-list__row').within(() => {
          cy.get('.car-text-list__key').should('contain', 'MAPPA Level')
          cy.get('.car-text-list__value').should('contain', expectedLevelText)
        })
      })
    }

    it('No value pre-selected', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          bookRecallToPpud: {
            ...recommendationResponse.bookRecallToPpud,
            mappaLevel: undefined,
          },
        },
      })

      cy.visit(testPageUrl)

      checkHeaderData()

      checkPartASection(`Level ${recommendationResponse.personOnProbation.mappa.level}`)

      testRadioButtons(cy.get('.govuk-form-group'), {
        legend: {
          text: 'Edit MAPPA level',
        },
        options: ppudMappaLevels.map((mappaLevel, index) => ({
          input: {
            id: index > 0 ? `mappaLevel-${index + 1}` : 'mappaLevel',
            value: mappaLevel,
          },
          label: {
            text: mappaLevel,
          },
        })),
      })

      testContinueButton()
    })

    it('With pre-selected value', () => {
      const selectedMappaLevel = faker.helpers.arrayElement(ppudMappaLevels)
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          bookRecallToPpud: {
            ...recommendationResponse.bookRecallToPpud,
            mappaLevel: selectedMappaLevel,
          },
        },
      })

      cy.visit(testPageUrl)

      checkHeaderData()

      checkPartASection(`Level ${recommendationResponse.personOnProbation.mappa.level}`)

      testRadioButtons(cy.get('.govuk-form-group'), {
        legend: {
          text: 'Edit MAPPA level',
        },
        options: ppudMappaLevels.map((mappaLevel, index) => ({
          input: {
            id: index > 0 ? `mappaLevel-${index + 1}` : 'mappaLevel',
            value: mappaLevel,
            checked: mappaLevel === selectedMappaLevel,
          },
          label: {
            text: mappaLevel,
          },
        })),
      })

      testContinueButton()
    })

    it('Undefined Part A MAPPA', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          personOnProbation: {
            mappa: null,
          },
        },
      })

      cy.visit(testPageUrl)

      checkPartASection('N/A')
    })

    it('Undefined Part A MAPPA level', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          personOnProbation: {
            mappa: {
              level: null,
            },
          },
        },
      })

      cy.visit(testPageUrl)

      checkPartASection('N/A')
    })
  })
})
