import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'
import { setResponsePropertiesToNull } from '../support/commands'

context('Make a recommendation - form validation', () => {
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

  beforeEach(() => {
    cy.signIn()
  })

  it('shows previously saved text / form validation on "Consider a recall" page', () => {
    const recallConsideredDetail =
      'Paula has missed curfew tonight and smelling of alcohol recently in appointments. This links to his index offence of violence while under the influence.'
    cy.task('getCase', {
      sectionId: 'personal-details',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        activeRecommendation: {
          recommendationId: '123',
          status: 'RECALL_CONSIDERED',
          recallConsideredList: [
            {
              createdDate: '2022-06-24T20:39:00.000Z',
              userName: 'Bill',
              recallConsideredDetail,
            },
          ],
        },
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/consider-recall`)
    cy.fillInput('What has made you think about recalling Paula Smith?', ' ', { clearExistingText: true })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallConsideredDetail',
      errorText: "Enter details about why you're considering a recall",
    })
    cy.getTextInputValue('What has made you think about recalling Paula Smith?').should('equal', '')
  })

  it('form validation - Manager record decision', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/manager-record-decision`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallTypeManagerDetail',
      errorText: 'You must explain your decision',
    })
    cy.assertErrorMessage({
      fieldName: 'recallTypeManager',
      errorText: 'Select whether you recommend a recall or not',
    })
  })

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
    cy.task('updateRecommendation', {
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
    cy.task('updateRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, previousReleases: null },
    })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/previous-releases`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'hasBeenReleasedPreviously',
      errorText: 'Select whether Paula Smith has been released previously',
    })
  })
})
