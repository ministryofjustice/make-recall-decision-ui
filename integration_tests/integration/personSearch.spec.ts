import getPersonSearchResponse from '../../api/responses/get-person-search.json'
import { formatDateFromIsoString } from '../../server/utils/dates'

context('Search for a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('can search for a person on probation', () => {
    const crnQuery = 'A12345'
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    const { name, dateOfBirth, crn } = getPersonSearchResponse[0]
    cy.signIn()
    cy.pageHeading().should('equal', 'Search for a person on probation')
    cy.fillInput('Search', crnQuery)
    cy.clickButton('Search')
    cy.pageHeading().should('equal', 'Search results')
    cy.getElement(`CRN: ${crnQuery}`).should('exist')
    cy.getRowValuesFromTable({ tableCaption: 'Persons found', rowQaAttr: 'row-1' }).then(([first, second, third]) => {
      expect(first).to.equal(name)
      expect(second).to.equal(crn)
      expect(third).to.equal(formatDateFromIsoString(dateOfBirth))
    })
  })
})
