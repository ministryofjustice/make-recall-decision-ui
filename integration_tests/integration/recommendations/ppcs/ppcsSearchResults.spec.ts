import { fakerEN_GB as faker } from '@faker-js/faker'
import ppcsPaths from '../../../../server/routes/paths/ppcs.paths'
import { testTable } from '../../../componentTests/table.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'

context('PPCS Search Results Page', () => {
  const crn = faker.string.alphanumeric({ length: 6, casing: 'upper' })
  const recommendationId = faker.number.int()

  const testPageUrl = `${ppcsPaths.searchResults}?crn=${crn}`

  beforeEach(() => {
    cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
    cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
  })

  describe('Page Data', () => {
    const name = faker.person.fullName()
    const dateOfBirth = faker.date.past().toDateString()

    const testCases = [
      {
        description: 'Booking not yet started for recommendation',
        bookingOnStarted: false,
        buttonLink: ppcsPaths.searchPpud,
      },
      {
        description: 'Booking already started for recommendation',
        bookingOnStarted: true,
        buttonLink: ppcsPaths.bookToPpud,
      },
    ]
    describe('Standard page load', () => {
      testCases.forEach(testCase => {
        it(`${testCase.description}`, () => {
          cy.task('ppcsSearch', {
            statusCode: 200,
            response: {
              results: [{ name, crn, dateOfBirth, recommendationId }],
            },
          })
          cy.task('getRecommendation', {
            statusCode: 200,
            response: RecommendationResponseGenerator.generate({
              bookingMemento: testCase.bookingOnStarted ? null : 'none',
            }),
          })
          cy.task('getStatuses', {
            statusCode: 200,
            response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
          })

          cy.visit(`${testPageUrl}&bookingToolAccess=1`)

          cy.pageHeading().should('contain', 'Search results')
          const crnRegexp = new RegExp(`\\s*Case reference number \\(CRN\\):\\s+${crn}\\s*`)
          cy.get('.govuk-body-l').invoke('text').should('match', crnRegexp)

          testTable(cy.get('table.govuk-table'), {
            caption: 'Persons found',
            header: { cells: ['Name', 'CRN', 'Date of birth'] },
            rows: [{ cells: [name, crn, dateOfBirth] }],
          })

          const expectedButtonLink = testCase.bookingOnStarted ? ppcsPaths.bookToPpud : ppcsPaths.searchPpud
          cy.get('a.govuk-button')
            .eq(0)
            .should('contain.text', 'Continue')
            .and('have.attr', 'href', `/recommendations/${recommendationId}/${expectedButtonLink}`)

          cy.get('a.govuk-button')
            .eq(1)
            .should('have.class', 'govuk-button--secondary')
            .should('contain.text', 'Search for another CRN')
            .and('have.attr', 'href', `/${ppcsPaths.search}`)
        })
      })
    })
  })

  describe('No results', () => {
    it('displays no results page when search returns empty results', () => {
      cy.task('ppcsSearch', {
        statusCode: 200,
        response: { results: [] },
      })

      cy.visit(`${testPageUrl}&bookingToolAccess=1`)

      cy.pageHeading().should('contain', 'No recall request found')
      cy.get('h2')
        .should('contain', `You entered case reference number (CRN):`)
        .within(() => {
          cy.get('span').should('contain', crn)
        })

      cy.get('p.govuk-body')
        .eq(0)
        .should(
          'contain',
          'Double-check you entered the right CRN. If it’s correct, contact probation staff to check if:',
        )

      cy.get('.govuk-list').within(() => {
        cy.get('li')
          .eq(0)
          .should('contain', 'another recall recommendation has been started - this may need to be deleted')
        cy.get('li')
          .eq(1)
          .should(
            'contain',
            'a contact has been recorded in NDelius called ‘Management oversight - recall’ - a probation line manager needs to complete this',
          )
      })

      cy.get('p.govuk-body').eq(1).should('contain', 'One or both of these issues may need to be fixed.')

      cy.get('a.govuk-button').should('contain.text', 'Search for another CRN').and('have.attr', 'href', '/ppcs-search')
    })
  })

  describe('Booking tool access is disabled', () => {
    it('displays no results page when bookingToolAccess flag is disabled', () => {
      cy.task('ppcsSearch', {
        statusCode: 200,
        response: { results: [] },
      })

      cy.visit(testPageUrl)

      cy.pageHeading().should('contain', 'No recall request found')
      cy.get('a.govuk-button').should('contain.text', 'Search for another CRN').and('have.attr', 'href', '/ppcs-search')
    })
  })
})
