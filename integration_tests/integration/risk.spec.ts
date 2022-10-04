import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import { routeUrls } from '../../server/routes/routeUrls'
import getCaseRiskNoDataResponse from '../../api/responses/get-case-risk-no-data.json'

context('Risk page', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.signIn()
  })

  it('shows RoSH, MAPPA and predictor scores', () => {
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    cy.pageHeading().should('equal', 'Risk for Paula Smith')
    cy.getElement({ qaAttr: 'banner-incomplete-assessment' }).should('not.exist')
    // Content panels
    cy.viewDetails('View more detail on Details of the risk').should(
      'contain',
      getCaseRiskResponse.natureOfRisk.description
    )
    cy.viewDetails('View more detail on Who is at risk').should('contain', getCaseRiskResponse.whoIsAtRisk.description)
    cy.viewDetails('View more detail on Circumstances that will increase the risk').should(
      'contain',
      getCaseRiskResponse.circumstancesIncreaseRisk.description
    )
    // RoSH table
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Children' }).then(rowValues => {
      expect(rowValues[0]).to.equal('Low')
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Public' }).then(rowValues => {
      expect(rowValues[0]).to.equal('Very high')
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Known adult' }).then(rowValues => {
      expect(rowValues[0]).to.equal('Medium')
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Staff' }).then(rowValues => {
      expect(rowValues[0]).to.equal('High')
    })

    // MAPPA level
    cy.getElement('Cat 2/Level 1 MAPPA').should('exist')
  })

  it('shows messages if RoSH / MAPPA / predictor score data is missing', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: getCaseRiskNoDataResponse,
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    cy.getElement('UNKNOWN LEVEL RoSH')
    cy.getElement(
      'A RoSH summary has not been completed for this individual. Check OASys for this persons current assessment status.'
    )
    cy.getElement('No MAPPA')
  })

  it('shows Unknown MAPPA if MAPPA data is null', () => {
    const riskResponse = {
      personalDetailsOverview: {
        name: 'Paula Smith',
        dateOfBirth: '2000-11-09',
        age: 21,
        gender: 'Male',
        crn: 'A12345',
      },
      mappa: null,
    }
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: riskResponse,
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    cy.getElement('UNKNOWN MAPPA')
  })

  it('shows a message if the assessment is incomplete', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: { ...getCaseRiskResponse, assessmentStatus: 'INCOMPLETE' },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    cy.getText('banner-incomplete-assessment').should(
      'equal',
      'This information is from the latest complete OASys assessment. Check OASys for new information. There’s a more recent assessment that’s not complete.'
    )
  })
})
