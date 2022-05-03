import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import { formatDateFromIsoString } from '../../server/utils/dates'
import { routeUrls } from '../../server/routes/routeUrls'

context('Case summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseRiskResponse })
    cy.task('getCase', { sectionId: 'licence-history', statusCode: 200, response: getCaseOverviewResponse })
    cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseOverviewResponse })
    cy.task('getCase', { sectionId: 'contact-log', statusCode: 200, response: getCaseOverviewResponse })
  })

  it('can view the overview page', () => {
    const crn = 'X34983'
    const { personDetails } = getCaseOverviewResponse
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview')

    cy.getText('personDetails-crn').should('equal', personDetails.crn)
    cy.getText('personDetails-dateOfBirth').should('equal', formatDateFromIsoString(personDetails.dateOfBirth))
    cy.getText('personDetails-age').should('equal', personDetails.age.toString())
    cy.getText('personDetails-gender').should('equal', formatDateFromIsoString(personDetails.gender))
    // personal details
    cy.getDefinitionListValue('Current address').should('equal', '5 Anderton Road, Newham, London E15 1UJ')
    cy.getDefinitionListValue('Offender manager').should('contain', 'Jenny Eclair - N07, NPS London')
    cy.getDefinitionListValue('Offender manager').should('contain', 'Telephone: 07824637629')
    cy.getDefinitionListValue('Offender manager').should('contain', 'Email: jenny@probation.com')
    cy.getLinkHref('jenny@probation.com').should('equal', 'mailto:jenny@probation.com')
    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')
    // offence overview
    cy.getDefinitionListValue('Index offence').should('equal', 'Robbery (other than armed robbery)')
  })

  it('can view the risk page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.pageHeading().should('equal', 'Risk')

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
    cy.getElement('OSP/C score - 3.45').should('exist')
    cy.getElement('OSP/I score - 5.3').should('exist')
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
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    // tabs
    cy.clickLink('Risk')
    cy.pageHeading().should('equal', 'Risk')
    cy.clickLink('Licence history')
    cy.pageHeading().should('equal', 'Licence summary')
    cy.clickLink('Licence conditions')
    cy.pageHeading().should('equal', 'Licence conditions')
    cy.clickLink('Contact log')
    cy.pageHeading().should('equal', 'Contact log')
    cy.clickLink('Overview')
    cy.pageHeading().should('equal', 'Overview')
  })
})
