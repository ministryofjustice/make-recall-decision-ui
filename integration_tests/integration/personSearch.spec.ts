import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import { formatDateFromIsoString } from '../../server/utils/dates'
import getCaseResponse from '../../api/responses/get-case-overview.json'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'licence-history', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseResponse })
    cy.task('getCase', { sectionId: 'contact-log', statusCode: 200, response: getCaseResponse })
  })

  it('can search for a person on probation', () => {
    const crnQuery = 'A12345'
    const { name, dateOfBirth, crn } = getPersonSearchResponse[0]
    cy.signIn()
    cy.pageHeading().should('equal', 'Search for a person on probation')
    cy.fillInput('Search', crnQuery)

    // no search results
    cy.task('getPersonsByCrn', { statusCode: 200, response: [] })
    cy.clickButton('Search')
    cy.pageHeading().should('equal', 'Search results')
    cy.getElement(`CRN: ${crnQuery}`).should('exist')
    cy.getElement('No results').should('exist')

    // one search result
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    cy.clickLink('Change')
    cy.fillInput('Search', crnQuery)
    cy.clickButton('Search')
    cy.getRowValuesFromTable({ tableCaption: 'Persons found', rowQaAttr: 'row-1' }).then(([first, second, third]) => {
      expect(first).to.equal(name)
      expect(second).to.equal(crn)
      expect(third).to.equal(formatDateFromIsoString(dateOfBirth))
    })

    // link to case summary
    cy.clickLink(name)
    cy.pageHeading().should('equal', 'Overview')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Search for a person on probation')
  })
})
