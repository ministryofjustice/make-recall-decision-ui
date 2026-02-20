import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import { testBackLink, testStandardBackLink } from '../../../componentTests/backLink.tests'
import { ppPaths } from '../../../../server/routes/paths/pp'
import config from '../../../../server/config'

context('Trigger leading to recall Page', () => {
  const recommendationId = faker.number.int()
  const testPageUrl = `/recommendations/${recommendationId}/${ppPaths.triggerLeadingToRecall}`

  beforeEach(() => {
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  describe('Page Data', () => {
    describe('Standard page load', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      })

      it('Feature flag FTR-56 enabled', () => {
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

        cy.title().should('equal', `What has made you consider recalling the person? - ${config.applicationName}`)

        // Back link
        testBackLink(
          `/recommendations/${recommendationId}/${ppPaths.taskListConsiderRecall}`,
          'Back to Consider a recall questions',
          false
        )

        // Page Heading
        cy.pageHeading().should(
          'equal',
          `What has made you consider recalling ${recommendation.personOnProbation.name}?`
        )

        // Main content
        cy.get('.govuk-hint').as('hint')

        cy.get('@hint')
          .find('p')
          .eq(0)
          .contains('Explain the circumstances and behaviour leading you to consider recall, analysing:')

        cy.get('@hint')
          .find('ul')
          .should('contain.text', 'any alleged further offending or charges, and the behaviour around them')
          .and('contain.text', 'how they breached licence conditions')
          .and('contain.text', 'why the risk they pose is not manageable in the community')
          .and('contain.text', 'their response to supervision so far')
          .and('contain.text', 'if the behaviour seems out of character')

        cy.get('@hint')
          .find('p')
          .eq(1)
          .contains('Give as much information as possible. This explanation will be recorded in NDelius.')

        // Continue button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })

      it('Feature flag FTR-56 disabled', () => {
        cy.visit(testPageUrl)

        cy.title().should('equal', `What has made you consider recalling the person? - ${config.applicationName}`)

        // Back link
        testStandardBackLink()

        // Page Heading
        cy.pageHeading().should(
          'equal',
          `What has made you consider recalling ${recommendation.personOnProbation.name}?`
        )

        // Main content
        cy.get('.govuk-hint').as('hint')

        cy.get('@hint')
          .find('p')
          .eq(0)
          .contains(
            `You're thinking about whether ${recommendation.personOnProbation.name} should be recalled or not. Explain your concerns. Include details of:`
          )

        cy.get('@hint')
          .find('ul')
          .should('contain.text', "what you're worried about")
          .and('contain.text', 'protective factors that are still in place')
          .and('contain.text', 'protective factors that have broken down')

        cy.get('@hint').find('p').eq(1).contains('This explanation will be recorded in NDelius.')

        // Continue button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })
    })

    describe('There is no previous response to the question', () => {
      it('The text area is empty', () => {
        const recommendation = RecommendationResponseGenerator.generate({ triggerLeadingToRecall: false })
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(testPageUrl)

        cy.get('.govuk-textarea').should('be.empty')
      })
    })

    describe('There is a previous response to the question', () => {
      it('The text area is empty', () => {
        const recommendation = RecommendationResponseGenerator.generate({ triggerLeadingToRecall: true })
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(testPageUrl)

        cy.get('.govuk-textarea').should('have.value', recommendation.triggerLeadingToRecall)
      })
    })

    describe('Error message display', () => {
      const testCases = [
        {
          description: 'Feature flag FTR-56 enabled',
          url: `${testPageUrl}?flagFTR56Enabled=1`,
        },
        {
          description: 'Feature flag FTR-56 disabled',
          url: testPageUrl,
        },
      ]
      testCases.forEach(testCase => {
        describe(testCase.description, () => {
          describe('When no trigger is provided', () => {
            const recommendation = RecommendationResponseGenerator.generate({ triggerLeadingToRecall: false })
            beforeEach(() => {
              cy.task('getRecommendation', { statusCode: 200, response: recommendation })
            })

            it('Then the expected error message is displayed', () => {
              cy.visit(testCase.url)

              cy.get('button.govuk-button').click()

              testForErrorPageTitle()
              testForErrorSummary([
                {
                  href: 'triggerLeadingToRecall',
                  message: `Explain what has made you consider recalling ${recommendation.personOnProbation.name}`,
                },
              ])
            })
          })
        })
      })
    })
  })
})
