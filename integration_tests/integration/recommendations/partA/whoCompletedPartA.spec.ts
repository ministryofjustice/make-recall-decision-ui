import { fakerEN_GB as faker } from '@faker-js/faker'
import ppPaths from '../../../../server/routes/paths/pp.paths'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import { testStandardBackLink } from '../../../componentTests/backLink.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'

context('Who Completed Part A Page', () => {
  const recommendationId = faker.number.int()

  beforeEach(() => {
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  describe('Page Data', () => {
    const testPageUrl = `/recommendations/${recommendationId}/${ppPaths.whoCompletedPartA}`

    it('Standard page load', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.title().should('equal', `Who completed this Part A? - ${config.applicationName}`)

      testStandardBackLink()

      cy.pageHeading().should('equal', 'Who completed this Part A?')

      cy.get('#name').should('have.attr', 'type', 'text')
      cy.get('label[for="name"]').should('contain.text', 'Name')

      cy.get('#jobTitle').should('exist')
      cy.get('label[for="jobTitle"]').should('contain.text', 'Job title')

      cy.get('#email').should('have.attr', 'type', 'email')
      cy.get('label[for="email"]').should('contain.text', 'Email')

      cy.get('#telephone').should('have.attr', 'type', 'tel')
      cy.get('label[for="telephone"]').should('contain.text', 'Telephone')
      cy.get('#telephone-hint').should('contain.text', 'PPCS may use this number to ask queries')

      cy.get('#region').should('exist')
      cy.get('label[for="region"]').should('contain.text', 'Region')

      cy.get('#localDeliveryUnit').should('have.attr', 'type', 'text')
      cy.get('label[for="localDeliveryUnit"]').should('contain.text', 'Local Delivery Unit')

      cy.get('.govuk-radios').should('exist')
      cy.get('.govuk-fieldset__legend').should(
        'contain.text',
        `Is this person the probation practitioner for ${recommendation.personOnProbation.name}?`,
      )

      cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
    })

    it('There are no previous responses to the questions - The input areas are empty', () => {
      const recommendation = RecommendationResponseGenerator.generate({ whoCompletedPartA: 'none' })
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.get('#name').should('have.value', '')
      cy.get('#jobTitle').should('have.value', '')
      cy.get('#email').should('have.value', '')
      cy.get('#telephone').should('have.value', '')
      cy.get('#region').should('have.value', '')
      cy.get('#localDeliveryUnit').should('have.value', '')
    })

    it('There are previous responses to the questions - The input areas are filled in', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.get('#name').should('have.value', recommendation.whoCompletedPartA.name)
      cy.get('#jobTitle').should('have.value', recommendation.whoCompletedPartA.jobTitle)
      cy.get('#email').should('have.value', recommendation.whoCompletedPartA.email)
      cy.get('#telephone').should('have.value', recommendation.whoCompletedPartA.telephone)
      cy.get('#region').should('have.value', recommendation.whoCompletedPartA.region)
      cy.get('#localDeliveryUnit').should('have.value', recommendation.whoCompletedPartA.localDeliveryUnit)
    })

    it('No responses provided and submit button clicked - errors displayed', () => {
      const recommendation = RecommendationResponseGenerator.generate({ whoCompletedPartA: 'none' })
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.get('button.govuk-button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'name',
          message: 'Enter the name of the person who completed the Part A',
        },
        {
          href: 'jobTitle',
          message: 'Select a job title',
          errorStyleClass: 'govuk-select--error',
        },
        {
          href: 'email',
          message: 'Enter the GOV.UK email of the person who completed the Part A',
        },
        {
          href: 'isPersonProbationPractitionerForOffender',
          message: `Select whether this person is the probation practitioner for ${recommendation.personOnProbation.name}`,
          checkFieldHasErrorStyling: false,
        },
      ])
    })
  })
})
