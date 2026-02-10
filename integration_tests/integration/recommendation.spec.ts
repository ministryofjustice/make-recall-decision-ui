import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import searchActiveUsersResponse from '../../api/responses/ppudSearchActiveUsers.json'
import searchMappedUserResponse from '../../api/responses/searchMappedUsers.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import excludedResponse from '../../api/responses/get-case-excluded.json'
import { setResponsePropertiesToNull } from '../support/commands'
import { caseTemplate } from '../fixtures/CaseTemplateBuilder'
import { standardActiveConvictionTemplate } from '../fixtures/ActiveConvictionTemplateBuilder'
import { deliusLicenceConditionDoNotPossess } from '../fixtures/DeliusLicenceConditionTemplateBuilder'
import { RECOMMENDATION_STATUS } from '../../server/middleware/recommendationStatus'
import { CUSTODY_GROUP } from '../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { ppcsPaths } from '../../server/routes/paths/ppcs'

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
      name: 'Jane Bloggs',
      addresses: [
        {
          line1: '41 Newport Pagnell Rd',
          line2: 'Bethnal Green',
          town: 'London',
          postcode: 'BG1 234',
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
      cy.task('getActiveRecommendation', { statusCode: 200, response: {} })
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
      cy.task('createRecommendation', { statusCode: 201, response: recommendationResponse })
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.clickLink('Make a recommendation')
      cy.pageHeading().should('equal', 'Important')
    })

    it('shows an error if "Make a recommendation" creation fails', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: {} })
      cy.task('createRecommendation', { statusCode: 500, response: 'API save error' })
      cy.visit(`${routeUrls.cases}/${crn}/create-recommendation-warning`)
      cy.clickButton('Continue')
      cy.getElement('An error occurred creating a new recommendation').should('exist')
    })

    it('shows a warning page if "Make a recommendation" is submitted while another recommendation exists', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })

      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/create-recommendation-warning`)
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'There is already a recommendation for Jane Bloggs')
      cy.getElement('Mr Anderson started this recommendation on 31 October 2000.').should('exist')

      cy.clickLink('Update recommendation')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('update button links to Part A task list if recall is set', () => {
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
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
      cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
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

      cy.getElement('What has made you consider recalling Jane Bloggs? To do').should('exist')
      cy.getElement('How has Jane Bloggs responded to probation so far? To do').should('exist')
      cy.getElement('What licence conditions has Jane Bloggs breached? To do').should('exist')
      cy.getElement('What alternatives to recall have been tried already? To do').should('exist')
      cy.getElement('Is Jane Bloggs on an indeterminate sentence? To do').should('exist')
      cy.getElement('Is Jane Bloggs on an extended sentence? To do').should('exist')
    })

    it('show already existing page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse },
      })

      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/already-existing`)
      cy.pageHeading().should('equal', 'There is already a recommendation for Jane Bloggs')
    })

    it('present trigger-leading-to-recall', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-consider-recall`)
      cy.clickLink('What has made you consider recalling Jane Bloggs?')

      cy.pageHeading().should('equal', 'What has made you consider recalling Jane Bloggs?')

      cy.get('textarea').type('Some details')
      cy.get('button').click()

      cy.pageHeading().should('equal', 'Consider a recall')
    })

    it('present record consideration rationale', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list-consider-recall`)

      cy.clickButton('Continue')

      cy.pageHeading().should('equal', 'Record the consideration in NDelius')

      cy.clickButton('Send to NDelius')

      cy.pageHeading().should('equal', 'Share this case with your manager')
    })

    it('present share-case-with-manager', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/record-consideration-rationale`)

      cy.clickButton('Send to NDelius')

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

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/record-consideration-rationale`)

      cy.clickButton('Send to NDelius')

      cy.pageHeading().should('equal', 'Share this case with your manager')

      cy.clickLink('Return to overview')

      cy.pageHeading().should('equal', 'Overview for Jane Bloggs')
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true }],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.getElement("Request line manager's countersignature Requested").should('exist')
      cy.getElement("Request senior manager's countersignature Cannot start yet").should('exist')
    })

    it('present task-list for SPO_SIGNED', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse },
      })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true }] })

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
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true },
          { name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: true },
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
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true },
          { name: RECOMMENDATION_STATUS.ACO_SIGNED, active: true },
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
      cy.task('getActiveRecommendation', { statusCode: 200, response: {} })
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
      cy.contains('You are excluded from viewing this offender record. Please contact OM Joe Bloggs').should('exist')
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
        'What licence conditions has Jane Bloggs breached?',
        'Be of good behaviour and not behave in a way which undermines the purpose of the licence period'
      ).should('be.checked')

      cy.getSelectableOptionByLabel(
        'What licence conditions has Jane Bloggs breached?',
        'Not commit any offence'
      ).should('be.checked')
      cy.getSelectableOptionByLabel(
        'What licence conditions has Jane Bloggs breached?',
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
        'What licence conditions has Jane Bloggs breached?',
        'This is a standard licence condition'
      ).should('be.checked')

      cy.getSelectableOptionByLabel('What licence conditions has Jane Bloggs breached?', 'Freedom of movement').should(
        'be.checked'
      )

      cy.getSelectableOptionByLabel(
        'What licence conditions has Jane Bloggs breached?',
        'This is a bespoke condition'
      ).should('be.checked')
    })

    it('licence conditions - display CVL licence conditions - missing data', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, licenceConditionsBreached: null },
      })

      cy.task(
        'getCaseV2',
        caseTemplate()
          .withActiveConviction(standardActiveConvictionTemplate().withDescription('Robbery - 05714'))
          .withAllConvictionsNotReleasedOnLicence()
          .withCvlLicenceMissingData()
          .build()
      )

      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)

      cy.getElement('There are no standard licence conditions in CVL. Check the licence document.').should('exist')
      cy.getElement('There are no additional licence conditions in CVL. Check the licence document.').should('exist')
      cy.getElement('There are no bespoke licence conditions in CVL. Check the licence document.').should('exist')
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
        'What licence conditions has Jane Bloggs breached?',
        'Be of good behaviour and not behave in a way which undermines the purpose of the licence period'
      ).should('be.checked')

      cy.getSelectableOptionByLabel(
        'What licence conditions has Jane Bloggs breached?',
        'Not commit any offence'
      ).should('be.checked')
      cy.getSelectableOptionByLabel(
        'What licence conditions has Jane Bloggs breached?',
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
      cy.getElement('What licence conditions has Jane Bloggs breached?').should('exist')
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
      cy.getDefinitionListValue('Name').should('contain', 'Jane Bloggs')
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

    it('sensitive information', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
      cy.pageHeading().should('equal', 'Sensitive information')
    })

    it('manager review', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/manager-review`)
      cy.pageHeading().should('equal', 'Stop and think')
    })

    it('manager decision confirmation', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/manager-decision-confirmation`)
      cy.pageHeading().should('equal', 'Decision not to recall')
    })

    it('emergency recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/emergency-recall`)
      cy.pageHeading().should('equal', 'Is this an emergency recall?')
    })

    it('When did SPO agree to recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-agree-to-recall`)
      cy.pageHeading().should('equal', 'When did the SPO agree to this recall?')
    })

    it('Previous recalls', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/previous-recalls`)
      cy.pageHeading().should('equal', 'Previous recalls')
    })

    it('Previous releases', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/previous-releases`)
      cy.pageHeading().should('equal', 'Previous releases')
    })

    it('Confirmation part a', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/confirmation-part-a`)
      cy.pageHeading().should('equal', 'Part A created')
    })

    it('suitability for recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/suitability-for-fixed-term-recall`)
      cy.pageHeading().should(
        'equals',
        `Check ${recommendationResponse.personOnProbation.name}'s suitability for a standard or fixed term recall`
      )
      cy.getElement('9 November 2000 (age 21)').should('exist')
      cy.getElement('Robbery (other than armed robbery)').should('exist')
      cy.getElement('Shoplifting Burglary').should('exist')
      cy.getElement('ORA Adult Custody (inc PSS)').should('exist')
      cy.getElement('16 weeks').should('exist')
    })

    it('lists multiple addresses', () => {
      const recommendationWithAddresses = {
        ...recommendationResponse,
        personOnProbation: {
          name: 'Jane Bloggs',
          addresses: [
            {
              line1: '41 Newport Pagnell Rd',
              line2: 'Bethnal Green',
              town: 'London',
              postcode: 'BG1 234',
            },
            {
              line1: 'The Lodge, Oak Drive',
              line2: null,
              town: 'Corby',
              postcode: 'S12 345',
            },
          ],
        },
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.getElement(
        'These are the last known addresses for Jane Bloggs in NDelius. If they are incorrect, update NDelius.'
      )
      cy.getText('address-1').should('contain', '41 Newport Pagnell Rd')
      cy.getText('address-1').should('contain', 'Bethnal Green')
      cy.getText('address-1').should('contain', 'London')
      cy.getText('address-1').should('contain', 'BG1 234')
      cy.getText('address-2').should('contain', 'The Lodge, Oak Drive')
      cy.getText('address-2').should('contain', 'Corby')
      cy.getText('address-2').should('contain', 'S12 345')
      cy.selectRadio('Can the police find Jane Bloggs at these addresses?', 'No')
    })

    it('lists a mixture of "No fixed abode" and addresses', () => {
      const recommendationWithAddresses = {
        ...recommendationResponse,
        personOnProbation: {
          name: 'Jane Bloggs',
          addresses: [
            {
              line1: '41 Newport Pagnell Rd',
              line2: 'Bethnal Green',
              town: 'London',
              postcode: 'BG1 234',
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
      cy.getElement('These are the last known addresses for Jane Bloggs')
      cy.getText('address-1').should('contain', '41 Newport Pagnell Rd')
      cy.getText('address-1').should('contain', 'Bethnal Green')
      cy.getText('address-1').should('contain', 'London')
      cy.getText('address-1').should('contain', 'BG1 234')
      cy.getText('address-2').should('contain', 'No fixed abode')
    })

    it('shows a message if no addresses', () => {
      const recommendationWithAddresses = {
        ...recommendationResponse,
        personOnProbation: {
          name: 'Jane Bloggs',
          addresses: [],
        },
      }
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationWithAddresses })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.fillInput('Where can the police find Jane Bloggs?', '35 Oak Rise, Carshalton, Surrey S12 345')
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.RECALL_DECIDED, active: true }],
      })
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('lists one address', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.getElement('This is the last known address for Jane Bloggs')
      cy.getText('address-1').should('contain', '41 Newport Pagnell Rd')
      cy.getText('address-1').should('contain', 'Bethnal Green')
      cy.getText('address-1').should('contain', 'London')
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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: false },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.pageHeading().should('contain', 'Part A for Jane Bloggs')

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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: false },
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.pageHeading().should('contain', 'Part A for Jane Bloggs')

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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: false },
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true },
          { name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.pageHeading().should('contain', 'Part A for Jane Bloggs')

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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: false },
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true },
          { name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: false },
          { name: RECOMMENDATION_STATUS.ACO_SIGNED, active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/task-list`)

      cy.pageHeading().should('contain', 'Part A for Jane Bloggs')

      cy.getElement('Line manager countersignature Completed').should('exist')
      cy.getElement('Senior manager countersignature Completed').should('exist')
    })

    it('Decision not to recall letter created', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/confirmation-no-recall`)
      cy.pageHeading().should('equal', 'Decision not to recall letter created')
    })

    it('request SPO countersign', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/request-spo-countersign`)
      cy.pageHeading().should('equal', 'Request countersignature')
    })

    it('request ACO countersign', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true }] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/request-aco-countersign`)
      cy.pageHeading().should('equal', 'Request countersignature')
    })
  })

  describe('SPO Delete', () => {
    beforeEach(() => {
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
    })

    it('spo delete recommendation rationale', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-delete-recommendation-rationale`)
      cy.pageHeading().should('equal', 'Delete recommendation for Jane Bloggs')
    })

    it('record delete rationale', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/record-delete-rationale`)
      cy.pageHeading().should('equal', 'Record the explanation in NDelius')
    })

    it('SPO delete confirmation', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...completeRecommendationResponse } })
      cy.task('getStatuses', { statusCode: 200, response: [{ name: RECOMMENDATION_STATUS.REC_DELETED, active: true }] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-delete-confirmation`)
      cy.pageHeading().should('contains', 'Recommendation deleted')
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
          { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
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
          { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true }],
      })

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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true }],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Explain the decision')

      cy.url().should('contain', 'spo-rationale')

      cy.pageHeading().should('equal', 'Explain the decision')

      cy.selectRadio('Explain the decision', 'Do not recall - send a decision not to recall letter')

      cy.clickButton('Continue')

      cy.url().should('contain', 'spo-why-no-recall')

      cy.pageHeading().should('equal', 'Why do you think Jane Bloggs should not be recalled?')

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
          spoRecallRationale: 'There are strong arguments in favour of recalling',
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
          { name: RECOMMENDATION_STATUS.SPO_RECORDED_RATIONALE, active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Record the decision')

      cy.pageHeading().should('equal', 'Record the decision in NDelius')

      cy.getText('reason').should('contain', 'There are strong arguments in favour of recalling')

      cy.selectCheckboxes('Record the decision in NDelius', [
        'Contains sensitive information - do not show to the person on probation',
      ])

      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.clickButton('Send to NDelius')

      cy.pageHeading().should('contains', 'Decision to recall')

      cy.getText('fullName').should('contain', 'Jane Bloggs')
      cy.getText('crn').should('contain', 'X12345')
    })

    it('SPO record decision', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, spoRecallType: 'RECALL' },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true }],
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-record-decision`)
      cy.pageHeading().should('contains', 'Record the decision in NDelius')
    })

    it('SPO rationale confirmation', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, spoRecallType: 'RECALL' },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SPO_RECORDED_RATIONALE, active: true }],
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-rationale-confirmation`)
      cy.pageHeading().should('contains', 'Decision to recall')
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
          spoRecallRationale: 'There are strong arguments in favour of recalling',
        },
      })

      // limitations of mocking in integration tests...
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
          { name: RECOMMENDATION_STATUS.SPO_RECORDED_RATIONALE, active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Record the decision')

      cy.pageHeading().should('equal', 'Record the decision in NDelius')

      cy.getText('reason').should('contain', 'There are strong arguments in favour of recalling')

      cy.selectCheckboxes('Record the decision in NDelius', [
        'Contains sensitive information - do not show to the person on probation',
      ])

      cy.task('updateStatuses', { statusCode: 200, response: [] })

      cy.clickButton('Send to NDelius')

      cy.pageHeading().should('contains', 'Decision not to recall')

      cy.getText('fullName').should('contain', 'Jane Bloggs')
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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
          { name: RECOMMENDATION_STATUS.SPO_RECORDED_RATIONALE, active: false },
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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
          { name: RECOMMENDATION_STATUS.SPO_RECORDED_RATIONALE, active: false },
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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
          { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
          { name: RECOMMENDATION_STATUS.SPO_RECORDED_RATIONALE, active: false },
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
          { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
        ],
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-task-list-consider-recall`)

      cy.clickLink('Explain the decision')

      cy.pageHeading().should('equal', 'Explain the decision to recall Jane Bloggs')

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
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
          { name: RECOMMENDATION_STATUS.SPO_RECORDED_RATIONALE, active: true },
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
        response: [{ name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true }],
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
        response: [{ name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true }],
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
          { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
          { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
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
        response: [{ name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true }],
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
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true },
          { name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: false },
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
        response: [{ name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: true }],
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
          { name: RECOMMENDATION_STATUS.SPO_SIGNED, active: true, createdBy: 'USER1' },
          { name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: true },
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
        response: [{ name: RECOMMENDATION_STATUS.ACO_SIGNED, active: true }],
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
        response: [{ name: RECOMMENDATION_STATUS.ACO_SIGNED, active: true }],
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
        response: [{ name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: true }],
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
          { name: RECOMMENDATION_STATUS.ACO_SIGNED, active: true },
          { name: RECOMMENDATION_STATUS.ACO_SIGNATURE_REQUESTED, active: true },
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
        response: { ...completeRecommendationResponse, recallConsideredList: null, whoCompletedPartA: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/who-completed-part-a/`)

      cy.pageHeading().should('contain', 'Who completed this Part A?')

      cy.fillInput('Name', 'Joe Bloggs')
      cy.fillInput('Email', 'bloggs@me.com')
      cy.selectRadio('Is this person the probation practitioner for Jane Bloggs?', 'Yes')
      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('present Practitioner For Part A page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null, practitionerForPartA: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/practitioner-for-part-a/`)

      cy.pageHeading().should('contain', 'Practitioner for Jane Bloggs?')

      cy.fillInput('Name', 'Joe Bloggs')
      cy.fillInput('Email', 'bloggs@me.com')

      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })

    it('present Revocation Order Recipients', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null, revocationOrderRecipients: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/revocation-order-recipients/`)

      cy.pageHeading().should('contain', 'Where should the revocation order be sent?')

      cy.fillInput('Enter email address', 'bloggs@me.com')

      cy.clickButton('Continue')
      cy.pageHeading().should('equal', 'Create a Part A form')
    })
    it('present PPCS Query Emails', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null, ppcsQueryEmails: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/ppcs-query-emails/`)

      cy.pageHeading().should('contain', 'Where should PPCS respond with questions?')

      cy.fillInput('Enter email address', 'bloggs@me.com')

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

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/preview-part-a/`)

      cy.pageHeading().should('contain', 'Preview Part A')

      cy.getElement('Download preview of Part A').should('exist')
    })

    it('present share-case-with-admin', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/share-case-with-admin`)

      cy.pageHeading().should('equal', 'Share with a case admin')
    })
  })
  describe('PPCS Journey', () => {
    beforeEach(() => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
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

      cy.visit(`/${ppcsPaths.ppcsSearch}`)

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
              name: 'Joe Bloggs',
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('ppcsSearch', {
        statusCode: 200,
        response: {
          results: [
            {
              name: 'Joe Bloggs',
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('searchPpud', {
        statusCode: 200,
        response: {
          results: [
            {
              id: '4F6666656E64657269643D313731383138G725H664',
              croNumber: '123456/12A',
              nomsId: 'JG123POE',
              firstNames: 'John',
              familyName: 'Doe',
              dateOfBirth: '2000-01-01',
            },
          ],
        },
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`/recommendations/252523937/search-ppud-results`)
      cy.pageHeading().should('contain', 'PPUD record found')
    })

    it('no ppud search results', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('searchPpud', {
        statusCode: 200,
        response: {
          results: [], // no ppud results
        },
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`/recommendations/${recommendationId}/no-search-ppud-results`)
      cy.pageHeading().should('contain', 'No PPUD record found')
      cy.get('p.govuk-body-l').contains('Case reference number (CRN):').should('exist')
      cy.get('div.moj-banner__message')
        .contains('You can only create a new record for a determinate sentence in this service.')
        .should('exist')
      cy.getLinkHref('Create a determinate PPUD record').should('contain', 'check-booking-details')
      cy.getLinkHref('Search for another CRN').should('contain', `/${ppcsPaths.ppcsSearch}`)
    })

    it('check booking details', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('searchForPrisonOffender', {
        statusCode: 200,
        response: {
          locationDescription: 'Graceland',
          bookingNo: '1234',
          firstName: 'Jane',
          middleName: 'C',
          lastName: 'Bloggs',
          facialImageId: 1234,
          dateOfBirth: '1970-03-15',
          status: 'ACTIVE IN',
          agencyId: 'MLI',
          physicalAttributes: {
            gender: 'Male',
            ethnicity: 'White',
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
      cy.task('establishmentMappings', {
        statusCode: 200,
        response: {
          MLI: 'HMPPS Moorland',
        },
      })

      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`/recommendations/252523937/check-booking-details`)
      cy.pageHeading().should('contain', 'Check booking details for Jane Bloggs')
      cy.clickButton('Hide all sections')
      cy.get('#check-booking-details-content-1')
        .should('contain', 'NOMIS number')
        .should('have.css', 'content-visibility', 'hidden')
      cy.clickButton('Show all sections')
      cy.get('#check-booking-details-content-1').should('contain', 'NOMIS number').should('be.visible')
    })

    it('edit name', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {
            firstName: 'Joe',
            middleName: 'Arthur',
            lastName: 'Bloggs',
          },
          bookRecallToPpud: {
            firstNames: 'Joe Arthur',
            lastName: 'Bloggs',
          },
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/edit-name`)
      cy.pageHeading().should('contain', 'Edit names')

      cy.getText('nomisFirstName').should('contain', 'Joe')
      cy.getText('nomisMiddleName').should('contain', 'Arthur')
      cy.getText('nomisLastName').should('contain', 'Bloggs')
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
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
            ethnicity: 'White',
          },
          bookRecallToPpud: {
            ethnicity: 'Irish',
          },
          ppudOffender: {
            ethnicity: 'Irish',
          },
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getReferenceList', {
        name: 'ethnicities',
        statusCode: 200,
        response: { values: ['White', 'Irish'] },
      })

      cy.visit(`/recommendations/252523937/edit-ethnicity`)
      cy.pageHeading().should('contain', 'Edit ethnicity')

      cy.getText('nomisEthnicity').should('contain', 'White')
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getReferenceList', {
        name: 'establishments',
        statusCode: 200,
        response: { values: ['White', 'Irish'] },
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
            // Can only edit legislation released under for determinate sentences
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            legislationReleasedUnder: 'CJA1',
            legislationSentencedUnder: 'CJA1',
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getReferenceList', {
        name: 'released-unders',
        statusCode: 200,
        response: { values: ['CJA1', 'CJA2'] },
      })

      cy.visit(`/recommendations/252523937/edit-legislation-released-under`)
      cy.pageHeading().should('contain', 'Edit legislation released under')
    })

    it('edit Custody Group', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/edit-custody-group`)
      cy.pageHeading().should('contain', 'Is the sentence determinate or indeterminate?')
      cy.get('p.govuk-body').contains('Make sure you select the correct sentence type.').should('exist')
    })

    it('edit Current Establishment', () => {
      cy.task('getReferenceList', {
        name: 'establishments',
        statusCode: 200,
        response: { values: ['HMP Brixton'] },
      })

      cy.visit(`/recommendations/252523937/edit-current-establishment`)
      cy.pageHeading().should('contain', 'Edit current establishment')
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
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true, created: '2024-01-31T15:17:58Z' }],
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getReferenceList', {
        name: 'police-forces',
        statusCode: 200,
        response: { values: ['Bedfordshire Police'] },
      })

      cy.visit(`/recommendations/252523937/edit-police-contact`)
      cy.pageHeading().should('contain', 'Edit police local contact details')

      cy.getText('localPoliceContact').should('contain', 'joe.bloggs@gmail.com')
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getReferenceList', {
        name: 'mappa-levels',
        statusCode: 200,
        response: {
          values: ['Level 1 – Single Agency Management', 'Level 2 – Local Inter-Agency Management', 'Level 3 – MAPPA'],
        },
      })

      cy.visit(`/recommendations/252523937/edit-mappa-level`)
      cy.pageHeading().should('contain', 'Edit MAPPA level')

      cy.getText('mappaLevel').should('contain', 'Level 0')
    })

    it('edit MAPPA Level - unknown', () => {
      const completeRecommendationResponseWithoutMappaLevel = JSON.parse(JSON.stringify(completeRecommendationResponse))
      delete completeRecommendationResponseWithoutMappaLevel.personOnProbation.mappa.level

      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponseWithoutMappaLevel,
          prisonOffender: {},
          bookRecallToPpud: {},
          ppudOffender: {},
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getReferenceList', {
        name: 'mappa-levels',
        statusCode: 200,
        response: {
          values: ['Level 1 – Single Agency Management', 'Level 2 – Local Inter-Agency Management', 'Level 3 – MAPPA'],
        },
      })

      cy.visit(`/recommendations/252523937/edit-mappa-level`)
      cy.pageHeading().should('contain', 'Edit MAPPA level')

      cy.getText('mappaLevel').should('contain', 'Unknown')
    })

    it('match index offence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.DETERMINATE },
          ppudOffender: {},
          nomisIndexOffence: {
            allOptions: [
              {
                bookingId: 13,
                courtDescription: 'Blackburn County Court',
                offenceCode: 'SA12345',
                offenceDescription: 'Attack / assault / batter a member of the public',
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getReferenceList', {
        name: 'index-offences',
        statusCode: 200,
        response: {
          values: ['Abscond', 'Abstracting electricity'],
        },
      })

      cy.visit(`/recommendations/252523937/match-index-offence`)
      cy.pageHeading().should('contain', 'Select a matching index offence in PPUD')

      cy.getText('offenceDescription').should('contain', 'Attack / assault / batter a member of the public')
      cy.getText('sentenceStartDate').should('contain', '16 November 2023')
      cy.getText('sentenceEndDate').should('contain', '15 November 3022')
    })

    it('select determinate ppud sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.DETERMINATE },
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
                offenceDescription: 'Attack / assault / batter a member of the public',
                offenderChargeId: 3934369,
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
              },
            ],
            selected: 3934369,
          },
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/select-ppud-sentence`)
      cy.pageHeading().should('contain', 'Add your booking to PPUD - Joseph Bluggs')

      cy.getText('offenceDescription').should('contain', 'Attack / assault / batter a member of the public')
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
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            custodyType: 'custody type',
            indexOffence: 'index offence',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')

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
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.DETERMINATE },
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')

      cy.getText('sentenceLength').should('contain', '4 years')
    })
    it('sentence to commit existing offender', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          ppudOffender: {
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
                releases: [
                  {
                    dateOfRelease: '2013-02-02',
                  },
                  {
                    dateOfRelease: '2015-02-09',
                  },
                  {
                    dateOfRelease: '2005-02-02',
                  },
                ],
              },
            ],
          },
          bookRecallToPpud: {
            firstNames: 'Joseph',
            lastName: 'Bluggs',
            ppudSentenceId: '1',
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/sentence-to-commit-existing-offender`)
      cy.pageHeading().should('contain', 'Double check your booking')
    })

    it('select indeterminate ppud sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          isIndeterminateSentence: true,
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          ppudOffender: {
            id: '1',
            sentences: [
              {
                id: '1',
                dateOfSentence: '2003-06-12',
                custodyType: 'Mandatory (MLP)',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
                tariffExpiryDate: '1970-03-02',
              },
            ],
          },
          convictionDetail: {
            indexOffenceDescription: 'Burglary',
            sentenceExpiryDate: '2024-05-10',
            dateOfSentence: '2022-03-11',
          },
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/select-indeterminate-ppud-sentence`)
      cy.pageHeading().should('contain', 'Select a sentence for your booking')

      cy.get('div[id=nomis-sentence-details-offence-row] dd').should('contain.text', 'Burglary')
      cy.get('div[id=nomis-sentence-details-date-of-sentence-row] dd').should('contain.text', '11 March 2022')
      cy.get('div[id=nomis-sentence-details-sentence-type-row] dd').should('contain.text', CUSTODY_GROUP.INDETERMINATE)
      cy.get('div[id=nomis-sentence-details-sentence-expiry-date-row] dd').should('contain.text', '10 May 2024')

      cy.get('div[id=1-offence-row] dd').should('contain.text', 'some offence')
      cy.get('div[id=1-custody-type-row] dd').should('contain.text', 'Mandatory (MLP)')
      cy.get('div[id=1-date-of-sentence-row] dd').should('contain.text', '12 June 2003')
      cy.get('div[id=1-tariff-expiry-date-row] dd').should('contain.text', '2 March 1970')

      cy.get('h2').should('have.class', 'govuk-heading-m').should('contain.text', 'Add your booking to PPUD')
      cy.get('p.govuk-body')
        .contains(
          'Select the sentence for this booking. If the correct sentence is not listed, it needs to be added to PPUD.'
        )
        .should('exist')
      // check the determinate sentence content is not present
      cy.get('#determinateSentencesDetails').should('not.exist')
    })

    it('select indeterminate ppud sentence - show determinate sentence details', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          isIndeterminateSentence: true,
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          ppudOffender: {
            id: '1',
            sentences: [
              {
                id: '1',
                dateOfSentence: '2003-06-12',
                custodyType: 'Mandatory (MLP)',
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
              },
              {
                id: '2',
                dateOfSentence: '2004-06-12',
                custodyType: 'Determinate', // determinate sentences
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'some offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
              },
              {
                id: '3',
                dateOfSentence: '2004-06-12',
                custodyType: 'EDS', // determinate sentences
                licenceExpiryDate: null,
                mappaLevel: 'Level 2 – Local Inter-Agency Management',
                offence: {
                  indexOffence: 'another offence',
                  dateOfIndexOffence: null,
                },
                sentenceExpiryDate: '1969-03-02',
              },
            ],
          },
          convictionDetail: {
            indexOffenceDescription: 'Burglary',
            sentenceExpiryDate: '2024-05-10',
            dateOfSentence: '2022-03-11',
          },
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/select-indeterminate-ppud-sentence`)
      cy.pageHeading().should('contain', 'Select a sentence for your booking')
      cy.get('#determinateSentencesDetails')
        .find('.govuk-details__summary-text')
        .should('contain.text', '2 determinate sentences')

      cy.get('#determinateSentencesDetails')
        .find('.govuk-details__text')
        .should('contain.text', 'You can view the determinate sentences for Jane Bloggs')
    })

    it('select indeterminate ppud sentence - show notification banner when there are no indeterminate sentences', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          isIndeterminateSentence: true,
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs', custodyGroup: CUSTODY_GROUP.INDETERMINATE },
          ppudOffender: {
            id: '1',
            sentences: [],
          },
          convictionDetail: {
            indexOffenceDescription: 'Burglary',
            sentenceExpiryDate: '2024-05-10',
            dateOfSentence: '2022-03-11',
          },
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/select-indeterminate-ppud-sentence`)
      cy.pageHeading().should('contain', 'Select a sentence for your booking')

      cy.get('#govuk-notification-banner-title').should('contain.text', 'No indeterminate sentences found in PPUD')
      cy.get('.govuk-notification-banner__content').should(
        'contain.text',
        'The sentence needs to be added to PPUD and the booking on completed there.'
      )

      cy.get('#return-to-booking-details-button')
        .should('have.attr', 'href', '/recommendations/1/check-booking-details')
        .invoke('text')
        .then(text => {
          const normalized = text.replace(/\s+/g, ' ').trim()
          expect(normalized).to.eq('Return to booking details')
        })
    })

    it('book to ppud - create offender', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs' },
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/book-to-ppud`)
      cy.pageHeading().should('contain', 'Create new PPUD record for Joseph Bluggs')
    })
    it('book to ppud - update offender', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs' },
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/book-to-ppud`)
      cy.pageHeading().should('contain', 'Book Joseph Bluggs onto PPUD')
    })

    it('booked to ppud', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs' },
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.BOOKED_TO_PPUD, active: true }],
      })

      cy.visit(`/recommendations/252523937/booked-to-ppud`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')
    })

    it('booking summary', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          prisonOffender: {},
          bookRecallToPpud: { firstNames: 'Joseph', lastName: 'Bluggs' },
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
      cy.task('getStatuses', {
        statusCode: 200,
        response: [
          { name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true },
          { name: RECOMMENDATION_STATUS.BOOKED_TO_PPUD, active: true },
        ],
      })

      cy.visit(`/recommendations/252523937/booking-summary`)
      cy.pageHeading().should('contain', 'Your recall booking - Joseph Bluggs')
    })

    it('supporting documents', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          {
            title: 'Part A',
            type: 'PPUDPartA',
            filename: 'NAT_Recall_Part_A_02022024_Bloggs_J_X098092.docx',
            id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
          },
        ],
      })

      cy.visit(`/recommendations/252523937/supporting-documents`)
      cy.pageHeading().should('contain', 'Add supporting documents for Jane Bloggs')
      cy.getText('filename').should('contain', 'NAT_Recall_Part_A_02022024_Bloggs_J_X098092.docx')
    })

    it('uploading supporting documents', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/supporting-document-upload/part-a`)
      cy.pageHeading().should('contain', 'Upload Part A')
    })

    it('replace supporting documents', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          {
            title: 'Part A',
            type: 'PPUDPartA',
            filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
            id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
          },
        ],
      })

      cy.visit(`/recommendations/252523937/supporting-document-replace/part-a/1234`)
      cy.pageHeading().should('contain', 'Upload Part A')
    })

    it('remove supporting documents', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          {
            title: 'Part A',
            type: 'PPUDPartA',
            filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
            id: '1234',
          },
        ],
      })

      cy.visit(`/recommendations/252523937/supporting-document-remove/1234`)
      cy.pageHeading().should('contain', 'Remove Part A')
    })

    it('uploading additional supporting documents', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.visit(`/recommendations/252523937/additional-supporting-document-upload`)
      cy.pageHeading().should('contain', 'Add additional document')
    })

    it('replace additional supporting documents', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          {
            title: 'some title',
            type: 'OtherDocument',
            filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
            id: '1234',
          },
        ],
      })

      cy.visit(`/recommendations/252523937/additional-supporting-document-replace/1234`)
      cy.pageHeading().should('contain', 'Replace additional document')
    })

    it('remove additional supporting documents', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          {
            title: 'some title',
            type: 'OtherDocument',
            filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
            id: '1234',
          },
        ],
      })

      cy.visit(`/recommendations/252523937/additional-supporting-document-remove/1234`)
      cy.pageHeading().should('contain', "Remove the additional document 'some title'")
    })

    it('edit minute', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })

      cy.task('getSupportingDocuments', {
        statusCode: 200,
        response: [
          {
            title: 'some title',
            type: 'OtherDocument',
            filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
            id: '1234',
          },
        ],
      })

      cy.visit(`/recommendations/252523937/edit-ppud-minute`)
      cy.pageHeading().should('contain', 'Add note about supporting documents')
    })
  })
  describe('PPCS Journey without correct mapping or ppud user account', () => {
    beforeEach(() => {
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    })
    it('landing page for PPCS when no mapping present', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: { ppudUserMapping: null } })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: { results: [] } })

      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.start}`)

      cy.pageHeading().should('contain', 'Check and book a recall')
      cy.getElement('Your account needs updating before you can book a recall').should('exist')
    })

    it('landing page for PPCS when mapping present but no active ppud user', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: { results: [] } })

      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, recallConsideredList: null },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })

      cy.visit(`${routeUrls.start}`)

      cy.pageHeading().should('contain', 'Check and book a recall')
      cy.getElement('Your account needs updating before you can book a recall').should('exist')
    })
  })
  describe('Approved Premises Journey', () => {
    beforeEach(() => {
      cy.signIn({ roles: ['ROLE_MARD_RESIDENT_WORKER'] })
    })

    it('present Out of Hours Blue Page', () => {
      cy.visit(`${routeUrls.cases}/${crn}/out-of-hours-warning`)

      cy.pageHeading().should('contain', 'Important')
    })

    it('present licence condition breaches page for AP', () => {
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/ap-licence-conditions`)

      cy.pageHeading().should('contain', 'What licence conditions has Jane Bloggs breached?')
    })
    it('present AP Recall Rationale page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          spoRecallType: 'RECALL',
          spoRecallRationale: 'some lorem ipsum stuff',
          odmName: 'John Doe',
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/ap-recall-rationale`)

      cy.pageHeading().should('contain', 'Explain the decision')

      cy.getText('reason').should('contain', 'some lorem ipsum stuff')
      cy.getTextInputValue('Name of out-of-hours manager').should('contain', 'John Doe')
    })
    it('present AP record decision page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          spoRecallRationale: 'some lorem ipsum stuff',
          odmName: 'John Doe',
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/ap-record-decision`)

      cy.pageHeading().should('contain', 'Record the decison in NDelius')

      cy.getText('reason').should('contain', 'some lorem ipsum stuff')
      cy.getText('reason').should('contain', 'Be of good behaviour')
      cy.getText('reason').should('contain', 'Manager(s) name: John Doe')
    })
    it('present AP rationale confirmation', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          spoRecallRationale: 'some lorem ipsum stuff',
          odmName: 'John Doe',
        },
      })
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.AP_RECORDED_RATIONALE, active: true }],
      })

      cy.visit(`${routeUrls.recommendations}/${recommendationId}/ap-rationale-confirmation`)

      cy.pageHeading().should('contain', 'Decision not to recall')

      cy.getText('reason').should('contain', 'some lorem ipsum stuff')
      cy.getText('reason').should('contain', 'Be of good behaviour')
      cy.getText('reason').should('contain', 'Manager(s) name: John Doe')
    })
    it('present AP why no recall', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...completeRecommendationResponse,
          spoRecallRationale: 'some lorem ipsum stuff',
          odmName: 'John Doe',
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/ap-why-no-recall`)

      cy.pageHeading().should('contain', 'Why do you think Jane Bloggs should not be recalled?')

      cy.getText('reason').should('contain', 'some lorem ipsum stuff')
      cy.getTextInputValue('Name of out-of-hours manager').should('contain', 'John Doe')
    })
  })
})
