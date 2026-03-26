import { fakerEN_GB as faker } from '@faker-js/faker'
import ppPaths from '../../../../server/routes/paths/pp'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import testPopSummaryCard from '../../../componentTests/popSummaryCard.tests'
import { CaseSummaryOverviewResponseGenerator } from '../../../../data/caseSummary/overview/caseSummaryOverviewResponseGenerator'
import {
  sentenceGroup,
  SentenceGroup,
} from '../../../../server/controllers/recommendations/sentenceInformation/formOptions'
import testRadioButtons from '../../../componentTests/radioButtons.tests'
import { NoneOrOption } from '../../../../data/@generators/dataGenerators'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import searchMappedUserResponse from '../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../api/responses/ppudSearchActiveUsers.json'
import { sortListByDateField } from '../../../../server/utils/dates'
import { Conviction } from '../../../../server/@types/make-recall-decision-api'
import { renderString } from '../../../../server/utils/nunjucks'
import { testBackLink } from '../../../componentTests/backLink.tests'

context('Sentence Information page', () => {
  const recommendationId = faker.number.int()
  const testPageUrl = `/recommendations/${recommendationId}/${ppPaths.sentenceInformation}`

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
      const testCases: { description: string; sentenceGroup: NoneOrOption<SentenceGroup> }[] = [
        {
          description: 'With no sentence group selected',
          sentenceGroup: 'none',
        },
        {
          description: 'With a sentence group selected',
          sentenceGroup: faker.helpers.enumValue(SentenceGroup),
        },
      ]
      testCases.forEach(testCase => {
        it(testCase.description, () => {
          const recommendation = RecommendationResponseGenerator.generate({
            sentenceGroup: testCase.sentenceGroup,
          })
          cy.task('getRecommendation', { statusCode: 200, response: recommendation })

          const caseSummary = CaseSummaryOverviewResponseGenerator.generate({
            activeConvictions: [
              { additionalOffences: [{}, {}, {}] },
              { additionalOffences: [{}, {}, {}] },
              { additionalOffences: [{}, {}, {}] },
            ],
          })

          cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseSummary })

          cy.visit(testPageUrl)

          cy.title().should('equal', `the person's sentence information - ${config.applicationName}`)

          // Back link
          testBackLink(
            `/recommendations/${recommendationId}/${ppPaths.taskListConsiderRecall}`,
            'Back to Consider a recall questions',
            false,
          )

          cy.pageHeading().should('equal', `${recommendation.personOnProbation.name}'s sentence information`)

          const sortedConvictions = sortListByDateField({
            list: caseSummary.activeConvictions as Record<string, unknown>[],
            dateKey: 'sentence.sentenceExpiryDate',
            newestFirst: true,
            undefinedValuesLast: true,
          }) as Conviction[]

          testPopSummaryCard(cy.get('.app-summary-card'), {
            title: 'Sentences in NDelius',
            convictionDetails: sortedConvictions.map(conviction => {
              return {
                mainOffenceDescription: conviction.mainOffence.description,
                additionalOffences: conviction.additionalOffences.map(additionalOffence => {
                  return {
                    description: additionalOffence.description,
                  }
                }),
                sentenceDetails: {
                  description: conviction.sentence.description,
                  length: conviction.sentence.length,
                  lengthUnits: conviction.sentence.units,
                },
              }
            }),
          })

          const stringRenderParams = {
            fullName: recommendation.personOnProbation.name,
          }
          testRadioButtons(cy.get('.govuk-form-group'), {
            legend: {
              text: `Which sentence group does ${recommendation.personOnProbation.name}'s sentence type fall into?`,
            },
            options: Object.values(sentenceGroup).map((group, index) => {
              // this is how the govuk radio button component generates IDs if not explicitly specified
              const itemId = index === 0 ? 'sentenceGroup' : `sentenceGroup-${index + 1}`
              return {
                input: {
                  id: itemId,
                  name: '',
                  value: group.value,
                  checked: recommendation.sentenceGroup === group.value,
                },
                label: {
                  text: group.text,
                },
                hint: group.detailsLabel
                  ? {
                      id: `${itemId}-item-hint`,
                      text: renderString(group.detailsLabel, stringRenderParams),
                    }
                  : undefined,
              }
            }),
          })

          // Continue Button
          cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
        })
      })
    })
  })

  describe('Error message display', () => {
    it('Displays error message when no sentence group is selected', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        sentenceGroup: 'none',
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })

      cy.visit(testPageUrl)

      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([{ href: 'sentenceGroup', message: 'Select a sentence group' }])
    })
  })
})
