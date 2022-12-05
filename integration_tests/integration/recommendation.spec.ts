import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseLicenceConditionsResponse from '../../api/responses/get-case-licence-conditions.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import excludedResponse from '../../api/responses/get-case-excluded.json'
import { setResponsePropertiesToNull } from '../support/commands'

context('Make a recommendation', () => {
  beforeEach(() => {
    cy.signIn()
  })

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
    it('can create a recommendation', () => {
      const caseResponse = {
        ...getCaseOverviewResponse,
        activeRecommendation: undefined,
      }
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
      cy.task('createRecommendation', { statusCode: 201, response: recommendationResponse })
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: getCaseLicenceConditionsResponse,
      })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.clickButton('Make a recommendation')
      cy.pageHeading().should('equal', 'How has Paula Smith responded to probation so far?')
    })

    it('shows an error if creation fails', () => {
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

  describe('Form validation', () => {
    it('form validation - Response to probation', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/response-to-probation`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'responseToProbation',
        errorText: 'You must explain how Paula Smith has responded to probation',
      })
    })

    it('form validation - Licence conditions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'licenceConditionsBreached',
        errorText: 'You must select one or more licence conditions',
      })
    })

    it('form validation - Alternatives tried', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/alternatives-tried`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'alternativesToRecallTried',
        errorText: 'You must select which alternatives to recall have been tried already',
      })
      cy.selectCheckboxes('What alternatives to recall have been tried already?', [
        'Referral to other teams (e.g. IOM, MAPPA, Gangs Unit)',
      ])
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'alternativesToRecallTriedDetail-REFERRAL_TO_OTHER_TEAMS',
        errorText: 'Enter more detail for referral to other teams (e.g. IOM, MAPPA, Gangs Unit)',
      })
    })

    it('form validation - Indeterminate sentence', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-indeterminate`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'isIndeterminateSentence',
        errorText: 'Select whether Paula Smith is on an indeterminate sentence or not',
      })
    })

    it('form validation - Extended sentence', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-extended`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'isExtendedSentence',
        errorText: 'Select whether Paula Smith is on an extended sentence or not',
      })
    })

    it('form validation - Indeterminate sentence type', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/indeterminate-type`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'indeterminateSentenceType',
        errorText: 'Select whether Paula Smith is on a life, IPP or DPP sentence',
      })
    })

    it('form validation - Indeterminate or extended sentence details', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/indeterminate-details`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'indeterminateOrExtendedSentenceDetails',
        errorText: 'Select at least one of the criteria',
      })
      cy.selectCheckboxes('Indeterminate and extended sentences', [
        'Paula Smith has shown behaviour similar to the index offence',
        'Paula Smith has shown behaviour that could lead to a sexual or violent offence',
        'Paula Smith is out of touch',
      ])
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'indeterminateOrExtendedSentenceDetailsDetail-BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
        errorText: 'Enter details about the behaviour similar to the index offence',
      })
      cy.assertErrorMessage({
        fieldName: 'indeterminateOrExtendedSentenceDetailsDetail-BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
        errorText: 'Enter details about the behaviour that could lead to a sexual or violent offence',
      })
      cy.assertErrorMessage({
        fieldName: 'indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH',
        errorText: 'Enter details about Paula Smith being out of touch',
      })
    })

    it('form validation - Recall type', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: undefined } })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'recallType',
        errorText: 'You must select a recommendation',
      })
    })

    it('form validation - Recall type (indeterminate)', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: undefined } })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'recallType',
        errorText: 'Select whether you recommend a recall or not',
      })
    })

    it('form validation - fixed term additional licence conditions', () => {
      cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: undefined } })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/fixed-licence`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasFixedTermLicenceConditions',
        errorText: 'Select whether there are additional licence conditions',
      })
      cy.selectRadio('Fixed term recall', 'Yes')
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasFixedTermLicenceConditionsDetails',
        errorText: 'Enter additional licence conditions',
      })
    })

    it('form validation - Custody status', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/custody-status`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'custodyStatus',
        errorText: 'Select whether the person is in custody or not',
      })
    })

    it('form validation - Vulnerabilities', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/vulnerabilities`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'vulnerabilities',
        errorText: 'Select if there are vulnerabilities or additional needs',
      })
      cy.selectCheckboxes('Consider vulnerability and additional needs. Which of these would recall affect?', [
        'Relationship breakdown',
        'Physical disabilities',
      ])
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'vulnerabilitiesDetail-PHYSICAL_DISABILITIES',
        errorText: 'Enter more detail for physical disabilities',
      })
    })

    it('form validation - IOM', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/iom`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'isUnderIntegratedOffenderManagement',
        errorText: 'You must select whether Paula Smith is under Integrated Offender Management',
      })
    })

    it('form validation - Local police contact details', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/police-details`)
      cy.fillInput('Email address', '111')
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'contactName',
        errorText: 'Enter the police contact name',
      })
      cy.assertErrorMessage({
        fieldName: 'emailAddress',
        errorText: 'Enter an email address in the correct format, like name@example.com',
      })
    })

    it('form validation - Victim contact scheme', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasVictimsInContactScheme',
        errorText: 'You must select whether there are any victims in the victim contact scheme',
      })
    })

    it('form validation - Victim liaison officer', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-liaison-officer`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'dateVloInformed',
        fieldGroupId: 'dateVloInformed-day',
        errorText: 'Enter the date you told the VLO',
      })
    })

    it('form validation - What has led to recall', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/what-led`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'whatLedToRecall',
        errorText: 'Enter details of what has led to this recall',
      })
    })

    it('form validation - Arrest issues', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/arrest-issues`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasArrestIssues',
        errorText: "Select whether there's anything the police should know",
      })
      cy.selectRadio('Is there anything the police should know before they arrest Paula Smith?', 'Yes')
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasArrestIssuesDetailsYes',
        errorText: 'You must enter details of the arrest issues',
      })
    })

    it('form validation - Contraband', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/contraband`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasContrabandRisk',
        errorText: 'Select whether you think Paula Smith is using recall to bring contraband into prison',
      })
      cy.selectRadio(`Do you think Paula Smith is using recall to bring contraband into prison?`, 'Yes')
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasContrabandRiskDetailsYes',
        errorText: 'You must enter details of the contraband concerns',
      })
    })

    it('form validation - Address details', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/address-details`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'isMainAddressWherePersonCanBeFound',
        errorText: 'Select whether this is where the police can find Paula Smith',
      })
      cy.selectRadio('Is this where the police can find Paula Smith?', 'No')
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'isMainAddressWherePersonCanBeFoundDetailsNo',
        errorText: 'You must enter the correct location',
      })
    })

    it('form validation - Offence analysis', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, offenceAnalysis: undefined },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
      cy.getText('indexOffenceDetails').should('equal', 'Index offence details')
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'offenceAnalysis',
        errorText: 'Enter the offence analysis',
      })
    })

    it('form validation - Previous releases', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, offenceAnalysis: undefined },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/previous-releases`)
      cy.clickButton('Continue')
      cy.assertErrorMessage({
        fieldName: 'hasBeenReleasedPreviously',
        errorText: 'Select whether Paula Smith has been released previously',
      })
    })
  })

  describe('Restricted / excluded CRNs', () => {
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
    it('lists personal details', () => {
      cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
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
      cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
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
      cy.task('getRecommendation', {
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

    it('offence details - show custodial & extended term if extended sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...completeRecommendationResponse, isExtendedSentence: true },
      })
      cy.task('getCase', {
        sectionId: 'licence-conditions',
        statusCode: 200,
        response: getCaseLicenceConditionsResponse,
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-details`)
      cy.getDefinitionListValue('Custodial term').should('contain', '5 months')
      cy.getDefinitionListValue('Extended term').should('contain', '1 year')
    })

    it('offence details - banner if multiples convictions and one not on release', () => {
      cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
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
      cy.task('getRecommendation', { statusCode: 200, response: completeRecommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
      cy.getText('indexOffenceDetails').should('contain', 'Index offence details')
    })

    it('offence analysis - hide index offence details if not available', () => {
      cy.task('getRecommendation', {
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

  describe('Branching / redirects', () => {
    it('recall type - directs "no recall" to the no recall task list', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
      })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type`)
      cy.selectRadio('What do you recommend?', 'No recall')
      cy.clickButton('Continue')
      cy.pageHeading().should('contain', 'Create a decision not to recall letter')
    })

    it('recall type - directs "no recall" to the no recall task list, even if coming from recall task list', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(
        `${routeUrls.recommendations}/${recommendationId}/recall-type?fromPageId=task-list&fromAnchor=heading-recommendation`
      )
      cy.selectRadio('What do you recommend?', 'No recall')
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
      })
      cy.clickButton('Continue')
      cy.pageHeading().should('contain', 'Create a decision not to recall letter')
    })

    it('indeterminate recall type - directs "no recall" to the no recall task list', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
      cy.selectRadio('What do you recommend?', 'No recall')
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
      })
      cy.clickButton('Continue')
      cy.pageHeading().should('contain', 'Create a decision not to recall letter')
    })

    it('indeterminate recall type - directs "no recall" to the no recall task list even if coming from task list', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(
        `${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate?fromPageId=task-list&fromAnchor=heading-recommendation`
      )
      cy.selectRadio('What do you recommend?', 'No recall')
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, recallType: { selected: { value: 'NO_RECALL' } } },
      })
      cy.clickButton('Continue')
      cy.pageHeading().should('contain', 'Create a decision not to recall letter')
    })

    it('indeterminate recall type - links back to indeterminate sentence type if indeterminate sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, isIndeterminateSentence: true, isExtendedSentence: false },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
      cy.getLinkHref('Back').should('contain', '/indeterminate-type')
    })

    it('indeterminate recall type - links back to extended sentence if extended sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, isIndeterminateSentence: false, isExtendedSentence: true },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
      cy.getLinkHref('Back').should('contain', '/is-extended')
    })

    it('indeterminate sentence - if extended sentence is selected, redirect to indeterminate recommendation page', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, isIndeterminateSentence: false },
      })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-extended`)
      cy.selectRadio('Is Paula Smith on an extended sentence?', 'Yes')
      cy.clickButton('Continue')
      cy.selectRadio('What do you recommend?', 'Emergency recall')
    })

    it('victim contact scheme - directs "no" to the task list page', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`)
      cy.selectRadio('Are there any victims in the victim contact scheme?', 'No')
      cy.clickButton('Continue')
      cy.pageHeading().should('contain', 'Create a Part A form')
    })

    it('sensitive info - links back to indeterminate/extended criteria if indeterminate sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, isIndeterminateSentence: true, isExtendedSentence: false },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
      cy.getLinkHref('Back').should('contain', '/indeterminate-details')
    })

    it('sensitive info - links back to indeterminate/extended criteria if extended sentence', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: { ...recommendationResponse, isIndeterminateSentence: false, isExtendedSentence: true },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
      cy.getLinkHref('Back').should('contain', '/indeterminate-details')
    })

    it('sensitive info - links back to emergency recall if determinate sentence / standard recall', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          isIndeterminateSentence: false,
          isExtendedSentence: false,
          recallType: {
            selected: { value: 'STANDARD' },
          },
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
      cy.getLinkHref('Back').should('contain', '/emergency-recall')
    })

    it('sensitive info - links back to fixed term licence conditions if determinate sentence / fixed term recall', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...recommendationResponse,
          isIndeterminateSentence: false,
          isExtendedSentence: false,
          recallType: {
            selected: { value: 'FIXED_TERM' },
          },
        },
      })
      cy.visit(`${routeUrls.recommendations}/${recommendationId}/sensitive-info`)
      cy.getLinkHref('Back').should('contain', '/fixed-licence')
    })
  })
})
