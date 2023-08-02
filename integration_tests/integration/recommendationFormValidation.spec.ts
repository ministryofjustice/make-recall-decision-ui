import { routeUrls } from '../../server/routes/routeUrls'
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
    managerRecallDecision: {
      isSentToDelius: true,
    },
  }

  it('Response to probation', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/response-to-probation`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'responseToProbation',
      errorText: 'You must explain how Paula Smith has responded to probation',
    })
  })

  it('Licence conditions', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'licenceConditionsBreached',
      errorText: 'You must select one or more licence conditions',
    })
  })

  it('Alternatives tried', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('Indeterminate sentence', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-indeterminate`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'isIndeterminateSentence',
      errorText: 'Select whether Paula Smith is on an indeterminate sentence or not',
    })
  })

  it('Extended sentence', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-extended`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'isExtendedSentence',
      errorText: 'Select whether Paula Smith is on an extended sentence or not',
    })
  })

  it('Indeterminate sentence type', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/indeterminate-type`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'indeterminateSentenceType',
      errorText: 'Select whether Paula Smith is on a life, IPP or DPP sentence',
    })
  })

  it('Indeterminate or extended sentence details', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('Recall type', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: undefined } })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallType',
      errorText: 'You must select a recommendation',
    })
  })

  it('Recall type (indeterminate)', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: undefined } })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type-indeterminate`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallType',
      errorText: 'Select whether you recommend a recall or not',
    })
  })

  it('fixed term additional licence conditions', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: { ...recommendationResponse, recallType: undefined } })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('Custody status', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/custody-status`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'custodyStatus',
      errorText: 'Select whether the person is in custody or not',
    })
  })

  it('Vulnerabilities', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('IOM', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/iom`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'isUnderIntegratedOffenderManagement',
      errorText: 'You must select whether Paula Smith is under Integrated Offender Management',
    })
  })

  it('Local police contact details', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('Victim contact scheme', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'hasVictimsInContactScheme',
      errorText: 'You must select whether there are any victims in the victim contact scheme',
    })
  })

  it('Victim liaison officer', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-liaison-officer`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'dateVloInformed',
      fieldGroupId: 'dateVloInformed-day',
      errorText: 'Enter the date you told the VLO',
    })
  })

  it('What has led to recall', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/what-led`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'whatLedToRecall',
      errorText: 'Enter details of what has led to this recall',
    })
  })

  it('Arrest issues', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('Contraband', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('Address details', () => {
    cy.signIn()
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
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

  it('Offence analysis', () => {
    cy.signIn()
    cy.task('updateRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, offenceAnalysis: undefined },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/offence-analysis`)
    cy.getText('indexOffenceDetails').should('equal', 'Index offence details')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'offenceAnalysis',
      errorText: 'Enter the offence analysis',
    })
  })

  it('Add a previous release', () => {
    cy.signIn()
    cy.task('updateRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, previousReleases: null },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/add-previous-release`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'previousReleaseDate',
      fieldGroupId: 'previousReleaseDate-day',
      errorText: 'Enter the previous release date',
    })
  })

  it('Add a previous recall', () => {
    cy.signIn()
    cy.task('updateRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, previousRecalls: null },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/add-previous-recall`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'previousRecallDate',
      fieldGroupId: 'previousRecallDate-day',
      errorText: 'Enter the previous recall date',
    })
  })

  it('Current risk of serious harm', () => {
    cy.signIn()
    cy.task('updateRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, currentRoshForPartA: null },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/rosh`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'riskToChildren',
      errorText: 'Select a RoSH level for the risk to children',
    })
    cy.assertErrorMessage({
      fieldName: 'riskToPublic',
      errorText: 'Select a RoSH level for the risk to the public',
    })
    cy.assertErrorMessage({
      fieldName: 'riskToKnownAdult',
      errorText: 'Select a RoSH level for the risk to a known adult',
    })
    cy.assertErrorMessage({
      fieldName: 'riskToStaff',
      errorText: 'Select a RoSH level for the risk to staff',
    })
    cy.assertErrorMessage({
      fieldName: 'riskToPrisoners',
      errorText: 'Select a RoSH level for the risk to prisoners',
    })
  })
  it('Trigger leadnig to recall', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/trigger-leading-to-recall`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'triggerLeadingToRecall',
      errorText: 'You must explain what has made you think about recalling Paula Smith',
    })
  })
  it('Rationale Check', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_SIGNATURE_REQUESTED', active: true }] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/rationale-check`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'rationaleCheck',
      errorText: 'Choose an option',
    })
  })

  it('SPO rationale', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_CONSIDER_RECALL', active: true }] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-rationale`)
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'spoRecallType',
      errorText: 'There is a problem. Select whether you have decided to recall or made a decision not to recall',
    })
  })
  it('SPO rationale - Yes', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_CONSIDER_RECALL', active: true }] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-rationale`)
    cy.selectRadio('Explain the decision', 'Recall')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'spoRecallRationale',
      errorText: 'There is a problem. You must explain your decision',
    })
  })
  it('SPO rationale - No', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_CONSIDER_RECALL', active: true }] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-rationale`)
    cy.selectRadio('Explain the decision', 'Do not recall - send a decision not to recall letter')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'spoNoRecallRationale',
      errorText: 'There is a problem. You must explain your decision',
    })
  })
  it('SPO countersignature', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'SPO_SIGNATURE_REQUESTED', active: true }] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/spo-countersignature`)
    cy.clickButton('Countersign')
    cy.assertErrorMessage({
      fieldName: 'managerCountersignatureExposition',
      errorText: 'You must add a comment to confirm your countersignature',
    })
  })
  it('ACO countersignature', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: 'ACO_SIGNATURE_REQUESTED', active: true }] })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/aco-countersignature`)
    cy.clickButton('Countersign')
    cy.assertErrorMessage({
      fieldName: 'managerCountersignatureExposition',
      errorText: 'You must add a comment to confirm your countersignature',
    })
  })
})
