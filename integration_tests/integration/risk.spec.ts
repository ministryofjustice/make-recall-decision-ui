import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import { routeUrls } from '../../server/routes/routeUrls'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseRiskNoDataResponse from '../../api/responses/get-case-risk-no-data.json'

context('Risk page', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.signIn()
  })

  it('shows RoSH, MAPPA and predictor scores', () => {
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.pageHeading().should('equal', 'Risk for Paula Smith')

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
    cy.getElement('CAT 2/LEVEL 1').should('exist')

    // predictor graphs
    cy.getElement('Risk of serious recidivism (RSR) score - 23').should('exist')
    cy.getElement('OSP/C score').should('exist')
    cy.getElement('OSP/I score').should('exist')

    // score history
    cy.getElement('14 May 2019 at 12:00').should('exist')
    cy.getElement('12 September 2018 at 12:00').should('exist')
    cy.getElement('RSR HIGH 18').should('not.be.visible')
    cy.clickLink('Open all')
    cy.getElement('RSR HIGH 18').should('be.visible')
    cy.getElement('RSR MEDIUM 12').should('be.visible')
  })

  it('shows messages if RoSH / MAPPA / predictor score data is missing', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: getCaseRiskNoDataResponse,
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.getElement('UNKNOWN LEVEL RoSH')
    cy.getElement(
      'A RoSH summary has not been completed for this individual. Check OASys for this persons current assessment status.'
    )
    cy.getElement('NO MAPPA')
    cy.getText('ospc-missing').should('equal', 'Not available.')
    cy.getText('rsr-missing').should('equal', 'Not available.')
    cy.getText('ospi-missing').should('equal', 'Not available.')
  })

  it('shows risk components using mocked data if flag is enabled', () => {
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    cy.visit(`${routeUrls.cases}/${crn}/risk?flagShowMockedUi=1`)
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

    cy.getElement('OGRS score - 12').should('exist')
  })
})
