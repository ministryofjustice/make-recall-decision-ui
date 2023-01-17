import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import excludedResponse from '../../api/responses/get-case-excluded.json'
import { setResponsePropertiesToNull } from '../support/commands'

context('Make a recommendation', () => {
  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    ...setResponsePropertiesToNull(completeRecommendationResponse),
    id: recommendationId,
    crn,
    personOnProbation: {
      name: 'Paula Smith',
      addresses: [
        {
          line1: '41 Newport Pagnell Rd',
          line2: 'Newtown',
          town: 'Northampton',
          postcode: 'NN4 6HP',
        },
      ],
    },
    recallType: { selected: { value: 'STANDARD' } },
    managerRecallDecision: {
      isSentToDelius: true,
    },
  }
  const licenceConditionsMultipleActiveCustodial = {
    sectionId: 'licence-conditions',
    statusCode: 200,
    response: {
      convictions: [
        {
          active: true,
          isCustodial: true,
          offences: [],
        },
        {
          active: true,
          isCustodial: true,
          offences: [],
        },
      ],
    },
  }

  describe('Create / update a recommendation', () => {
    describe('flagConsiderRecall not set', () => {
      beforeEach(() => {
        cy.signIn()
      })

      it('shows a "Make a recommendation" button if no active recommendation', () => {
        const caseResponse = {
          ...getCaseOverviewResponse,
          activeRecommendation: undefined,
        }
        cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
        cy.task('createRecommendation', { statusCode: 201, response: recommendationResponse })
        cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
        cy.visit(`${routeUrls.cases}/${crn}/overview`)
        cy.clickButton('Make a recommendation')
        cy.pageHeading().should('equal', 'How has Paula Smith responded to probation so far?')
      })

      it('shows an error if "Make a recommendation" creation fails', () => {
        const caseResponse = {
          ...getCaseOverviewResponse,
          activeRecommendation: undefined,
        }
        cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
        cy.task('createRecommendation', { statusCode: 500, response: 'API save error' })
        cy.visit(`${routeUrls.cases}/${crn}/overview`)
        cy.clickButton('Make a recommendation')
        cy.getElement('An error occurred creating a new recommendation').should('exist')
      })

      it('update button links to Part A task list if recall is set', () => {
        cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
        cy.task('getRecommendation', {
          statusCode: 200,
          response: { ...recommendationResponse, recallType: { selected: { value: 'STANDARD' } } },
        })
        cy.visit(`${routeUrls.cases}/${crn}/overview`)
        cy.clickLink('Update recommendation')
        cy.pageHeading().should('equal', 'Create a Part A form')
      })

      it('update button links to no recall task list if no recall is set', () => {
        cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
        cy.task('getRecommendation', {
          statusCode: 200,
          response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
        })
        cy.visit(`${routeUrls.cases}/${crn}/overview`)
        cy.clickLink('Update recommendation')
        cy.pageHeading().should('equal', 'Create a decision not to recall letter')
      })

      it('update button links to response to probation if recall decision has not been made yet', () => {
        cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
        cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: null } })
        cy.visit(`${routeUrls.cases}/${crn}/overview`)
        cy.clickLink('Update recommendation')
        cy.pageHeading().should('equal', 'How has Paula Smith responded to probation so far?')
      })
    })

    describe('flagConsiderRecall is set', () => {
      const recallConsideredDetail =
        'Paula has missed curfew tonight and smelling of alcohol recently in appointments. This links to his index offence of violence while under the influence.'
      const activeRecommendation = {
        recommendationId: '123',
        status: 'RECALL_CONSIDERED',
        recallConsideredList: [
          {
            createdDate: '2022-06-24T20:39:00.000Z',
            userName: 'Bill',
            recallConsideredDetail,
          },
        ],
      }
      describe('Probation officer', () => {
        beforeEach(() => {
          cy.signIn()
        })

        it('shows a "Consider a recall" button if no active recommendation, and complete form', () => {
          const caseResponse = {
            ...getCaseOverviewResponse,
            activeRecommendation: undefined,
          }
          cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
          cy.task('createRecommendation', { sstatusCode: 201, response: completeRecommendationResponse })
          cy.visit(`${routeUrls.cases}/${crn}/overview?flagConsiderRecall=1`)
          cy.clickLink('Consider a recall')
          cy.pageHeading().should('equal', 'What has made you think about recalling Paula Smith?')
          cy.fillInput('What has made you think about recalling Paula Smith?', 'Detail')
          cy.clickButton('Continue')
          cy.pageHeading().should('equal', 'Overview for Paula Smith')
        })

        it('shows a "Consider a recall" banner to the PO if there\'s an active recommendation', () => {
          cy.task('getCase', {
            sectionId: 'overview',
            statusCode: 200,
            response: {
              ...getCaseOverviewResponse,
              activeRecommendation,
            },
          })
          cy.task('updateRecommendation', {
            statusCode: 200,
            response: completeRecommendationResponse,
          })
          cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
          cy.visit(`${routeUrls.cases}/${crn}/overview?flagConsiderRecall=1`)
          cy.getText('recallConsideredDetail').should('equal', recallConsideredDetail)
          cy.getText('recallConsideredUserDate').should('equal', 'Bill, 24 June 2022 at 21:39')
          cy.getElement({ qaAttr: 'consider-recall-button' }).should('not.exist')
          cy.clickButton('Make a recommendation')
          cy.pageHeading().should('equal', 'How has Paula Smith responded to probation so far?')
        })

        // this scenario could occur if a user starts a recommendation before the consider recall feature is enabled,
        // and then returns to case summary. There will be an active recommendation, but no 'consider recall' data
        it('shows a "Update recommendation" button to the PO if an active recommendation with no consider recall data', () => {
          const caseResponse = {
            ...getCaseOverviewResponse,
            activeRecommendation: { recommendationId: 123 },
          }
          cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
          cy.visit(`${routeUrls.cases}/${crn}/overview?flagConsiderRecall=1`)
          cy.clickLink('Update recommendation')
          cy.pageHeading().should('equal', 'Create a Part A form')
        })

        it('stop and think page shown if no consider recall text', () => {
          cy.task('getRecommendation', {
            statusCode: 200,
            response: { ...recommendationResponse, recallConsideredList: null },
          })
          cy.visit(`${routeUrls.recommendations}/${recommendationId}/manager-review?flagConsiderRecall=1`)
          cy.pageHeading().should('equal', 'Stop and think')
        })
      })

      describe('Senior probation officer', () => {
        beforeEach(() => {
          cy.signIn({ hasSpoRole: true })
        })

        it('does not show a "Consider a recall" button or banner if no active recommendation', () => {
          const caseResponse = {
            ...getCaseOverviewResponse,
            activeRecommendation: undefined,
          }
          cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
          cy.task('createRecommendation', { sstatusCode: 201, response: completeRecommendationResponse })
          cy.visit(`${routeUrls.cases}/${crn}/overview?flagConsiderRecall=1`)
          cy.getElement('Consider a recall').should('not.exist')
          cy.getElement({ qaAttr: 'recallConsideredDetail' }).should('not.exist')
        })

        it('shows a "Consider a recall" banner to the SPO if there\'s an active recommendation', () => {
          cy.task('getCase', {
            sectionId: 'overview',
            statusCode: 200,
            response: {
              ...getCaseOverviewResponse,
              activeRecommendation,
            },
          })
          cy.task('getRecommendation', {
            statusCode: 200,
            response: { ...completeRecommendationResponse, managerRecallDecision: null },
          })
          cy.visit(`${routeUrls.cases}/${crn}/overview?flagConsiderRecall=1`)
          cy.getText('recallConsideredDetail').should('equal', recallConsideredDetail)
          cy.getText('recallConsideredUserDate').should('equal', 'Bill, 24 June 2022 at 21:39')
          cy.clickLink('Record your decision')
          cy.pageHeading().should('equal', 'Record your decision')
        })

        it('shows a View your decision link if the active recommendation has a recorded decision', () => {
          cy.task('getCase', {
            sectionId: 'overview',
            statusCode: 200,
            response: {
              ...getCaseOverviewResponse,
              activeRecommendation: {
                ...activeRecommendation,
                managerRecallDecision: { isSentToDelius: true },
              },
            },
          })
          cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
          cy.visit(`${routeUrls.cases}/${crn}/overview?flagConsiderRecall=1`)
          cy.clickLink('View your decision')
          cy.pageHeading().should('equal', 'Your decision')
        })

        it("shows an error if the Delius contact can't be created from the Record your decision in Delius page", () => {
          cy.task('getRecommendation', {
            statusCode: 200,
            response: { ...completeRecommendationResponse, managerRecallDecision: { selected: { value: 'RECALL' } } },
          })
          cy.task('updateRecommendation', { statusCode: 500, response: { error: 'DELIUS_CONTACT_CREATION_FAILED' } })
          cy.visit(
            `${routeUrls.recommendations}/${recommendationId}/manager-record-decision-delius?flagConsiderRecall=1`
          )
          cy.clickButton('Record your decision')
          cy.getElement('An error occurred creating a contact in NDelius').should('exist')
        })

        it('shows an error if the recommendation save errored from the Record your decision in Delius page', () => {
          cy.task('getRecommendation', {
            statusCode: 200,
            response: {
              ...completeRecommendationResponse,
              managerRecallDecision: { selected: { value: 'NO_RECALL' } },
            },
          })
          cy.task('updateRecommendation', { statusCode: 500, response: { error: 'RECOMMENDATION_UPDATE_FAILED' } })
          cy.visit(
            `${routeUrls.recommendations}/${recommendationId}/manager-record-decision-delius?flagConsiderRecall=1`
          )
          cy.clickButton('Record your decision')
          cy.getElement('An error occurred saving your changes to your recommendation').should('exist')
        })
      })
    })
  })

  describe('Restricted / excluded CRNs', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('prevents creating a recommendation if CRN is excluded', () => {
      const caseResponse = {
        ...getCaseOverviewResponse,
        activeRecommendation: undefined,
      }
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
      cy.task('createRecommendation', { statusCode: 403, response: excludedResponse })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.clickButton('Make a recommendation')
      cy.getElement('There is a problem').should('exist')
    })

    it('prevents updating a recommendation if CRN is excluded', () => {
      cy.task('updateRecommendation', { statusCode: 403, response: excludedResponse })
      cy.visit(`${routeUrls.recommendations}/123/custody-status`)
      cy.selectRadio('Is Paula Smith in custody now?', 'Yes, police custody')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Is Paula Smith in custody now?')
      cy.getElement('There is a problem').should('exist')
    })

    it('prevents viewing a recommendation if CRN is excluded', () => {
      cy.task('getRecommendation', { statusCode: 200, response: excludedResponse })
      cy.visit(`${routeUrls.recommendations}/123/custody-status`)
      cy.pageHeading().should('equal', 'Excluded case')
      cy.contains('You are excluded from viewing this offender record. Please contact OM John Smith').should('exist')
    })
  })

  describe('Licence conditions', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('licence conditions - select saved conditions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          convictions: [
            {
              active: true,
              isCustodial: true,
              offences: [],
              licenceConditions: [
                {
                  active: true,
                  licenceConditionTypeMainCat: {
                    code: 'NLC5',
                    description: 'Freedom of movement',
                  },
                  licenceConditionTypeSubCat: {
                    code: 'NST14',
                    description: 'On release to be escorted by police to Approved Premises',
                  },
                },
              ],
            },
          ],
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'Be of good behaviour and not behave in a way which undermines the purpose of the licence period'
      ).should('be.checked')

      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'Not commit any offence'
      ).should('be.checked')
      cy.getSelectableOptionByLabel('What licence conditions has Paula Smith breached?', 'Freedom of movement').should(
        'be.checked'
      )
    })

    it('licence conditions - shows banner if person has multiple active custodial convictions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getCase', licenceConditionsMultipleActiveCustodial)
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getElement(
        'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
      ).should('exist')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'What alternatives to recall have been tried already?')
    })

    it('licence conditions - shows message if person has no active custodial convictions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          convictions: [
            {
              active: false,
              isCustodial: true,
              offences: [],
            },
            {
              active: true,
              isCustodial: false,
              offences: [],
            },
          ],
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getElement(
        'There are no licence conditions. This person is not currently on licence. Double-check that the information in NDelius is correct.'
      ).should('exist')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'What alternatives to recall have been tried already?')
    })
  })

  describe('Personal details', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('lists personal details', () => {
      cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/personal-details`)
      cy.getDefinitionListValue('Name').should('contain', 'Paula Smith')
      cy.getDefinitionListValue('Gender').should('contain', 'Female')
      cy.getDefinitionListValue('Date of birth').should('contain', '14 November 2003')
      cy.getDefinitionListValue('Ethnic group').should('contain', 'White British')
      cy.getDefinitionListValue('Spoken').should('contain', 'English')
      cy.getDefinitionListValue('Written').should('contain', 'English')
      cy.getDefinitionListValue('CRO number').should('contain', '1234')
      cy.getDefinitionListValue('PNC number').should('contain', '1970/92832')
      cy.getDefinitionListValue('Prison number').should('contain', '456')
      cy.getDefinitionListValue('PNOMIS number').should('contain', 'A12345')
    })

    it('lists offence details', () => {
      cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-details`)
      cy.getDefinitionListValue('Main offence').should('equal', 'Burglary')
      cy.getDefinitionListValue('Date of offence').should('equal', '3 October 2021')
      cy.getDefinitionListValue('Date of sentence').should('equal', '11 March 2022')
      cy.getDefinitionListValue('Length of sentence').should('equal', '3 months')
      cy.getDefinitionListValue('Licence expiry date').should('equal', '5 February 2022')
      cy.getDefinitionListValue('Sentence expiry date').should('equal', '10 March 2022')
      cy.getDefinitionListValue('Custodial term').should('equal', '5 months')
      cy.getDefinitionListValue('Extended term').should('equal', '1 year')
    })

    it('offence details - banner if single conviction not on release', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, isExtendedSentence: false },
      })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          convictions: [
            {
              active: true,
              isCustodial: true,
              statusCode: 'D',
              offences: [],
              licenceConditions: [],
            },
          ],
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-details`)
      cy.getElement(
        'This person is not on licence in NDelius. Check the throughcare details in NDelius are correct.'
      ).should('exist')
      cy.getElement('Custodial term').should('not.exist')
      cy.getElement('Extended term').should('not.exist')
    })

    it('offence details - banner if multiples convictions and one not on release', () => {
      cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          convictions: [
            {
              active: true,
              isCustodial: true,
              statusCode: 'B',
              offences: [],
              licenceConditions: [],
            },
            {
              active: true,
              isCustodial: true,
              statusCode: 'D',
              offences: [],
              licenceConditions: [],
            },
          ],
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-details`)
      cy.getElement(
        'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
      ).should('exist')
    })

    it('offence analysis - show index offence details', () => {
      cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
      cy.getText('indexOffenceDetails').should('contain', 'Index offence details')
    })

    it('offence analysis - hide index offence details if not available', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, indexOffenceDetails: null },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
      cy.getElement('OASys 2.1 Brief offence(s) details').should('not.exist')
      cy.getElement({ qaAttr: 'indexOffenceDetails' }).should('not.exist')
    })

    it('lists multiple addresses', () => {
      const recommendationWithAddresses = {
        ...recommendationResponse,
        personOnProbation: {
          name: 'Paula Smith',
          addresses: [
            {
              line1: '41 Newport Pagnell Rd',
              line2: 'Newtown',
              town: 'Northampton',
              postcode: 'NN4 6HP',
            },
            {
              line1: 'The Lodge, Hennaway Drive',
              line2: null,
              town: 'Corby',
              postcode: 'S2 3HU',
            },
          ],
        },
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.getElement(
        'These are the last known addresses for Paula Smith in NDelius. If they are incorrect, update NDelius.'
      )
      cy.getText('address-1').should('contain', '41 Newport Pagnell Rd')
      cy.getText('address-1').should('contain', 'Newtown')
      cy.getText('address-1').should('contain', 'Northampton')
      cy.getText('address-1').should('contain', 'NN4 6HP')
      cy.getText('address-2').should('contain', 'The Lodge, Hennaway Drive')
      cy.getText('address-2').should('contain', 'Corby')
      cy.getText('address-2').should('contain', 'S2 3HU')
      cy.selectRadio('Can the police find Paula Smith at these addresses?', 'No')
    })

    it('lists a mixture of "No fixed abode" and addresses', () => {
      const recommendationWithAddresses = {
        ...recommendationResponse,
        personOnProbation: {
          name: 'Paula Smith',
          addresses: [
            {
              line1: '41 Newport Pagnell Rd',
              line2: 'Newtown',
              town: 'Northampton',
              postcode: 'NN4 6HP',
            },
            {
              noFixedAbode: true,
            },
          ],
        },
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.getElement('These are the last known addresses for Paula Smith')
      cy.getText('address-1').should('contain', '41 Newport Pagnell Rd')
      cy.getText('address-1').should('contain', 'Newtown')
      cy.getText('address-1').should('contain', 'Northampton')
      cy.getText('address-1').should('contain', 'NN4 6HP')
      cy.getText('address-2').should('contain', 'No fixed abode')
    })

    it('shows a message if no addresses', () => {
      const recommendationWithAddresses = {
        ...recommendationResponse,
        personOnProbation: {
          name: 'Paula Smith',
          addresses: [],
        },
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.fillInput('Where can the police find Paula Smith?', '35 Hayward Rise, Carshalton, Surrey S1 8SH')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('lists one address', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.getElement('This is the last known address for Paula Smith')
      cy.getText('address-1').should('contain', '41 Newport Pagnell Rd')
      cy.getText('address-1').should('contain', 'Newtown')
      cy.getText('address-1').should('contain', 'Northampton')
      cy.getElement({ qaAttr: 'address-2' }).should('not.exist')
    })
  })

  describe('Risk profile', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('shows MAPPA data', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          personOnProbation: {
            ...completeRecommendationResponse.personOnProbation,
            mappa: {
              category: 0,
              level: 1,
              lastUpdatedDate: '2022-11-04',
            },
          },
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/mappa`)
      cy.getElement('Cat 0/Level 1 MAPPA').should('exist')
      cy.getElement('Last updated: 4 November 2022').should('exist')
    })

    it('shows a Unknown MAPPA heading if no data', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          personOnProbation: {
            ...completeRecommendationResponse.personOnProbation,
            mappa: null,
          },
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/mappa`)
      cy.getElement('Unknown MAPPA').should('exist')
    })
  })
})
