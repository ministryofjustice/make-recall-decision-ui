import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Case summary', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('can view the overview page with a list of offences', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    // offence overview
    cy.getDefinitionListValue('Offences').should('contain', 'Robbery (other than armed robbery)')
    cy.getDefinitionListValue('Offences').should('contain', 'Shoplifting')
    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')
  })

  it('changes label to Offence if there is only one', () => {
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        offences: [
          {
            mainOffence: true,
            description: 'Robbery (other than armed robbery)',
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getDefinitionListValue('Offence').should('contain', 'Robbery (other than armed robbery)')
  })

  it('can view the personal details page', () => {
    const crn = 'X34983'
    const { personalDetailsOverview } = getCaseOverviewResponse
    cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
    cy.pageHeading().should('equal', 'Personal details for Paula Smith')

    cy.getText('personalDetailsOverview-crn').should('equal', personalDetailsOverview.crn)
    cy.getText('personalDetailsOverview-dateOfBirth').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: personalDetailsOverview.dateOfBirth })
    )
    cy.getText('personalDetailsOverview-age').should('equal', personalDetailsOverview.age.toString())
    cy.getText('personalDetailsOverview-gender').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: personalDetailsOverview.gender })
    )
    // personal details
    cy.getDefinitionListValue('Current address').should('contain', '5 Anderton Road')
    cy.getDefinitionListValue('Current address').should('contain', 'Newham')
    cy.getDefinitionListValue('Current address').should('contain', 'London')
    cy.getDefinitionListValue('Current address').should('contain', 'E15 1UJ')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Name: Jenny Eclair')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Code: N07')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Team: NPS London')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Telephone: 07824637629')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Email: jenny@probation.com')
    cy.getLinkHref('jenny@probation.com').should('equal', 'mailto:jenny@probation.com')
  })

  it('can view the risk page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.pageHeading().should('equal', 'Risk for Paula Smith')

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
    cy.getElement('CAT 2/LEVEL 1').should('exist')

    // predictor graphs
    cy.getElement('Risk of serious recidivism (RSR) score - 23').should('exist')
    cy.getElement('OSP/C score').should('exist')
    cy.getElement('OSP/I score').should('exist')
    cy.getElement('OGRS score - 12').should('exist')

    // score history
    cy.getElement('14 May 2019 at 12:00').should('exist')
    cy.getElement('12 September 2018 at 12:00').should('exist')
    cy.getElement('RSR HIGH 18').should('not.be.visible')
    cy.clickLink('Open all')
    cy.getElement('RSR HIGH 18').should('be.visible')
    cy.getElement('RSR MEDIUM 12').should('be.visible')
  })

  it('can switch between case summary pages', () => {
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    // tabs
    cy.clickLink('Personal details')
    cy.pageHeading().should('equal', 'Personal details for Paula Smith')
    cy.clickLink('Contact history')
    cy.pageHeading().should('equal', 'Contact history for Charles Edwin')
    cy.clickLink('Licence conditions')
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    cy.clickLink('Overview')
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
  })

  it('can switch to risk page if flag is enabled', () => {
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview?flagShowMockedUi=1`)
    cy.clickLink('Risk')
    cy.pageHeading().should('equal', 'Risk for Paula Smith')
  })
})
