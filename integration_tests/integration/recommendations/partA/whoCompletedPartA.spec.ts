import { fakerEN_GB as faker } from '@faker-js/faker'
import ppPaths from '../../../../server/routes/paths/pp.paths'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import { testStandardBackLink } from '../../../componentTests/backLink.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import { testFormGroup } from '../../../componentTests/formGroup.tests'
import testRadioButtons from '../../../componentTests/radioButtons.tests'
import testContinueButton from '../../../componentTests/continueButton.tests'

context('Who Completed Part A Page', () => {
  const recommendationId = faker.number.int()

  beforeEach(() => {
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  describe('Page Data', () => {
    const testPageUrl = `/recommendations/${recommendationId}/${ppPaths.whoCompletedPartA}?newStandardLicenceConditions=1`

    it('Standard page load', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.title().should('equal', `Who completed this Part A? - ${config.applicationName}`)

      testStandardBackLink()

      cy.pageHeading().should('equal', 'Who completed this Part A?')

      const { whoCompletedPartA } = recommendation
      testFormGroup(cy.get('#name').closest('.govuk-form-group'), {
        id: 'name',
        label: 'Name',
        name: 'name',
        value: whoCompletedPartA.name,
      })

      testFormGroup(cy.get('#jobTitle').closest('.govuk-form-group'), {
        id: 'jobTitle',
        label: 'Job title',
        name: 'jobTitle',
        value: whoCompletedPartA.jobTitle,
        element: 'select',
      })

      testFormGroup(cy.get('#email').closest('.govuk-form-group'), {
        id: 'email',
        label: 'Email',
        name: 'email',
        value: whoCompletedPartA.email,
      })

      testFormGroup(cy.get('#telephone').closest('.govuk-form-group'), {
        id: 'telephone',
        label: 'Telephone',
        name: 'telephone',
        value: whoCompletedPartA.telephone,
      })
      cy.get('#telephone-hint').should('contain.text', 'PPCS may use this number to ask queries')

      testFormGroup(cy.get('#region').closest('.govuk-form-group'), {
        id: 'region',
        label: 'Region',
        name: 'region',
        value: whoCompletedPartA.region,
        element: 'select',
      })

      testFormGroup(cy.get('#localDeliveryUnit').closest('.govuk-form-group'), {
        id: 'localDeliveryUnit',
        label: 'Local Delivery Unit',
        name: 'localDeliveryUnit',
        value: whoCompletedPartA.localDeliveryUnit,
      })

      testRadioButtons(cy.get('#isPersonProbationPractitionerForOffender').closest('.govuk-form-group'), {
        legend: {
          text: `Is this person the probation practitioner for ${recommendation.personOnProbation.name}?`,
        },
        options: [
          {
            input: {
              id: 'isPersonProbationPractitionerForOffender',
              value: 'YES',
              checked: whoCompletedPartA.isPersonProbationPractitionerForOffender === true,
            },
            label: { text: 'Yes' },
          },
          {
            input: {
              id: 'isPersonProbationPractitionerForOffender-2',
              value: 'NO',
              checked: whoCompletedPartA.isPersonProbationPractitionerForOffender === false,
            },
            label: { text: 'No' },
          },
        ],
      })

      testContinueButton()
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

      const { whoCompletedPartA } = recommendation
      testFormGroup(cy.get('#name').closest('.govuk-form-group'), {
        id: 'name',
        label: 'Name',
        name: 'name',
        value: whoCompletedPartA.name,
      })
      testFormGroup(cy.get('#jobTitle').closest('.govuk-form-group'), {
        id: 'jobTitle',
        label: 'Job title',
        name: 'jobTitle',
        value: whoCompletedPartA.jobTitle,
        element: 'select',
      })
      testFormGroup(cy.get('#email').closest('.govuk-form-group'), {
        id: 'email',
        label: 'Email',
        name: 'email',
        value: whoCompletedPartA.email,
      })
      testFormGroup(cy.get('#telephone').closest('.govuk-form-group'), {
        id: 'telephone',
        label: 'Telephone',
        name: 'telephone',
        value: whoCompletedPartA.telephone,
      })
      testFormGroup(cy.get('#region').closest('.govuk-form-group'), {
        id: 'region',
        label: 'Region',
        name: 'region',
        value: whoCompletedPartA.region,
        element: 'select',
      })
      testFormGroup(cy.get('#localDeliveryUnit').closest('.govuk-form-group'), {
        id: 'localDeliveryUnit',
        label: 'Local Delivery Unit',
        name: 'localDeliveryUnit',
        value: whoCompletedPartA.localDeliveryUnit,
      })
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

  describe('When newStandardLicenceConditions flag is off', () => {
    const testPageUrlNoFlag = `/recommendations/${recommendationId}/${ppPaths.whoCompletedPartA}`

    it('does not show the job title field', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrlNoFlag)

      cy.get('#name').should('exist')
      cy.get('#jobTitle').should('not.exist')
      cy.get('#email').should('exist')
    })
  })
})
