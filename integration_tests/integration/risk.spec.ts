import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import { routeUrls } from '../../server/routes/routeUrls'
import getCaseRiskNoDataResponse from '../../api/responses/get-case-risk-no-data.json'

context('Risk page', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.signIn()
  })

  it.only('shows RoSH, MAPPA and predictor scores', () => {
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    cy.pageHeading().should('equal', 'Risk for Paula Smith')
    cy.getElement({ qaAttr: 'banner-latest-complete-assessment' }).should('not.exist')
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

    // score history
    let opts = { parent: '[data-qa="timeline-item-1"]' }
    cy.getElement('13 July 2021', opts).should('be.visible')
    cy.getElement('RSR HIGH 18', opts).should('be.visible')
    cy.getElement('OSP/C LOW', opts).should('be.visible')
    cy.getElement('OSP/I MEDIUM', opts).should('be.visible')
    cy.getElement('OGRS 1YR MEDIUM 10', opts).should('be.visible')
    cy.getElement('OGRS 2YR MEDIUM 20', opts).should('be.visible')
    cy.getElement('OGP 1YR HIGH 56', opts).should('be.visible')
    cy.getElement('OGP 2YR HIGH 63', opts).should('be.visible')
    cy.getElement('OVP 1YR VERY HIGH 34', opts).should('be.visible')
    cy.getElement('OVP 2YR VERY HIGH 64', opts).should('be.visible')

    opts = { parent: '[data-qa="timeline-item-2"]' }
    cy.getElement('4 May 2019', opts).should('be.visible')
    cy.getElement('RSR MEDIUM 12', opts).should('be.visible')
    cy.getElement('OSP/C MEDIUM', opts).should('be.visible')
    cy.getElement('OSP/I LOW', opts).should('be.visible')
    cy.getElement('OGRS 1YR HIGH 45', opts).should('be.visible')
    cy.getElement('OGRS 2YR HIGH 55', opts).should('be.visible')
    cy.getElement('OGP 1YR VERY HIGH 77', opts).should('be.visible')
    cy.getElement('OGP 2YR VERY HIGH 85', opts).should('be.visible')
    cy.getElement('OVP 1YR VERY HIGH 82', opts).should('be.visible')
    cy.getElement('OVP 2YR VERY HIGH 91', opts).should('be.visible')
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

  it('score timeline - shows message if no predictor data found', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: getCaseRiskNoDataResponse,
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    cy.getText('score-history-missing').should('equal', 'No history found.')
  })

  it('score timeline - shows message if error occurs fetching predictor data', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: {
        ...getCaseRiskNoDataResponse,
        predictorScores: {
          error: 'SERVER_ERROR',
        },
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    cy.getText('score-history-missing').should('equal', 'An error occurred getting the scores history.')
  })

  it('score timeline - hide individual scores if missing', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: {
        ...getCaseRiskResponse,
        predictorScores: {
          historical: [
            {
              date: '2021-07-13',
              scores: {
                RSR: null,
                OSPC: {
                  level: 'LOW',
                  score: 6.8,
                  type: 'OSP/C',
                },
              },
            },
          ],
        },
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
    const opts = { parent: '[data-qa="timeline-item-1"]' }
    cy.get('[data-qa="timeline-item-1"]').should('not.contain', 'RSR')
    cy.getElement('OSP/C LOW', opts).should('be.visible')
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
    cy.getText('banner-latest-complete-assessment').should(
      'equal',
      'This information is from the latest complete OASys assessment. Check OASys for new information. There’s a more recent assessment that’s not complete.'
    )
  })
})
