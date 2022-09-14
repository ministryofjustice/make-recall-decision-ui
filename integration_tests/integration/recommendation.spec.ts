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

  it('can create a recommendation', () => {
    const caseResponse = {
      ...getCaseOverviewResponse,
      activeRecommendation: undefined,
    }
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
    cy.task('createRecommendation', { statusCode: 201, response: recommendationResponse })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseLicenceConditionsResponse })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickButton('Make a recommendation')

    cy.log('===== Response to probation')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'responseToProbation',
      errorText: 'You must explain how Paula Smith has responded to probation',
    })
    cy.fillInput('How has Paula Smith responded to probation so far?', 'Re-offending has occurred')
    cy.clickButton('Continue')

    cy.log('===== Licence conditions')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'licenceConditionsBreached',
      errorText: 'You must select one or more licence conditions',
    })
    cy.selectCheckboxes('What licence conditions has Paula Smith breached?', [
      'Not commit any offence',
      'Supervision in the community',
    ])
    cy.clickButton('Continue')

    cy.log('===== Alternatives to recall tried')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'alternativesToRecallTried',
      errorText: 'You must select which alternatives to recall have been tried already',
    })
    cy.selectCheckboxes('What alternatives to recall have been tried already?', [
      'Increased frequency of reporting',
      'Drug testing',
    ])
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'alternativesToRecallTriedDetail-INCREASED_FREQUENCY',
      errorText: 'Enter more detail for increased frequency of reporting',
    })
    cy.fillInput('Give details', 'Details on reporting', { parent: '#conditional-INCREASED_FREQUENCY' })
    cy.fillInput('Give details', 'Details on drug testing', { parent: '#conditional-DRUG_TESTING' })
    cy.clickButton('Continue')

    cy.log('===== Stop and think')
    cy.pageHeading().should('equal', 'Stop and think')
    cy.clickLink('Continue')

    cy.log('===== Indeterminate sentence')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'isIndeterminateSentence',
      errorText: 'Select whether the person on probation is on an indeterminate sentence or not',
    })
    cy.selectRadio('Is Paula Smith on an indeterminate sentence?', 'Yes')
    cy.clickButton('Continue')

    cy.log('===== Extended sentence')
    cy.get('@offenderName').then(offenderName => cy.selectRadio(`Is ${offenderName} on an extended sentence?`, 'No'))
    cy.clickButton('Continue')

    cy.log('===== Indeterminate sentence type')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'indeterminateSentenceType',
      errorText: 'Select whether Paula Smith is on a life, IPP or DPP sentence',
    })
    cy.selectRadio('What type of sentence is Paula Smith on?', 'Imprisonment for Public Protection (IPP) sentence')
    cy.clickButton('Continue')

    cy.log('===== What do you recommend?')
    cy.pageHeading().should('equal', 'What do you recommend?')
    // validation error
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallType',
      errorText: 'You must select a recommendation',
    })
    cy.selectRadio('What do you recommend?', 'Standard recall')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallTypeDetailsStandard',
      errorText: 'You must explain why you recommend this recall type',
    })
    cy.fillInput('Why do you recommend this recall type?', 'Details...', { parent: '#conditional-recallType-2' })
    cy.clickButton('Continue')

    cy.pageHeading().should('contain', 'Sensitive information')
    cy.clickLink('Continue')

    cy.log('===== Emergency recall')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'isThisAnEmergencyRecall',
      errorText: 'You must select whether this is an emergency recall or not',
    })
    cy.selectRadio('Is this an emergency recall?', 'No')
    cy.clickButton('Continue')

    cy.log('===== Custody status')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'custodyStatus',
      errorText: 'Select whether the person is in custody or not',
    })
    cy.selectRadio('Is Paula Smith in custody now?', 'No')

    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...recommendationResponse, custodyStatus: { selected: 'NO' } },
    })
    cy.clickButton('Continue')

    cy.pageHeading().should('contain', 'Create a Part A form')

    cy.log('===== Vulnerabilities')
    cy.clickLink('Would recall affect vulnerability or additional needs?')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'vulnerabilities',
      errorText: 'Select if there are vulnerabilities or additional needs',
    })
    cy.selectCheckboxes('Consider vulnerability and additional needs. Which of these would recall affect?', [
      'Relationship breakdown',
      'Physical disabilities',
    ])
    cy.fillInput('Give details', 'Details on relationship breakdown', { parent: '#conditional-RELATIONSHIP_BREAKDOWN' })
    cy.fillInput('Give details', 'Details on physical disabilities', { parent: '#conditional-PHYSICAL_DISABILITIES' })
    cy.clickButton('Continue')

    cy.log('===== IOM')
    cy.clickLink('Is Paula Smith under Integrated Offender Management (IOM)?')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'isUnderIntegratedOffenderManagement',
      errorText: 'You must select whether Paula Smith is under Integrated Offender Management',
    })
    cy.selectRadio('Is Paula Smith under Integrated Offender Management (IOM)?', 'Not applicable')
    cy.clickButton('Continue')

    cy.log('===== Police contact details')
    cy.clickLink('Local police contact details')
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
    cy.fillInput('Police contact name', 'Bob Wiggins')
    cy.fillInput('Email address', 'bob.wiggins@met.gov.uk')
    cy.clickButton('Continue')

    cy.log('===== Victim contact scheme')
    cy.clickLink('Are there any victims in the victim contact scheme?')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'hasVictimsInContactScheme',
      errorText: 'You must select whether there are any victims in the victim contact scheme',
    })
    cy.selectRadio('Are there any victims in the victim contact scheme?', 'Yes')
    cy.clickButton('Continue')

    cy.log('===== Victim liaison officer')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'dateVloInformed',
      fieldGroupId: 'dateVloInformed-day',
      errorText: 'Enter the date you told the VLO',
    })
    cy.enterDateTime('2022-04-14', { parent: '#dateVloInformed' })
    cy.clickButton('Continue')

    cy.log('===== What has led to this recall?')
    cy.clickLink('What has led to this recall?')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'whatLedToRecall',
      errorText: 'Enter details of what has led to this recall',
    })
    cy.fillInput('What has led to this recall?', 'Increasingly violent behaviour')
    cy.clickButton('Continue')

    cy.log('===== Arrest issues')
    cy.clickLink('Is there anything the police should know before they arrest Paula Smith?')
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
    cy.fillInput(
      'Give details. Include information about any vulnerable children and adults',
      'Arrest issues details...'
    )
    cy.clickButton('Continue')

    cy.log('===== Contraband')
    cy.clickLink(`Do you think Paula Smith is using recall to bring contraband into prison?`)
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
    cy.fillInput('Give details. Also tell your local police contact about your concerns.', 'Contraband details...')

    // all tasks must be complete in order to show the Create Part A button
    cy.task('getRecommendation', {
      statusCode: 200,
      response: completeRecommendationResponse,
    })
    cy.clickButton('Continue')

    cy.clickLink('Create Part A')

    cy.log('===== Download Part A')
    cy.pageHeading().should('contain', 'Part A created')
    const fileName = 'NAT_Recall_Part_A_X514364.docx'
    cy.readBase64File(fileName).then(fileContents => {
      cy.task('createPartA', {
        response: {
          fileContents,
          fileName,
        },
      })
      cy.downloadDocX('Download the Part A').should('contain', 'PART A: Recall Report')
    })
  })

  it('prevents creating a recommendation if CRN is excluded', () => {
    const caseResponse = {
      ...getCaseOverviewResponse,
      activeRecommendation: undefined,
    }
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
    cy.task('createRecommendation', { statusCode: 403, response: excludedResponse })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
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

  it('licence conditions - shows banner if person has multiple active custodial convictions', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('getCase', licenceConditionsMultipleActiveCustodial)
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.interceptGoogleAnalyticsEvent(
      {
        ea: 'multipleCustodialConvictionsBanner',
        ec: crn,
        el: '2',
      },
      'multipleConvictionsEvent'
    )
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
    cy.getElement('This person has 2 or more active convictions in NDelius').should('exist')
    cy.wait('@multipleConvictionsEvent')
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

  it('recall type - directs "no recall" to the letter page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type`)
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Start the Decision not to Recall letter')
  })

  it('recall type - directs "no recall" to the letter page even if from task list', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(
      `${routeUrls.recommendations}/${recommendationId}/recall-type?fromPageId=task-list&fromAnchor=heading-recommendation`
    )
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Start the Decision not to Recall letter')
  })

  it('victim contact scheme - directs "no" to the task list page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`)
    cy.selectRadio('Are there any victims in the victim contact scheme?', 'No')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Create a Part A form')
  })

  it('indeterminate sentence - directs "no" to the recall type page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/is-indeterminate`)
    cy.selectRadio('Is Paula Smith on an indeterminate sentence?', 'No')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'What do you recommend?')
  })

  it('shows an error if creation fails', () => {
    const caseResponse = {
      ...getCaseOverviewResponse,
      activeRecommendation: undefined,
    }
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
    cy.task('createRecommendation', { statusCode: 500, response: 'API save error' })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickButton('Make a recommendation')
    cy.getElement('An error occurred creating a new recommendation').should('exist')
  })

  it('can update a draft recommendation', () => {
    const caseResponse = {
      ...getCaseOverviewResponse,
      activeRecommendation: {
        recommendationId: '123',
        lastModifiedDate: '2022-07-01-01T00:00:000',
        lastModifiedBy: 'John Smith',
      },
    }
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseResponse })
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickLink('Update recommendation')
    cy.pageHeading().should('equal', 'Create a Part A form')
  })
})
