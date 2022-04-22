import getCaseResponse from '../../api/responses/get-case.json'
import { formatDateFromIsoString } from '../../server/utils/dates'

context('Case summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('can view the case summary sections', () => {
    const crn = 'X34983'
    cy.task('getCase', { statusCode: 200, response: getCaseResponse })
    const { personDetails } = getCaseResponse
    cy.visit(`/cases/${crn}/overview`)
    cy.pageHeading().should('equal', 'Personal details')

    cy.getText('personDetails-crn').should('equal', personDetails.crn)
    cy.getText('personDetails-dateOfBirth').should('equal', formatDateFromIsoString(personDetails.dateOfBirth))
    cy.getText('personDetails-age').should('equal', personDetails.age.toString())
    cy.getText('personDetails-gender').should('equal', formatDateFromIsoString(personDetails.gender))
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
    cy.pageHeading().should('equal', 'Personal details')
  })
})
