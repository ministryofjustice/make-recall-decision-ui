import { fakerEN_GB as faker } from '@faker-js/faker'
import ppPaths from '../../../../server/routes/paths/pp'
import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import { testStandardBackLink } from '../../../componentTests/backLink.tests'
import testRadioButtons from '../../../componentTests/radioButtons.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'

context('Arrest Issues page', () => {
  const recommendationId = faker.number.int()
  const testPageUrl = `/recommendations/${recommendationId}/${ppPaths.arrestIssues}`

  beforeEach(() => {
    cy.session('login', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION'] })
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
  })

  describe('Page Data', () => {
    describe('Standard page load', () => {
      const testCases = [
        {
          description: 'with no arrest issues option selected',
          recommendation: RecommendationResponseGenerator.generate({
            hasArrestIssues: 'none',
          }),
        },
        {
          description: 'with arrest issues option YES selected and details provided',
          recommendation: RecommendationResponseGenerator.generate({
            hasArrestIssues: {
              selected: true,
              details: 'The person on probation has a history of violence towards the police.',
            },
          }),
        },
      ]
      testCases.forEach(({ description, recommendation }) => {
        it(description, () => {
          cy.task('getRecommendation', { statusCode: 200, response: recommendation })

          cy.visit(testPageUrl)

          cy.title().should(
            'equal',
            `Is there anything the police should know before they arrest the person? - ${config.applicationName}`,
          )

          testStandardBackLink()

          cy.pageHeading().should(
            'equal',
            `Is there anything the police should know before they arrest ${recommendation.personOnProbation.name}?`,
          )

          testRadioButtons(cy.get('.govuk-form-group'), {
            legend: {
              text: `Is there anything the police should know before they arrest ${recommendation.personOnProbation.name}?`,
            },
            options: [
              {
                input: {
                  id: 'hasArrestIssues',
                  name: '',
                  value: 'YES',
                  checked: recommendation.hasArrestIssues?.selected === true,
                },
                label: {
                  text: 'Yes',
                },
              },
              {
                input: {
                  id: 'hasArrestIssues-2',
                  name: '',
                  value: 'NO',
                  checked: recommendation.hasArrestIssues?.selected === false,
                },
                label: {
                  text: 'No',
                },
              },
            ],
          })

          if (recommendation.hasArrestIssues?.details) {
            cy.get('.govuk-radios__conditional')
              .should('exist')
              .should('contain.text', recommendation.hasArrestIssues.details)

            cy.get('.govuk-radios__conditional')
              .get('.govuk-hint')
              .should('exist')
              .should(
                'contain.text',
                'Give details about any potential risk to staff. Include information on any children or vulnerable adults.',
              )

            cy.get('.govuk-radios__conditional--hidden').should('not.exist')
          } else {
            cy.get('.govuk-radios__conditional--hidden').should('exist')
          }

          // Continue Button
          cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
        })
      })
    })
  })

  describe('Error message display', () => {
    it('Displays error message when no arrest issues option is selected', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        hasArrestIssues: 'none',
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'hasArrestIssues',
          message: "Select whether there's anything the police should know",
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
      ])
    })

    it('Displays error message when YES is selected but details are not provided', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        hasArrestIssues: 'none',
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.get('[type="radio"]').check('YES')

      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'hasArrestIssuesDetailsYes',
          message: 'Enter details of the arrest issues',
          errorStyleClass: 'govuk-textarea--error',
        },
      ])
    })
  })
})
