import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Search for a person', () => {
  beforeEach(() => {
    cy.signIn()
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseRiskResponse })
    cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: getCasePersonalDetailsResponse })
    cy.task('getCase', { sectionId: 'contact-history', statusCode: 200, response: getCaseOverviewResponse })
    cy.task('getCase', { sectionId: 'licence-conditions', statusCode: 200, response: getCaseOverviewResponse })
    cy.task('getCase', { sectionId: 'contact-log', statusCode: 200, response: getCaseOverviewResponse })
  })

  it('can search for a person on probation', () => {
    const crnQuery = 'A12345'
    const { name, dateOfBirth, crn } = getPersonSearchResponse[0]
    cy.clickLink('Start')
    cy.pageHeading().should('equal', 'Search for a person on probation')

    // no search term entered
    cy.clickButton('Search')
    cy.assertErrorMessage({
      fieldName: 'crn',
      errorText: 'Enter a Case Reference Number (CRN)',
    })

    // no search results
    cy.task('getPersonsByCrn', { statusCode: 200, response: [] })
    cy.fillInput('Search', crnQuery)
    cy.clickButton('Search')
    cy.pageHeading().should('equal', 'Search results')
    cy.getElement(`Search Term: ${crnQuery}`).should('exist')
    cy.getElement('No results').should('exist')

    // one search result
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    cy.clickLink('Change')
    cy.fillInput('Search', crnQuery)
    cy.clickButton('Search')
    cy.getRowValuesFromTable({ tableCaption: 'Persons found', rowQaAttr: `row-${crn}` }).then(
      ([first, second, third]) => {
        expect(first).to.equal(name)
        expect(second).to.equal(crn)
        expect(third).to.equal(formatDateTimeFromIsoString({ isoDate: dateOfBirth }))
      }
    )

    // link to case summary
    cy.clickLink(name)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Search for a person on probation')
  })
})
