import { fakerEN_GB as faker } from '@faker-js/faker'
import { ppcsPaths } from '../../../../server/routes/paths/ppcs'
import { testTable } from '../../../componentTests/table.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { RECOMMENDATION_STATUS } from '../../../../server/middleware/recommendationStatus'
import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'

context('PPCS Search Results Page', () => {
  const crn = faker.string.alphanumeric({ length: 6, casing: 'upper' })
  const recommendationId = faker.number.int()

  const testPageUrl = `${ppcsPaths.ppcsSearchResults}?crn=${crn}`

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

          cy.visit(testPageUrl)

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
            .and('have.attr', 'href', `/${ppcsPaths.ppcsSearch}`)
        })
      })
    })
  })
})
