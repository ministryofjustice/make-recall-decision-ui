import getCaseResponse from '../../api/responses/get-case-overview.json'
import { formatDateFromIsoString } from '../../server/utils/dates'

context('Case summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'licence-history', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'contact-log', statusCode: 200, response: getCaseResponse })
  })

  it('can view the case summary overview', () => {
    const crn = 'X34983'
    const { personDetails } = getCaseResponse
    cy.visit(`/cases/${crn}/overview`)
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

  it('can switch between case summary pages', () => {
    const crn = 'X34983'
    cy.visit(`/cases/${crn}/overview`)
    // tabs
    cy.clickLink('Risk')
    cy.pageHeading().should('equal', 'Risk of serious harm (RoSH) summary')
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
