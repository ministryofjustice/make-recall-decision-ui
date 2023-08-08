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
    cy.visit('http://localhost:3007/?flagSearchByName=0')
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
    cy.getElement(`CRN: ${crnQuery}`).should('exist')
    cy.getElement('No results').should('exist')

    // one search result
    cy.task('getPersonsByCrn', { statusCode: 200, response: getPersonSearchResponse })
    cy.clickLink('Change')
    cy.fillInput('Search', crnQuery)
    cy.clickButton('Search')
    cy.getRowValuesFromTable({ tableCaption: 'Persons found', rowSelector: `[data-qa="row-${crn}"]` }).then(
      ([first, second, third]) => {
        expect(first).to.equal(name)
        expect(second).to.equal(crn)
        expect(third).to.equal(formatDateTimeFromIsoString({ isoDate: dateOfBirth }))
      }
    )

    cy.task('getStatuses', { statusCode: 200, response: [] })
    // link to case summary
    cy.clickLink(name)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Search results')
  })

  const TEMPLATE = {
    results: [
      {
        name: 'Harry 1 Smith',
        crn: 'X098092',
        dateOfBirth: '1980-05-06',
        userExcluded: false,
        userRestricted: false,
      },
      {
        name: 'Harry 2 Hamburger',
        crn: 'X098093',
        dateOfBirth: '1980-05-06',
        userExcluded: false,
        userRestricted: false,
      },
    ],
    paging: { page: 0, pageSize: 10, totalNumberOfPages: 1 },
  }

  it('can search for a person on probation by CRN with search by name flag', () => {
    const crnQuery = 'A12345'
    cy.visit('http://localhost:3007/?flagSearchByName=1')
    cy.clickLink('Start')
    cy.pageHeading().should('equal', 'Search for a person on probation')
    cy.clickLink('Search by case reference number (CRN)')
    // no search term entered
    cy.clickButton('Search')
    cy.assertErrorMessage({
      fieldName: 'crn',
      errorText: 'Enter a Case Reference Number (CRN)',
    })

    // no search results
    cy.task('searchPersons', { statusCode: 200, response: { ...TEMPLATE, results: [] } })
    cy.fillInputByName('crn', crnQuery)
    cy.clickButton('Search')
    cy.pageHeading().should('equal', 'Search results')
    cy.getElement(`Case reference number (CRN): ${crnQuery}`).should('exist')
    cy.getElement('No results found. Double-check you entered the right CRN.').should('exist')

    // one search result
    cy.task('searchPersons', { statusCode: 200, response: TEMPLATE })
    cy.clickLink('Change')
    cy.fillInputByName('crn', crnQuery)
    cy.clickButton('Search')
    cy.getRowValuesFromTable({
      tableCaption: 'Persons found',
      rowSelector: `[data-qa="row-${TEMPLATE.results[0].crn}"]`,
    }).then(([first, second, third]) => {
      expect(first).to.equal(TEMPLATE.results[0].name)
      expect(second).to.equal(TEMPLATE.results[0].crn)
      expect(third).to.equal(formatDateTimeFromIsoString({ isoDate: TEMPLATE.results[0].dateOfBirth }))
    })

    cy.task('getStatuses', { statusCode: 200, response: [] })
    // link to case summary
    cy.clickLink(TEMPLATE.results[0].name)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Search results')
  })

  it('can search for a person on probation by name with search by name flag', () => {
    cy.visit('http://localhost:3007/?flagSearchByName=1')
    cy.clickLink('Start')
    cy.pageHeading().should('equal', 'Search for a person on probation')
    // no search term entered
    cy.clickButton('Search')
    cy.assertErrorMessage({
      fieldName: 'firstName',
      errorText: 'Enter a first name',
    })
    cy.assertErrorMessage({
      fieldName: 'lastName',
      errorText: 'Enter a last name',
    })

    // no search results
    cy.task('searchPersons', { statusCode: 200, response: { ...TEMPLATE, results: [] } })
    cy.fillInput('First name', 'Harry')
    cy.fillInput('Last name', 'Styles')
    cy.clickButton('Search')
    cy.pageHeading().should('equal', 'Search results')
    cy.getElement(`First name: Harry`).should('exist')
    cy.getElement(`Last name: Styles`).should('exist')
    cy.getElement('No results found. Double-check you entered the right name.').should('exist')

    // one search result
    cy.task('searchPersons', { statusCode: 200, response: TEMPLATE })
    cy.clickLink('Change')
    cy.fillInput('First name', 'Harry')
    cy.fillInput('Last name', 'Styles')
    cy.clickButton('Search')
    cy.getRowValuesFromTable({
      tableCaption: 'Persons found',
      rowSelector: `[data-qa="row-${TEMPLATE.results[0].crn}"]`,
    }).then(([first, second, third]) => {
      expect(first).to.equal(TEMPLATE.results[0].name)
      expect(second).to.equal(TEMPLATE.results[0].crn)
      expect(third).to.equal(formatDateTimeFromIsoString({ isoDate: TEMPLATE.results[0].dateOfBirth }))
    })

    cy.getRowValuesFromTable({
      tableCaption: 'Persons found',
      rowSelector: `[data-qa="row-${TEMPLATE.results[1].crn}"]`,
    }).then(([first, second, third]) => {
      expect(first).to.equal(TEMPLATE.results[1].name)
      expect(second).to.equal(TEMPLATE.results[1].crn)
      expect(third).to.equal(formatDateTimeFromIsoString({ isoDate: TEMPLATE.results[1].dateOfBirth }))
    })

    cy.task('getStatuses', { statusCode: 200, response: [] })
    // link to case summary
    cy.clickLink(TEMPLATE.results[0].name)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Search results')
  })
})
