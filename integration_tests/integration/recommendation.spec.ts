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
      activeConvictions: [{ sentence: { isCustodial: true } }, { sentence: { isCustodial: true } }],
    },
  }

  describe('Create / update a recommendation', () => {
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
      cy.clickLink('Make a recommendation')
      cy.pageHeading().should('equal', 'Important')
    })

    it('shows an error if "Make a recommendation" creation fails', () => {
      const caseResponse = {
        ...getCaseOverviewResponse,
        activeRecommendation: undefined,
      }
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
      cy.task('createRecommendation', { statusCode: 500, response: 'API save error' })
      cy.visit(`${routeUrls.cases}/${crn}/create-recommendation-warning`)
      cy.clickButton('Continue')
      cy.getElement('An error occurred creating a new recommendation').should('exist')
    })

    it('update button links to Part A task list if recall is set', () => {
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallType: { selected: { value: 'STANDARD' } } },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.clickLink('Update recommendation')
      cy.pageHeading().should('equal', 'Create a decision not to recall letter')
    })

    it('display consider recall task list if "update recommendation"', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          recallConsideredList: null,
          recallType: { selected: { value: undefined } },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/`)
      cy.pageHeading().should('equal', 'Consider a recall')

      cy.getElement('What has made you think about recalling Paula Smith? To do').should('exist')
      cy.getElement('How has Paula Smith responded to probation so far? To do').should('exist')
      cy.getElement('What licence conditions has Paula Smith breached? To do').should('exist')
      cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
      cy.getElement('Is Paula Smith on an indeterminate sentence? To do').should('exist')
      cy.getElement('Is Paula Smith on an extended sentence? To do').should('exist')
    })

    it('present trigger-leading-to-recall', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-consider-recall`)
      cy.clickLink('What has made you think about recalling Paula Smith?')

      cy.pageHeading().should('equal', 'What has made you think about recalling Paula Smith?')

      cy.get('textarea').type('Some details')
      cy.get('button').click()

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('present share-case-with-manager', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-consider-recall`)

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Share this case with your manager')

      cy.clickLink('Continue')

      cy.pageHeading().should('equal', 'Discuss with your manager')
    })

    it('present discuss-with-manager', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/share-case-with-manager`)

      cy.clickLink('Continue')

      cy.pageHeading().should('equal', 'Discuss with your manager')

      cy.clickLink('Continue')

      cy.pageHeading().should('equal', 'What do you recommend?')
    })

    it('present task-list for all items completed', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.getElement("Request line manager's countersignature To do").should('exist')
      cy.getElement("Request senior manager's countersignature Cannot start yet").should('exist')

      cy.clickLink("Request line manager's countersignature")
      cy.pageHeading().should('equal', 'Request countersignature')
    })

    it('present task-list for SPO_SIGNATURE_REQUESTED', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_SIGNATURE_REQUESTED', active: true }] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.getElement("Request line manager's countersignature Requested").should('exist')
      cy.getElement("Request senior manager's countersignature Cannot start yet").should('exist')
    })

    it('present task-list for SPO_SIGNED', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_SIGNED', active: true }] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.getElement("Request line manager's countersignature Completed").should('exist')
      cy.getElement("Request senior manager's countersignature To do").should('exist')

      cy.clickLink("Request senior manager's countersignature")
      cy.pageHeading().should('equal', 'Request countersignature')
    })

    it('present task-list for SPO_SIGNED and ACO_SIGNATURE_REQUESTED', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNED', active: true },
          { name: 'ACO_SIGNATURE_REQUESTED', active: true },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.getElement("Request line manager's countersignature Completed").should('exist')
      cy.getElement("Request senior manager's countersignature Requested").should('exist')
    })

    it('present task-list for SPO_SIGNED and ACO_SIGNED', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNED', active: true },
          { name: 'ACO_SIGNED', active: true },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.getElement("Request line manager's countersignature Completed").should('exist')
      cy.getElement("Request senior manager's countersignature Completed").should('exist')
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
      cy.visit(`${routeUrls.cases}/${crn}/create-recommendation-warning`)
      cy.clickButton('Continue')
      cy.getElement('There is a problem').should('exist')
    })

    it('prevents viewing a recommendation if CRN is excluded', () => {
      cy.task('getRecommendation', { statusCode: 200, response: excludedResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions?flagCvl=0`)
      cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          hasAllConvictionsReleasedOnLicence: true,
          activeConvictions: [
            {
              sentence: { isCustodial: true, custodialStatusCode: 'B' },
              licenceConditions: [
                {
                  mainCategory: {
                    code: 'NLC5',
                    description: 'Freedom of movement',
                  },
                  subCategory: {
                    code: 'NST14',
                    description: 'On release to be escorted by police to Approved Premises',
                  },
                },
              ],
            },
          ],
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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

    it('licence conditions - CVL flag enabled - display CVL licence conditions', () => {
      const cvlLicenceConditionsBreached = {
        standardLicenceConditions: {
          selected: ['9ce9d594-e346-4785-9642-c87e764bee37'],
          allOptions: [{ code: '9ce9d594-e346-4785-9642-c87e764bee37', text: 'This is a standard licence condition' }],
        },
        additionalLicenceConditions: {
          selected: ['9ce9d594-e346-4785-9642-c87e764bee39', '9ce9d594-e346-4785-9642-c87e764bee41'],
          allOptions: [
            {
              code: '9ce9d594-e346-4785-9642-c87e764bee39',
              text: 'This is an additional licence condition',
            },
            { code: '9ce9d594-e346-4785-9642-c87e764bee41', text: 'Address approved Text' },
          ],
        },
        bespokeLicenceConditions: {
          selected: ['9ce9d594-e346-4785-9642-c87e764bee45'],
          allOptions: [{ code: '9ce9d594-e346-4785-9642-c87e764bee45', text: 'This is a bespoke condition' }],
        },
      }

      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, cvlLicenceConditionsBreached, licenceConditionsBreached: null },
      })
      cy.task('getCaseV2', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          hasAllConvictionsReleasedOnLicence: true,
          activeConvictions: [
            {
              sentence: { isCustodial: true, custodialStatusCode: 'B' },
              licenceConditions: [
                {
                  mainCategory: {
                    code: 'NLC5',
                    description: 'Freedom of movement',
                  },
                  subCategory: {
                    code: 'NST14',
                    description: 'On release to be escorted by police to Approved Premises',
                  },
                },
              ],
            },
          ],
          cvlLicence: {
            licenceStatus: 'ACTIVE',
            conditionalReleaseDate: '2022-06-10',
            actualReleaseDate: '2022-06-11',
            sentenceStartDate: '2022-06-12',
            sentenceEndDate: '2022-06-13',
            licenceStartDate: '4022-06-14',
            licenceExpiryDate: '2022-06-15',
            standardLicenceConditions: [
              {
                code: '9ce9d594-e346-4785-9642-c87e764bee37',
                text: 'This is a standard licence condition',
                expandedText: null as string,
                category: null as string,
              },
            ],
            additionalLicenceConditions: [
              {
                code: '9ce9d594-e346-4785-9642-c87e764bee39',
                text: 'This is an additional licence condition',
                expandedText: 'Expanded additional licence condition',
                category: 'Freedom of movement',
              },
            ],
            bespokeConditions: [
              {
                code: '9ce9d594-e346-4785-9642-c87e764bee45',
                text: 'This is a bespoke condition',
                expandedText: null as string,
                category: null as string,
              },
            ],
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions?flagCvl=1`)

      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'This is a standard licence condition'
      ).should('be.checked')

      cy.getSelectableOptionByLabel('What licence conditions has Paula Smith breached?', 'Freedom of movement').should(
        'be.checked'
      )

      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'This is a bespoke condition'
      ).should('be.checked')
    })

    it('licence conditions - CVL flag enabled - display Delius licence conditions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getCaseV2', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          hasAllConvictionsReleasedOnLicence: true,
          activeConvictions: [
            {
              sentence: { isCustodial: true, custodialStatusCode: 'B' },
              licenceConditions: [
                {
                  mainCategory: {
                    code: 'NLC5',
                    description: 'Freedom of movement',
                  },
                  subCategory: {
                    code: 'NST14',
                    description: 'On release to be escorted by police to Approved Premises',
                  },
                },
              ],
            },
          ],
          cvlLicence: null,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions?flagCvl=1`)

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
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions?flagCvl=0`)
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getCase', licenceConditionsMultipleActiveCustodial)
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getElement(
        'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
      ).should('exist')
      cy.getElement('What licence conditions has Paula Smith breached?').should('exist')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('licence conditions - shows message if person has no active custodial convictions', () => {
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions?flagCvl=0`)
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: {
          activeConvictions: [{ sentence: { isCustodial: false } }],
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getElement(
        'This person has no active convictions. Double-check that the information in NDelius is correct.'
      ).should('exist')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Consider a recall')
    })
  })

  describe('Personal details', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('lists personal details', () => {
      cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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

    it('shows error page if downstream error occurs', () => {
      cy.task('updateRecommendation', { statusCode: 500 })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/personal-details`, { failOnStatusCode: false })
      cy.pageHeading().should('equal', 'Sorry, there is a problem with the service')
    })

    it('lists offence details', () => {
      cy.task('updateRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
          activeConvictions: [
            {
              sentence: { isCustodial: true, custodialStatusCode: 'D' },
              licenceConditions: [],
            },
          ],
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
          activeConvictions: [
            {
              sentence: { isCustodial: true, custodialStatusCode: 'B' },
              licenceConditions: [],
            },
            {
              sentence: { isCustodial: true, custodialStatusCode: 'D' },
              licenceConditions: [],
            },
          ],
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-details`)
      cy.getElement(
        'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
      ).should('exist')
    })

    it('offence analysis - show index offence details', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          offencesMatch: false,
          offenceDataFromLatestCompleteAssessment: false,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
      cy.getText('indexOffenceDetails').should('contain', 'Index offence details')
      cy.getElement(
        "This is from the latest complete OASys assessment. There's a more recent assessment that's not complete."
      ).should('exist')

      cy.getElement(
        'The main offence in OASys does not match the main offence in NDelius. Double-check OASys and NDelius.'
      ).should('exist')
    })

    it('offence analysis - show index offence details - not latest offence', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          offencesMatch: true,
          offenceDataFromLatestCompleteAssessment: false,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
      cy.getText('indexOffenceDetails').should('contain', 'Index offence details')
      cy.getElement(
        "This is from the latest complete OASys assessment. There's a more recent assessment that's not complete."
      ).should('exist')

      cy.getElement(
        'The main offence in OASys does not match the main offence in NDelius. Double-check OASys and NDelius.'
      ).should('not.exist')
    })

    it('offence analysis - show index offence details - offence not matched', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          offencesMatch: false,
          offenceDataFromLatestCompleteAssessment: true,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
      cy.getText('indexOffenceDetails').should('contain', 'Index offence details')
      cy.getElement(
        "This is from the latest complete OASys assessment. There's a more recent assessment that's not complete."
      ).should('not.exist')

      cy.getElement(
        'The main offence in OASys does not match the main offence in NDelius. Double-check OASys and NDelius.'
      ).should('exist')
    })

    it('offence analysis - hide index offence details if not available', () => {
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, indexOffenceDetails: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.fillInput('Where can the police find Paula Smith?', '35 Hayward Rise, Carshalton, Surrey S1 8SH')
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'RECALL_DECIDED', active: true }] })
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('lists one address', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/mappa`)
      cy.getElement('Unknown MAPPA').should('exist')
    })

    it('Current risk of serious harm', () => {
      cy.signIn()
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, currentRoshForPartA: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/rosh`)
      // RoSH table
      cy.getElement('Last updated: 9 October 2021', { parent: '[data-qa="roshTable"]' }).should('exist')
      cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Children' }).then(rowValues => {
        expect(rowValues).to.deep.eq(['Medium', 'Low'])
      })
      cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Public' }).then(rowValues => {
        expect(rowValues).to.deep.eq(['High', 'Very high'])
      })
      cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Known adult' }).then(
        rowValues => {
          expect(rowValues).to.deep.eq(['High', 'Medium'])
        }
      )
      cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Staff' }).then(rowValues => {
        expect(rowValues).to.deep.eq(['Very high', 'High'])
      })
      cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Prisoners' }).then(rowValues => {
        expect(rowValues).to.deep.eq(['N/A', 'Medium'])
      })
    })
  })

  describe('SPO Countersignature Journey', () => {
    beforeEach(() => {
      cy.signIn({ hasSpoRole: true })
    })

    it('present Countersigning section on task list for SPO - line manager signature requested', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })

      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
          { name: 'SPO_SIGNED', active: false },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list/`)

      cy.pageHeading().should('contain', 'Part A for Paula Smith')

      cy.getElement('Line manager countersignature Requested').should('exist')
      cy.getElement('Senior manager countersignature Cannot start yet').should('exist')
    })

    it('present Countersigning section on task list for SPO - line manager signed', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })

      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: false },
          { name: 'SPO_SIGNED', active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list/`)

      cy.pageHeading().should('contain', 'Part A for Paula Smith')

      cy.getElement('Line manager countersignature Completed').should('exist')
      cy.getElement('Senior manager countersignature To do').should('exist')
    })

    it('present Countersigning section on task list for SPO - senior manager requested', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })

      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: false },
          { name: 'SPO_SIGNED', active: true },
          { name: 'ACO_SIGNATURE_REQUESTED', active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list/`)

      cy.pageHeading().should('contain', 'Part A for Paula Smith')

      cy.getElement('Line manager countersignature Completed').should('exist')
      cy.getElement('Senior manager countersignature Requested').should('exist')
    })

    it('present Countersigning section on task list for SPO - senior manager signed', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })

      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: false },
          { name: 'SPO_SIGNED', active: true },
          { name: 'ACO_SIGNATURE_REQUESTED', active: false },
          { name: 'ACO_SIGNED', active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list/`)

      cy.pageHeading().should('contain', 'Part A for Paula Smith')

      cy.getElement('Line manager countersignature Completed').should('exist')
      cy.getElement('Senior manager countersignature Completed').should('exist')
    })
  })

  describe('SPO Rationale Journey', () => {
    beforeEach(() => {
      cy.signIn({ hasSpoRole: true })
    })

    it("present Review Practitioner's concerns and return to task list", () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })

      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_CONSIDER_RECALL', active: true },
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink("Review practitioner's concerns")

      cy.pageHeading().should('equal', "Review practitioner's concerns")

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('present SPO Rationale and return to task list', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_CONSIDER_RECALL', active: true }] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Explain the decision')

      cy.pageHeading().should('equal', 'Explain the decision')

      cy.selectRadio('Explain the decision', 'Recall')

      cy.fillInput('Explain your decision', 'some text')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('present record decision and confirm', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          reviewPractitionersConcerns: true,
          reviewOffenderProfile: true,
          explainTheDecision: true,
          spoRecallType: 'RECALL',
          spoRecallRationale: 'while I nodded, nearly napping',
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_CONSIDER_RECALL', active: true },
          { name: 'SPO_RECORDED_RATIONALE', active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Record the decision')

      cy.pageHeading().should('equal', 'Record the decision in NDelius')

      cy.getText('reason').should('contain', 'while I nodded, nearly napping')

      cy.selectCheckboxes('Record the decision in NDelius', [
        'Contains sensitive information - do not show to the person on probation',
      ])

      cy.clickButton('Send to NDelius')

      cy.pageHeading().should('contains', 'Decision to recall')

      cy.getText('fullName').should('contain', 'Paula Smith')
      cy.getText('crn').should('contain', 'X12345')
    })

    it('present record decision (no recall) and confirm', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          reviewPractitionersConcerns: true,
          reviewOffenderProfile: true,
          explainTheDecision: true,
          spoRecallType: 'NO_RECALL',
          spoRecallRationale: 'while I nodded, nearly napping',
        },
      })

      // limitations of mocking in integration tests...
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_CONSIDER_RECALL', active: true },
          { name: 'SPO_RECORDED_RATIONALE', active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Record the decision')

      cy.pageHeading().should('equal', 'Record the decision in NDelius')

      cy.getText('reason').should('contain', 'while I nodded, nearly napping')

      cy.selectCheckboxes('Record the decision in NDelius', [
        'Contains sensitive information - do not show to the person on probation',
      ])

      cy.clickButton('Send to NDelius')

      cy.pageHeading().should('contains', 'Decision not to recall')

      cy.getText('fullName').should('contain', 'Paula Smith')
      cy.getText('crn').should('contain', 'X12345')
    })
  })
  describe('SPO Countersigning Journey', () => {
    beforeEach(() => {
      cy.signIn({ hasSpoRole: true })
    })

    it('present rationale check while countersigning', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
          { name: 'SPO_RECORDED_RATIONALE', active: false },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.clickLink('Line manager countersignature')

      cy.pageHeading().should('equal', 'You must record your rationale')
    })

    it('present telephone page after clicking no on rationale check', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
          { name: 'SPO_RECORDED_RATIONALE', active: false },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/rationale-check`)

      cy.selectRadio('You must record your rationale', 'No - countersign the Part A first and record rationale later')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Enter your telephone number')
    })

    it('present spo rationale task list after clicking yes on rationale check', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
          { name: 'SPO_CONSIDER_RECALL', active: true },
          { name: 'SPO_RECORDED_RATIONALE', active: false },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/rationale-check`)

      cy.selectRadio('You must record your rationale', 'Yes - use this service to record rationale in NDelius')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('present SPO Rationale and return to task list during countersigning', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_CONSIDER_RECALL', active: true },
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Explain the decision')

      cy.pageHeading().should('equal', 'Explain the decision to recall Paula Smith')

      cy.fillInput('Explain your decision', 'some text')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('present telephone entry while countersigning', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
          { name: 'SPO_RECORDED_RATIONALE', active: true },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.clickLink('Line manager countersignature')

      cy.pageHeading().should('equal', 'Enter your telephone number')
    })

    it('present rationale check while countersigning', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'SPO_SIGNATURE_REQUESTED', active: true }],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.clickLink('Line manager countersignature')

      cy.pageHeading().should('equal', 'You must record your rationale')
    })

    it('present telephone after rationale check', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'SPO_SIGNATURE_REQUESTED', active: true }],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/rationale-check`)

      cy.selectRadio('You must record your rationale', 'No - countersign the Part A first and record rationale later')
      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Enter your telephone number')
    })

    it('present rationale task list after rationale check', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_CONSIDER_RECALL', active: true },
          { name: 'SPO_SIGNATURE_REQUESTED', active: true },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/rationale-check`)

      cy.selectRadio('You must record your rationale', 'Yes - use this service to record rationale in NDelius')
      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('present countersign exposition while countersigning', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'SPO_SIGNATURE_REQUESTED', active: true }],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(
        `${routeUrls.recommendations}/${recommendationId}/countersigning-telephone?fromPageId=task-list&fromAnchor=countersign-part-a`
      )

      cy.pageHeading().should('equal', 'Enter your telephone number')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Line manager countersignature')
    })
    it('present countersign confirmation', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNED', active: true },
          { name: 'ACO_SIGNATURE_REQUESTED', active: false },
        ],
      })
      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/countersign-confirmation`)

      cy.pageHeading().should('contains', 'Part A countersigned')

      cy.getText('exposition').should('contain', 'Ask your senior manager to countersign this Part A:')
    })
  })
  describe('ACO Countersigning Journey', () => {
    beforeEach(() => {
      cy.signIn({ hasSpoRole: true })
    })

    it('present telephone entry while countersigning', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'ACO_SIGNATURE_REQUESTED', active: true }],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.clickLink('Senior manager countersignature')

      cy.pageHeading().should('equal', 'Enter your telephone number')
    })
    it('present task-list with create part A button', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'ACO_SIGNED', active: true }],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.clickLink('Create Part A')

      cy.pageHeading().should('equal', 'Part A created')
    })

    it('present countersign exposition while countersigning', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'ACO_SIGNATURE_REQUESTED', active: true }],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(
        `${routeUrls.recommendations}/${recommendationId}/countersigning-telephone?fromPageId=task-list&fromAnchor=countersign-part-a`
      )

      cy.pageHeading().should('equal', 'Enter your telephone number')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Senior manager countersignature')
    })
    it('present countersign confirmation', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'ACO_SIGNED', active: true },
          { name: 'ACO_SIGNATURE_REQUESTED', active: true },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/countersign-confirmation`)

      cy.pageHeading().should('contains', 'Part A countersigned')

      cy.getText('exposition').should('contain', "Tell the probation officer that you've countersigned the Part A.")
    })
  })
  describe('Admin Journey', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('present Who Completed Part A page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/who-completed-part-a/?flagProbationAdmin=1`)

      cy.pageHeading().should('contain', 'Who completed this Part A?')

      cy.fillInput('Name', 'Inspector Gadget')
      cy.fillInput('Email', 'gadget@me.com')
      cy.selectRadio('Is this person the probation practitioner for Paula Smith?', 'Yes')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('present Practitioner For Part A page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/practitioner-for-part-a/?flagProbationAdmin=1`)

      cy.pageHeading().should('contain', 'Practitioner for Paula Smith?')

      cy.fillInput('Name', 'Inspector Gadget')
      cy.fillInput('Email', 'gadget@me.com')

      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('present Revocation Order Recipients', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/revocation-order-recipients/?flagProbationAdmin=1`)

      cy.pageHeading().should('contain', 'Where should the revocation order be sent?')

      cy.fillInput('Enter email address', 'gadget@me.com')

      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })
    it('present PPCS Query Emails', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/ppcs-query-emails/?flagProbationAdmin=1`)

      cy.pageHeading().should('contain', 'Where should the PPCS respond with questions?')

      cy.fillInput('Enter email address', 'gadget@me.com')

      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })
  })
})
