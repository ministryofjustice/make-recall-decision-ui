import { fakerEN_GB as faker } from '@faker-js/faker'
import ppPaths from '../../../../server/routes/paths/pp'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import { testStandardBackLink } from '../../../componentTests/backLink.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'

context('Practitioner for Part A Page', () => {
  const recommendationId = faker.number.int()

  beforeEach(() => {
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  describe('Page Data', () => {
    describe('Feature flag FTR-56 enabled', () => {
      const testPageUrl = `/recommendations/${recommendationId}/${ppPaths.practitionerForPartA}?flagFTR56Enabled=1`
      it('Standard page load', () => {
        const recommendation = RecommendationResponseGenerator.generate()
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(`${testPageUrl}`)

        cy.title().should('equal', `Practitioner for the person - ${config.applicationName}`)

        // Back link
        testStandardBackLink()

        // Page Heading
        cy.pageHeading().should('equal', `Practitioner for ${recommendation.personOnProbation.name}`)

        cy.get('.govuk-form-group').should('have.length', 3).as('formGroups')

        cy.get('@formGroups').eq(0).find('.govuk-label').should('contain.text', 'Name')
        cy.get('@formGroups')
          .eq(0)
          .find('.govuk-input')
          .should('have.attr', 'name', 'name')
          .should('have.attr', 'type', 'text')

        cy.get('@formGroups').eq(1).find('.govuk-label').should('contain.text', 'Email')
        cy.get('@formGroups')
          .eq(1)
          .find('.govuk-input')
          .should('have.attr', 'name', 'email')
          .should('have.attr', 'type', 'email')

        cy.get('@formGroups').eq(2).find('.govuk-label').should('contain.text', 'Telephone')
        cy.get('@formGroups')
          .eq(2)
          .find('.govuk-hint')
          .should('contain.text', 'PPCS may use this number to ask queries')
        cy.get('@formGroups')
          .eq(2)
          .find('.govuk-input')
          .should('have.attr', 'name', 'telephone')
          .should('have.attr', 'type', 'tel')

        // Continue button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })

      it('There are no previous responses to the questions - The input areas are empty', () => {
        const recommendation = RecommendationResponseGenerator.generate({ practitionerForPartA: false })
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(testPageUrl)

        cy.get('.govuk-form-group').as('formGroups')

        cy.get('@formGroups').eq(0).find('.govuk-input').should('be.empty')
        cy.get('@formGroups').eq(1).find('.govuk-input').should('be.empty')
        cy.get('@formGroups').eq(2).find('.govuk-input').should('be.empty')
      })

      it('There are previous responses to the questions - The input areas are filled in', () => {
        const recommendation = RecommendationResponseGenerator.generate()
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(testPageUrl)

        cy.get('.govuk-form-group').as('formGroups')

        cy.get('@formGroups').eq(0).find('.govuk-input').should('have.value', recommendation.practitionerForPartA.name)
        cy.get('@formGroups').eq(1).find('.govuk-input').should('have.value', recommendation.practitionerForPartA.email)
        cy.get('@formGroups')
          .eq(2)
          .find('.govuk-input')
          .should('have.value', recommendation.practitionerForPartA.telephone)
      })

      it('No responses provided and submit button clicked - errors displayed', () => {
        const recommendation = RecommendationResponseGenerator.generate({ practitionerForPartA: false })
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
        cy.visit(testPageUrl)

        cy.get('button.govuk-button').click()

        testForErrorPageTitle()
        testForErrorSummary([
          {
            href: 'name',
            message: `Enter the name of the probation practitioner for ${recommendation.personOnProbation.name}`,
          },
          {
            href: 'email',
            message: `Enter the GOV.UK email for the probation practitioner for ${recommendation.personOnProbation.name}`,
          },
        ])
      })
    })

    describe('Feature flag FTR-56 disabled', () => {
      const testPageUrl = `/recommendations/${recommendationId}/${ppPaths.practitionerForPartA}`

      it('Standard page load', () => {
        const recommendation = RecommendationResponseGenerator.generate()
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(testPageUrl)

        cy.title().should('equal', `Practitioner for the person - ${config.applicationName}`)

        // Back link
        testStandardBackLink()

        // Page Heading
        cy.pageHeading().should('equal', `Practitioner for ${recommendation.personOnProbation.name}`)

        cy.get('.govuk-form-group').should('have.length', 7).as('formGroups')

        cy.get('@formGroups')
          .eq(2)
          .find('.govuk-label')
          .should('have.attr', 'for', 'name')
          .should('contain.text', 'Name')
        cy.get('@formGroups')
          .eq(2)
          .find('.govuk-input')
          .should('have.attr', 'name', 'name')
          .should('have.attr', 'type', 'text')

        cy.get('@formGroups')
          .eq(3)
          .find('.govuk-label')
          .should('have.attr', 'for', 'email')
          .should('contain.text', 'Email')
        cy.get('@formGroups')
          .eq(3)
          .find('.govuk-input')
          .should('have.attr', 'name', 'email')
          .should('have.attr', 'type', 'email')

        cy.get('@formGroups')
          .eq(4)
          .find('.govuk-label')
          .should('have.attr', 'for', 'telephone')
          .should('contain.text', 'Telephone')
        cy.get('@formGroups')
          .eq(4)
          .find('.govuk-hint')
          .should('contain.text', 'PPCS may use this number to ask queries')
        cy.get('@formGroups')
          .eq(4)
          .find('.govuk-input')
          .should('have.attr', 'name', 'telephone')
          .should('have.attr', 'type', 'tel')

        cy.get('@formGroups')
          .eq(5)
          .find('.govuk-label')
          .should('have.attr', 'for', 'region')
          .should('contain.text', 'Region')
        cy.get('@formGroups').eq(5).find('.govuk-select').should('have.attr', 'name', 'region')

        cy.get('@formGroups')
          .eq(6)
          .find('.govuk-label')
          .should('have.attr', 'for', 'localDeliveryUnit')
          .should('contain.text', 'Local Delivery Unit')
        cy.get('@formGroups')
          .eq(6)
          .find('.govuk-input')
          .should('have.attr', 'name', 'localDeliveryUnit')
          .should('have.attr', 'type', 'text')

        // Continue button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })

      it('There are no previous responses to the questions - The input areas are empty', () => {
        const recommendation = RecommendationResponseGenerator.generate({ practitionerForPartA: false })
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(testPageUrl)

        cy.get('.govuk-form-group').as('formGroups')

        cy.get('@formGroups').eq(2).find('.govuk-input').should('be.empty')
        cy.get('@formGroups').eq(3).find('.govuk-input').should('be.empty')
        cy.get('@formGroups').eq(4).find('.govuk-input').should('be.empty')
        cy.get('@formGroups').eq(5).find('.govuk-select').should('not.be.selected')
        cy.get('@formGroups').eq(6).find('.govuk-input').should('be.empty')
      })

      it('There are previous responses to the questions - The input areas are filled in', () => {
        const recommendation = RecommendationResponseGenerator.generate()
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })

        cy.visit(testPageUrl)

        cy.get('.govuk-form-group').as('formGroups')

        cy.get('@formGroups').eq(2).find('.govuk-input').should('have.value', recommendation.practitionerForPartA.name)
        cy.get('@formGroups').eq(3).find('.govuk-input').should('have.value', recommendation.practitionerForPartA.email)
        cy.get('@formGroups')
          .eq(4)
          .find('.govuk-input')
          .should('have.value', recommendation.practitionerForPartA.telephone)
        cy.get('@formGroups')
          .eq(5)
          .find('.govuk-select')
          .find(`option[value="${recommendation.practitionerForPartA.region}"]`)
          .should('be.selected')
        cy.get('@formGroups')
          .eq(6)
          .find('.govuk-input')
          .should('have.value', recommendation.practitionerForPartA.localDeliveryUnit)
      })

      it('No responses provided and submit button clicked - errors displayed', () => {
        const recommendation = RecommendationResponseGenerator.generate({ practitionerForPartA: false })
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
        cy.visit(testPageUrl)

        cy.get('button.govuk-button').click()

        testForErrorPageTitle()
        testForErrorSummary([
          {
            href: 'name',
            message: `Enter the name of the probation practitioner for ${recommendation.personOnProbation.name}`,
          },
          {
            href: 'email',
            message: `Enter the GOV.UK email for the probation practitioner for ${recommendation.personOnProbation.name}`,
          },
        ])
      })
    })
  })
})
