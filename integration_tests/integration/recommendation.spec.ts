import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import { formOptions } from '../../server/controllers/recommendations/helpers/formOptions'

context('Make a recommendation', () => {
  beforeEach(() => {
    cy.signIn()
  })

  const crn = 'X34983'
  const recommendationId = '123'
  const recommendationResponse = {
    id: recommendationId,
    crn,
    recallType: {
      selected: {},
      allOptions: formOptions.recallType,
    },
    custodyStatus: {
      allOptions: formOptions.custodyStatus,
    },
    personOnProbation: {
      name: 'Paula Smith',
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
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagRecommendationProd=1`)
    cy.clickButton('Make a recommendation')

    cy.log('===== Response to probation')
    // validation error
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'responseToProbation',
      errorText: 'You must explain how Paula Smith has responded to probation',
    })
    cy.fillInput('How has Paula Smith responded to probation so far?', 'Re-offending has occurred')
    cy.clickButton('Continue')

    cy.log('===== Stop and think')
    cy.pageHeading().should('equal', 'Stop and think')
    cy.clickLink('Continue')

    cy.log('===== What do you recommend?')
    cy.pageHeading().should('equal', 'What do you recommend?')
    // validation error
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallType',
      errorText: 'Select a recommendation',
    })
    cy.selectRadio('What do you recommend?', 'Fixed term recall')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recallTypeDetailsFixedTerm',
      errorText: 'Why do you recommend this recall type?',
      fieldError: 'Enter more detail',
    })
    cy.fillInput('Why do you recommend this recall type?', 'Details...')
    cy.clickButton('Continue')

    cy.log('===== Emergency recall')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'isThisAnEmergencyRecall',
      errorText: 'You must indicate if this is an emergency recall',
    })
    cy.selectRadio('Is this an emergency recall?', 'No')
    cy.clickButton('Continue')

    cy.log('===== Custody status')
    cy.selectRadio('Is Paula Smith in custody now?', 'Yes, police custody')
    cy.clickButton('Continue')

    cy.log('===== Victim contact scheme')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'hasVictimsInContactScheme',
      errorText: 'Select whether there are any victims in the victim contact scheme',
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

  it('recall type - directs "no recall" to the letter page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/recall-type?flagRecommendationProd=1`)
    cy.selectRadio('What do you recommend?', 'No recall')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Start the Decision not to Recall letter')
  })

  it('victim contact scheme - directs "no" to the confirmation page', () => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendationResponse })
    cy.visit(`${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme?flagRecommendationProd=1`)
    cy.selectRadio('Are there any victims in the victim contact scheme?', 'No')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Part A created')
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
    cy.pageHeading().should('equal', 'How has Paula Smith responded to probation so far?')
  })
})
