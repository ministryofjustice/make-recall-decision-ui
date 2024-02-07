import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import excludedResponse from '../../api/responses/get-case-excluded.json'
import { setResponsePropertiesToNull } from '../support/commands'
import { caseTemplate } from '../fixtures/CaseTemplateBuilder'
import { standardActiveConvictionTemplate } from '../fixtures/ActiveConvictionTemplateBuilder'
import { deliusLicenceConditionDoNotPossess } from '../fixtures/DeliusLicenceConditionTemplateBuilder'

context('Make a recommendation', () => {
  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    ...setResponsePropertiesToNull(completeRecommendationResponse),
    id: recommendationId,
    createdDate: '2000-10-31T01:30:00.000Z',
    createdByUserFullName: 'Mr Anderson',
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

    it('shows a warning page if "Make a recommendation" is submitted while another recommendation exists', () => {
      const caseResponse = {
        ...getCaseOverviewResponse,
      }
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })

      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/create-recommendation-warning`)
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'There is already a recommendation for Paula Smith')
      cy.getElement('Mr Anderson started this recommendation on 31 October 2000.').should('exist')

      cy.clickLink('Update recommendation')
      cy.pageHeading().should('equal', 'Create a Part A form')
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

      cy.clickLink('Continue to make a recommendation')

      cy.pageHeading().should('equal', 'Discuss with your manager')
    })

    it('share-case-with-manager CTA returns to overview', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-consider-recall`)

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Share this case with your manager')

      cy.clickLink('Return to overview')

      cy.pageHeading().should('equal', 'Overview for Paula Smith')
    })

    it('present discuss-with-manager', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/share-case-with-manager`)

      cy.clickLink('Continue to make a recommendation')

      cy.pageHeading().should('equal', 'Discuss with your manager')

      cy.clickLink('Continue')

      cy.pageHeading().should('equal', 'What do you recommend?')

      cy.url().should('contain', 'recall-type-indeterminate')

      cy.getElement('Emergency recall').should('exist')
    })

    it('present discuss-with-manager', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null, isIndeterminateSentence: false },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/share-case-with-manager`)

      cy.clickLink('Continue to make a recommendation')

      cy.pageHeading().should('equal', 'Discuss with your manager')

      cy.clickLink('Continue')

      cy.pageHeading().should('equal', 'What do you recommend?')

      cy.url().should('contain', 'recall-type-extended')

      cy.getElement('No recall - send a decision not to recall letter').should('exist')
    })

    it('present what do you recommend for extended sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          recallConsideredList: null,
          isIndeterminateSentence: false,
        },
      })

      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-extended`)

      cy.pageHeading().should('equal', 'What do you recommend?')

      cy.selectRadio('What do you recommend?', 'No recall - send a decision not to recall letter')

      cy.getElement('No recall - send a decision not to recall letter').should('exist')

      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          recallConsideredList: null,
          isIndeterminateSentence: false,
          recallType: { selected: { value: 'NO_RECALL' } }, // we set this so that the correct task list page loads when continue button is pushed.
        },
      })

      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Create a decision not to recall letter')
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
      cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task(
        'getCaseV2',
        caseTemplate()
          .withActiveConviction(
            standardActiveConvictionTemplate()
              .withDescription('Robbery - 05714')
              .withLicenceCondition(deliusLicenceConditionDoNotPossess())
          )
          .withAllConvictionsReleasedOnLicence()
          .build()
      )

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'Be of good behaviour and not behave in a way which undermines the purpose of the licence period'
      ).should('be.checked')

      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'Not commit any offence'
      ).should('be.checked')
      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'Poss, own, control, inspect specified items /docs'
      ).should('be.checked')
    })

    it('licence conditions - display CVL licence conditions', () => {
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

      cy.task(
        'getCaseV2',
        caseTemplate()
          .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05714'))
          .withAllConvictionsNotReleasedOnLicence()
          .withCvlLicence()
          .build()
      )

      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)

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

    it('licence conditions - display Delius licence conditions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })

      cy.task(
        'getCaseV2',
        caseTemplate()
          .withActiveConviction(
            standardActiveConvictionTemplate()
              .withDescription('Burglary - 05714')
              .withLicenceCondition(deliusLicenceConditionDoNotPossess())
          )
          .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05727'))
          .withAllConvictionsNotReleasedOnLicence()
          .build()
      )

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
      cy.getSelectableOptionByLabel(
        'What licence conditions has Paula Smith breached?',
        'Poss, own, control, inspect specified items /docs'
      ).should('be.checked')
    })

    it('licence conditions - shows banner if person has multiple active custodial convictions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task(
        'getCaseV2',
        caseTemplate()
          .withActiveConviction(standardActiveConvictionTemplate().withDescription('Burglary - 05714'))
          .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05727'))
          .withAllConvictionsNotReleasedOnLicence()
          .build()
      )

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getElement(
        'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.'
      ).should('exist')
      cy.getElement('What licence conditions has Paula Smith breached?').should('exist')
    })

    it('licence conditions - shows message if person has no active custodial convictions', () => {
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.task(
        'getCaseV2',
        caseTemplate()
          .withActiveConviction(
            standardActiveConvictionTemplate().withDescription('Burglary - 05714').withNonCustodial()
          )
          .withActiveConviction(
            standardActiveConvictionTemplate().withDescription('Robbery - 05727').withNonCustodial()
          )
          .withAllConvictionsNotReleasedOnLicence()
          .build()
      )

      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.getElement(
        'This person has no active convictions. Double-check that the information in NDelius is correct.'
      ).should('exist')
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
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
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
          ],
        },
      })

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
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
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
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
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

      cy.getElement({ qaAttr: 'licence-conditions-breached' }).click()

      cy.getText('licence-conditions-breached-panel').should('contain', 'Be of good behaviour')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it("present Review Practitioner's concerns and return to task list with CVL data", () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          licenceConditionsBreached: null,
          recallConsideredList: null,
          cvlLicenceConditionsBreached: {
            standardLicenceConditions: {
              selected: ['9ce9d594-e346-4785-9642-c87e764bee37'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee37',
                  text: 'This is a standard licence condition',
                },
              ],
            },
            additionalLicenceConditions: {
              selected: ['9ce9d594-e346-4785-9642-c87e764bee42'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee42',
                  text: 'This is an additional licence condition',
                },
              ],
            },
            bespokeLicenceConditions: {
              selected: ['9ce9d594-e346-4785-9642-c87e764bee43'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee43',
                  text: 'This is a bespoke licence condition',
                },
              ],
            },
          },
        },
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

      cy.getElement({ qaAttr: 'licence-conditions-breached' }).click()

      cy.getText('licence-conditions-breached-panel').should('contain', 'This is a standard licence condition')

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('enter SPO Rationale and return to task list', () => {
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

    it('enter SPO Rationale (no Recall)', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_CONSIDER_RECALL', active: true }] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Explain the decision')

      cy.url().should('contain', 'spo-rationale')

      cy.pageHeading().should('equal', 'Explain the decision')

      cy.selectRadio('Explain the decision', 'Do not recall - send a decision not to recall letter')

      cy.clickButton('Continue')

      cy.url().should('contain', 'spo-why-no-recall')

      cy.pageHeading().should('equal', 'Why do you think Paula Smith should not be recalled?')

      cy.fillTextareaByName('spoNoRecallRationale', 'some text')

      cy.clickButton('Continue')

      cy.url().should('contain', 'spo-senior-manager-endorsement')

      cy.pageHeading().should('equal', 'Senior manager endorsement')

      cy.clickLink('Continue')

      cy.url().should('contain', 'spo-task-list-consider-recall')

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

      cy.task('updateStatuses', { statusCode: 200, response: [] })

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

      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.clickButton('Send to NDelius')

      cy.pageHeading().should('contains', 'Decision not to recall')

      cy.getText('fullName').should('contain', 'Paula Smith')
      cy.getText('crn').should('contain', 'X12345')
    })
  })
  describe('SPO Countersigning Journey', () => {
    beforeEach(() => {
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
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
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
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
    it('present notification on telephone entry page if same signer', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: 'SPO_SIGNED', active: true, createdBy: 'USER1' },
          { name: 'ACO_SIGNATURE_REQUESTED', active: true },
        ],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.clickLink('Senior manager countersignature')

      cy.getElement('You have already countersigned this recall').should('exist')

      cy.getElement('Enter your telephone number').should('exist')
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
    it('present task-list with spo exposition', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, countersignSpoExposition: 'reasons' },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'ACO_SIGNED', active: true }],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.getElement({ qaAttr: 'spo-exposition' }).should('have.text', 'reasons')
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
    it('present Preview Part A page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/preview-part-a/?flagProbationAdmin=1`)

      cy.pageHeading().should('contain', 'Preview Part A')

      cy.getElement('Download preview of Part A').should('exist')
    })
  })
  describe('PPCS Journey', () => {
    beforeEach(() => {
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    })
    it('landing page for PPCS', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.start}`)

      cy.pageHeading().should('contain', 'Check and book a recall')
    })

    it('Find a rec doc', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`/ppcs-search`)

      cy.pageHeading().should('contain', 'Find a person to book on')
    })

    it('search results', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('ppcsSearch', {
        statusCode: 200,
        response: {
          results: [
            {
              name: 'Harry Smith',
              crn: 'X098092',
              dateOfBirth: '1980-05-06',
              recommendationId: 799270715,
            },
          ],
        },
      })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`/ppcs-search-results?crn=X098092`)

      cy.pageHeading().should('contain', 'Search results')
    })

    it('search ppud', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('ppcsSearch', {
        statusCode: 200,
        response: {
          results: [
            {
              name: 'Harry Smith',
              crn: 'X098092',
              dateOfBirth: '1980-05-06',
              recommendationId: 799270715,
            },
          ],
        },
      })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`/recommendations/252523937/search-ppud`)

      cy.pageHeading().should('contain', 'Use these details to search PPUD')
    })

    it('search ppud results', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('searchPpud', {
        statusCode: 200,
        response: {
          results: [
            {
              id: '4F6666656E64657269643D313731383138G725H664',
              croNumber: '123456/12A',
              nomsId: 'JG123POE',
              firstNames: 'John',
              familyName: 'Teal',
              dateOfBirth: '2000-01-01',
            },
          ],
        },
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`/recommendations/252523937/search-ppud-results`)
      cy.pageHeading().should('contain', 'PPUD record found')
    })

    it('check booking details', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('searchForPrisonOffender', {
        statusCode: 200,
        response: {
          locationDescription: 'Graceland',
          bookingNo: '1234',
          firstName: 'Anne',
          middleName: 'C',
          lastName: 'McCaffrey',
          facialImageId: 1234,
          dateOfBirth: '1970-03-15',
          status: 'ACTIVE IN',
          physicalAttributes: {
            gender: 'Male',
            ethnicity: 'Caucasian',
          },
          identifiers: [
            {
              type: 'CRO',
              value: '1234/2345',
            },
            {
              type: 'PNC',
              value: 'X234547',
            },
          ],
        },
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`/recommendations/252523937/check-booking-details`)
      cy.pageHeading().should('contain', 'Check booking details for Paula Smith')
    })

    it('edit name', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            firstName: 'Max',
            middleName: 'Arthur',
            lastName: 'Mull',
          },
          bookRecallToPpud: {
            firstNames: 'Max Arthur',
            lastName: 'Mull',
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/edit-name`)
      cy.pageHeading().should('contain', 'Edit names')

      cy.getText('nomisFirstName').should('contain', 'Max')
      cy.getText('nomisMiddleName').should('contain', 'Arthur')
      cy.getText('nomisLastName').should('contain', 'Mull')
    })

    it('edit gender', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            gender: 'Male',
          },
          bookRecallToPpud: {
            gender: 'M',
          },
          ppudOffender: {
            gender: 'M',
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', { name: 'genders', statusCode: 200, response: { values: ['M', 'F'] } })

      cy.visit(`/recommendations/252523937/edit-gender`)
      cy.pageHeading().should('contain', 'Edit gender')

      cy.getText('nomisGender').should('contain', 'Male')
      cy.getText('ppudGender').should('contain', 'M')
    })

    it('edit ethnicity', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            ethnicity: 'White/Caucasian',
          },
          bookRecallToPpud: {
            ethnicity: 'Irish',
          },
          ppudOffender: {
            ethnicity: 'Irish',
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'ethnicities',
        statusCode: 200,
        response: { values: ['Caucasian', 'Irish'] },
      })

      cy.visit(`/recommendations/252523937/edit-ethnicity`)
      cy.pageHeading().should('contain', 'Edit ethnicity')

      cy.getText('nomisEthnicity').should('contain', 'White/Caucasian')
      cy.getText('ppudEthnicity').should('contain', 'Irish')
    })

    it('edit date of birth', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            dateOfBirth: '1990-01-01',
          },
          bookRecallToPpud: {
            dateOfBirth: '1990-01-02',
          },
          ppudOffender: {
            dateOfBirth: '1990-01-03',
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/edit-date-of-birth`)
      cy.pageHeading().should('contain', 'Edit date of birth')

      cy.getText('nomisDateOfBirth').should('contain', '1 January 1990')
      cy.getText('ppudDateOfBirth').should('contain', '3 January 1990')
    })

    it('edit CRO', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            cro: '64941/08C',
          },
          bookRecallToPpud: {
            cro: '64941',
          },
          ppudOffender: {
            croOtherNumber: '64941/08D',
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/edit-cro`)
      cy.pageHeading().should('contain', 'Edit CRO')

      cy.getText('nomisCro').should('contain', '64941/08C')
      cy.getText('ppudCro').should('contain', '64941/08D')
    })

    it('edit Prison Number', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            bookingNo: '1234',
          },
          bookRecallToPpud: {
            prisonNumber: '4567',
          },
          ppudOffender: {
            prisonNumber: '9876',
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/edit-prison-booking-number`)
      cy.pageHeading().should('contain', 'Edit prison booking number')

      cy.getText('nomisPrisonNumber').should('contain', '1234')
      cy.getText('ppudPrisonNumber').should('contain', '9876')
    })

    it('edit Releasing Prison', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            locationDescription: 'Outside - released from Moorland (HMP & YOI)',
          },
          bookRecallToPpud: {
            releasingPrison: 'Saville Row',
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'establishments',
        statusCode: 200,
        response: { values: ['Caucasian', 'Irish'] },
      })

      cy.visit(`/recommendations/252523937/edit-releasing-prison`)
      cy.pageHeading().should('contain', 'Edit releasing prison')

      cy.getText('nomisReleasingPrison').should('contain', 'Outside - released from Moorland (HMP & YOI)')
    })

    it('edit Legislation Released Under', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            legislationReleasedUnder: 'CJA1',
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'released-unders',
        statusCode: 200,
        response: { values: ['CJA1', 'CJA2'] },
      })

      cy.visit(`/recommendations/252523937/edit-legislation-released-under`)
      cy.pageHeading().should('contain', 'Edit legislation released under')
    })

    it('edit Custody Type', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            custodyType: 'Determinate',
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'custody-types',
        statusCode: 200,
        response: { values: ['Determinate'] },
      })

      cy.visit(`/recommendations/252523937/edit-custody-type`)
      cy.pageHeading().should('contain', 'Edit custody type')
    })

    it('edit Received Date and Time', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            receivedDateTime: '2024-01-31T15:17:58Z',
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: 'SENT_TO_PPCS', active: true, created: '2024-01-31T15:17:58Z' }],
      })

      cy.visit(`/recommendations/252523937/edit-recall-received-date-and-time`)
      cy.pageHeading().should('contain', 'Edit when PPCS received the recall')
    })

    it('edit Probation Area', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            probationArea: 'Bedfordshire',
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'probation-services',
        statusCode: 200,
        response: { values: ['Bedfordshire'] },
      })

      cy.visit(`/recommendations/252523937/edit-probation-area`)
      cy.pageHeading().should('contain', 'Edit probation area')
    })

    it('edit Police Contact', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            policeForce: 'Bedfordshire Police',
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'police-forces',
        statusCode: 200,
        response: { values: ['Bedfordshire Police'] },
      })

      cy.visit(`/recommendations/252523937/edit-police-contact`)
      cy.pageHeading().should('contain', 'Edit police local contact details')

      cy.getText('localPoliceContact').should('contain', 'thomas.magnum@gmail.com')
    })

    it('edit MAPPA Level', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {},
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'mappa-levels',
        statusCode: 200,
        response: {
          values: ['Level 1 – Single Agency Management', 'Level 2 – Local Inter-Agency Management', 'Level 3 – MAPPP'],
        },
      })

      cy.visit(`/recommendations/252523937/edit-mappa-level`)
      cy.pageHeading().should('contain', 'Edit MAPPA level')

      cy.getText('mappaLevel').should('contain', 'Level 0')
    })

    it('select index offence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          recallConsideredList: null,
          bookRecallToPpud: { firstNames: 'Pinky', lastName: 'Pooh' },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('prisonSentences', {
        statusCode: 200,
        response: [
          {
            bookingId: 13,
            sentenceSequence: 4,
            lineSequence: 4,
            caseSequence: 2,
            courtDescription: 'Blackburn County Court',
            sentenceStatus: 'A',
            sentenceCategory: '2003',
            sentenceCalculationType: 'MLP',
            sentenceTypeDescription: 'Adult Mandatory Life',
            sentenceDate: '2023-11-16',
            sentenceStartDate: '2023-11-16',
            sentenceEndDate: '3022-11-15',
            terms: [],
            offences: [
              {
                offenderChargeId: 3934369,
                offenceStartDate: '1899-01-01',
                offenceStatute: 'SA96',
                offenceCode: 'SA96036',
                offenceDescription:
                  'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
                indicators: [],
              },
            ],
          },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`/recommendations/252523937/select-index-offence`)
      cy.pageHeading().should('contain', 'Select the index offence for Pinky Pooh')
    })

    it('match index offence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {},
          ppudOffender: {},
          nomisIndexOffence: {
            allOptions: [
              {
                bookingId: 13,
                courtDescription: 'Blackburn County Court',
                offenceCode: 'SA96036',
                offenceDescription:
                  'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
                offenceStatute: 'SA96',
                offenderChargeId: 3934369,
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
                sentenceStartDate: '2023-11-16',
                sentenceTypeDescription: 'Adult Mandatory Life',
                terms: [],
                releaseDate: '2025-11-16',
                licenceExpiryDate: '2025-11-17',
                releasingPrison: 'Broad Moor',
              },
            ],
            selected: 3934369,
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })
      cy.task('getReferenceList', {
        name: 'index-offences',
        statusCode: 200,
        response: {
          values: ['Abscond', 'Abstracting electricity'],
        },
      })

      cy.visit(`/recommendations/252523937/match-index-offence`)
      cy.pageHeading().should('contain', 'Select a matching index offence in PPUD')

      cy.getText('offenceDescription').should(
        'contain',
        'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London'
      )
      cy.getText('sentenceStartDate').should('contain', '16 November 2023')
      cy.getText('sentenceEndDate').should('contain', '15 November 3022')
    })

    it('select ppud sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Pinky', lastName: 'Pooh' },
          ppudOffender: {
            id: '4F6666656E64657249643D3136323931342652656C6561736549643D313135333230G1329H1302',
            sentences: [
              {
                id: '1',
                dateOfSentence: '2003-06-12',
                custodyType: 'Determinate',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
              },
            ],
          },
          nomisIndexOffence: {
            allOptions: [
              {
                offenceDescription:
                  'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
                offenderChargeId: 3934369,
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
              },
            ],
            selected: 3934369,
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/select-ppud-sentence`)
      cy.pageHeading().should('contain', 'Add your booking to PPUD - Pinky Pooh')

      cy.getText('offenceDescription').should(
        'contain',
        'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London'
      )
      cy.getText('sentenceDate').should('contain', '16 November 2023')
      cy.getText('sentenceEndDate').should('contain', '15 November 3022')

      cy.getText('1-indexOffence').should('contain', 'some offence')
      cy.getText('1-dateOfSentence').should('contain', '12 June 2003')
      cy.getText('1-sentenceExpiryDate').should('contain', '2 March 1969')
    })
    it('sentence to commit - multiple terms', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            firstNames: 'Pinky',
            lastName: 'Pooh',
            custodyType: 'custody type',
            indexOffence: 'index offence',
          },
          nomisIndexOffence: {
            allOptions: [
              {
                sentenceTypeDescription: 'sentence type description',
                offenceDescription: 'offence description',
                offenderChargeId: 3934369,
                offenceDate: '2023-11-17',
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
                releaseDate: '2025-01-01',
                licenceExpiryDate: '2025-01-02',
                releasingPrison: 'releasing prison',
                courtDescription: 'court description',
                terms: [
                  {
                    years: 4,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'IMP',
                  },
                  {
                    years: 2,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'LIC',
                  },
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Pinky Pooh')

      cy.getText('custodyType').should('contain', 'custody type')
      cy.getText('offenceDescription').should('contain', 'index offence')
      cy.getText('offenceDate').should('contain', '17 November 2023')
      cy.getText('releaseDate').should('contain', '1 January 2025')
      cy.getText('courtDescription').should('contain', 'court description')
      cy.getText('sentenceDate').should('contain', '16 November 2023')
      cy.getText('licenceExpiryDate').should('contain', '2 January 2025')
      cy.getText('sentenceEndDate').should('contain', '15 November 3022')

      cy.getText('1-termType').should('contain', 'Custodial term')
      cy.getText('1-term').should('contain', '4 years')
      cy.getText('2-termType').should('contain', 'Extended term')
      cy.getText('2-term').should('contain', '2 years')
    })
    it('sentence to commit - single term', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Pinky', lastName: 'Pooh' },
          nomisIndexOffence: {
            allOptions: [
              {
                sentenceTypeDescription: 'sentence type description',
                offenceDescription: 'offence description',
                offenderChargeId: 3934369,
                offenceDate: '2023-11-17',
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
                releaseDate: '2025-01-01',
                licenceExpiryDate: '2025-01-02',
                releasingPrison: 'releasing prison',
                courtDescription: 'court description',
                terms: [
                  {
                    years: 4,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'IMP',
                  },
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Pinky Pooh')

      cy.getText('sentenceLength').should('contain', '4 years')
    })
    it('book to ppud', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Pinky', lastName: 'Pooh' },
          ppudOffender: {
            id: '4F6666656E64657249643D3136323931342652656C6561736549643D313135333230G1329H1302',
            sentences: [
              {
                id: '1',
                dateOfSentence: '2003-06-12',
                custodyType: 'Determinate',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
              },
            ],
          },
          nomisIndexOffence: {
            allOptions: [
              {
                sentenceTypeDescription: 'sentence type description',
                offenceDescription: 'offence description',
                offenderChargeId: 3934369,
                offenceDate: '2023-11-17',
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
                releaseDate: '2025-01-01',
                licenceExpiryDate: '2025-01-02',
                releasingPrison: 'releasing prison',
                courtDescription: 'court description',
                terms: [
                  {
                    years: 4,
                    months: 0,
                    weeks: 0,
                    days: 0,
                    code: 'IMP',
                  },
                ],
              },
            ],
            selected: 3934369,
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SENT_TO_PPCS', active: true }] })

      cy.visit(`/recommendations/252523937/book-to-ppud`)
      cy.pageHeading().should('contain', 'Create new PPUD record for Pinky Pooh')
    })
  })
})
