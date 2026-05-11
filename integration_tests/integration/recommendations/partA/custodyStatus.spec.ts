import { faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import testRadioButtons from '../../../componentTests/radioButtons.tests'
import { CustodyStatus } from '../../../../server/@types/make-recall-decision-api/models/CustodyStatus'
import custodyStatus from '../../../../server/controllers/recommendations/custodyStatus/formOptions'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'

context('Custody status', () => {
  const recommendationId = faker.number.int()
  const testPageUrl = `/recommendations/${recommendationId}/custody-status`

  beforeEach(() => {
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  describe('Page data', () => {
    describe('Standard page load', () => {
      ;[true, false].forEach(ftr56Enabled => {
        describe(`with FTR56 ${ftr56Enabled ? 'enabled' : 'disabled'}`, () => {
          const testCases = [
            {
              description: 'with no custody status option selected',
              custodyStatus: undefined,
              custodyStatusDetails: undefined,
            },
            {
              description: 'with custody status option YES_PRISON selected',
              custodyStatus: CustodyStatus.selected.YES_PRISON,
              custodyStatusDetails: undefined,
            },
            {
              description: 'with custody status option YES_POLICE selected',
              custodyStatus: CustodyStatus.selected.YES_POLICE,
              custodyStatusDetails: faker.location.streetAddress(),
            },
            {
              description: 'with custody status option NO selected',
              custodyStatus: CustodyStatus.selected.NO,
              custodyStatusDetails: undefined,
            },
          ]
          testCases.forEach(testCase => {
            it(testCase.description, () => {
              const recommendation = RecommendationResponseGenerator.generate({
                custodyStatus: {
                  selected: testCase.custodyStatus ?? 'none',
                  details: testCase.custodyStatusDetails,
                },
              })
              cy.task('getRecommendation', { statusCode: 200, response: recommendation })

              cy.visit(`${testPageUrl}?flagFTR56Enabled=${ftr56Enabled ? '1' : '0'}`)

              cy.title().should('equal', `Is the person in custody now? - ${config.applicationName}`)
              cy.pageHeading().should('equal', `Is ${recommendation.personOnProbation.name} in custody now?`)
              testRadioButtons(cy.get('.govuk-form-group'), {
                legend: {
                  text: `Is ${recommendation.personOnProbation.name} in custody now?`,
                },
                options: [
                  {
                    input: {
                      id: 'custodyStatus',
                      name: '',
                      value: CustodyStatus.selected.YES_PRISON,
                      checked: recommendation.custodyStatus?.selected === CustodyStatus.selected.YES_PRISON,
                    },
                    label: {
                      text: custodyStatus.find(status => status.value === CustodyStatus.selected.YES_PRISON).text,
                    },
                  },
                  {
                    input: {
                      id: 'custodyStatus-2',
                      name: '',
                      value: CustodyStatus.selected.YES_POLICE,
                      checked: recommendation.custodyStatus?.selected === CustodyStatus.selected.YES_POLICE,
                    },
                    label: {
                      text: custodyStatus.find(status => status.value === CustodyStatus.selected.YES_POLICE).text,
                    },
                  },
                  {
                    input: {
                      id: 'custodyStatus-3',
                      name: '',
                      value: CustodyStatus.selected.NO,
                      checked: recommendation.custodyStatus?.selected === CustodyStatus.selected.NO,
                    },
                    label: {
                      text: custodyStatus.find(status => status.value === CustodyStatus.selected.NO).text,
                    },
                  },
                ],
              })

              if (ftr56Enabled) {
                cy.get('.govuk-radios__conditional').should('not.exist')
              } else if (!testCase.custodyStatusDetails) {
                cy.get('.govuk-radios__conditional')
                  .should('exist')
                  .should('have.class', 'govuk-radios__conditional--hidden')
                  .find('label')
                  .should('exist')
                  .should('have.attr', 'for', 'custodyStatusDetailsYesPolice')
              } else if (testCase.custodyStatusDetails) {
                cy.get('.govuk-radios__conditional')
                  .should('exist')
                  .should('not.have.class', 'govuk-radios__conditional--hidden')
                  .should('contain.text', testCase.custodyStatusDetails)
                  .find('label')
                  .should('exist')
                  .should('have.attr', 'for', 'custodyStatusDetailsYesPolice')
              }

              cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
            })
          })
        })
      })
    })
  })

  describe('Error message display', () => {
    ;[true, false].forEach(ftr56Enabled => {
      describe(`with FTR56 ${ftr56Enabled ? 'enabled' : 'disabled'}`, () => {
        it('Displays error message when no custody status option is selected', () => {
          const recommendation = RecommendationResponseGenerator.generate({
            custodyStatus: 'none',
          })
          cy.task('getRecommendation', { statusCode: 200, response: recommendation })

          cy.visit(`${testPageUrl}?flagFTR56Enabled=${ftr56Enabled ? '1' : '0'}`)

          cy.get('button').click()

          testForErrorPageTitle()
          testForErrorSummary([
            {
              href: 'custodyStatus',
              message: 'Select whether the person is in custody or not',
              checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
            },
          ])
        })
      })
    })

    it('Displays error message when custody status details are not provided for YES_POLICE option', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        custodyStatus: {
          selected: CustodyStatus.selected.YES_POLICE,
          details: '',
        },
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'custodyStatusDetailsYesPolice',
          message: 'Enter the custody address',
          errorStyleClass: 'govuk-textarea--error',
        },
      ])
    })
  })
})
