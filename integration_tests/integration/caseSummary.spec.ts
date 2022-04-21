import getCaseResponse from '../../api/responses/get-case.json'
import { formatDateFromIsoString } from '../../server/utils/dates'

context('Case summary', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('can search for a person on probation', () => {
    const crn = 'X34983'
    cy.task('getCase', { statusCode: 200, response: getCaseResponse })
    const { personDetails } = getCaseResponse
    cy.visit(`/cases/${crn}/overview`)
    cy.pageHeading().should('equal', personDetails.name)

    cy.getText('personDetails-crn').should('equal', personDetails.crn)
    cy.getText('personDetails-dateOfBirth').should('equal', formatDateFromIsoString(personDetails.dateOfBirth))
    cy.getText('personDetails-age').should('equal', personDetails.age.toString())
    cy.getText('personDetails-gender').should('equal', formatDateFromIsoString(personDetails.gender))
    // tabs
    cy.clickLink('Risk')
    cy.getElement('Risk of serious harm (RoSH) summary').should('exist')
    cy.clickLink('Licence history')
    cy.getElement('Licence history').should('exist')
    cy.clickLink('Licence conditions')
    cy.getElement('Licence conditions').should('exist')
    cy.clickLink('Contact log')
    cy.getElement('Contact log').should('exist')
    cy.clickLink('Overview')
    cy.getElement('Personal details').should('exist')
  })
})
