import { fakerEN_GB as faker } from '@faker-js/faker'
import routeUrls from '../../../../server/routes/routeUrls'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { SentenceGroup } from '../../../../server/controllers/recommendations/sentenceInformation/formOptions'
import { testStandardBackLink } from '../../../componentTests/backLink.tests'
import ppPaths from '../../../../server/routes/paths/pp'

context('Task List Consider a Recall Page', () => {
  beforeEach(() => {
    cy.signIn()
    cy.task('getStatuses', { statusCode: 200, response: [] })
  })

  function expectedLinkHref(recommendationId: number, expectedHrefSlug: string) {
    return `/recommendations/${recommendationId}/${expectedHrefSlug}`
  }

  function checkTaskListItem(
    index: number,
    expectedText: string,
    expectedStatus: 'To do' | 'Completed',
    expectedHref: string,
  ) {
    cy.get('@taskListItems')
      .eq(index)
      .should('exist')
      .should('contain.text', expectedText)
      .should('contain.text', expectedStatus)
      .within(() => {
        cy.get('a').should('have.attr', 'href', expectedHref)
      })
  }

  describe('Page Data - Standard page load', () => {
    describe('With FTR56 disabled', () => {
      it('no tasks completed', () => {
        const recommendationWithNoTasksCompleted = RecommendationResponseGenerator.generate({
          triggerLeadingToRecall: false,
          responseToProbation: false,
          licenceConditionsBreached: false,
          alternativesToRecallTried: false,
          isIndeterminateSentence: 'none',
          isExtendedSentence: 'none',
        })
        const popName = recommendationWithNoTasksCompleted.personOnProbation.name
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNoTasksCompleted })

        cy.visit(`${routeUrls.recommendations}/${recommendationWithNoTasksCompleted.id}/task-list-consider-recall`)

        testStandardBackLink()

        cy.get('.moj-task-list__item').should('have.length', 6).as('taskListItems')

        checkTaskListItem(
          0,
          `What has made you consider recalling ${popName}?`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.triggerLeadingToRecall),
        )
        checkTaskListItem(
          1,
          `How has ${popName} responded to probation so far?`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.responseToProbation),
        )
        checkTaskListItem(
          2,
          `What licence conditions has ${popName} breached?`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.licenceConditions),
        )
        checkTaskListItem(
          3,
          'What alternatives to recall have been tried already?',
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.alternativesTried),
        )
        checkTaskListItem(
          4,
          `Is ${popName} on an indeterminate sentence?`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.isIndeterminate),
        )
        checkTaskListItem(
          5,
          `Is ${popName} on an extended sentence?`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.isExtended),
        )

        cy.getElement('Continue').should('not.exist')
      })

      it('all tasks completed', () => {
        const recommendationWithAllTasksCompleted = RecommendationResponseGenerator.generate()
        const popName = recommendationWithAllTasksCompleted.personOnProbation.name
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithAllTasksCompleted })

        cy.visit(`${routeUrls.recommendations}/${recommendationWithAllTasksCompleted.id}/task-list-consider-recall`)

        testStandardBackLink()

        cy.get('.moj-task-list__item').should('have.length', 6).as('taskListItems')

        checkTaskListItem(
          0,
          `What has made you consider recalling ${popName}?`,
          'Completed',
          expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.triggerLeadingToRecall),
        )
        checkTaskListItem(
          1,
          `How has ${popName} responded to probation so far?`,
          'Completed',
          expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.responseToProbation),
        )
        checkTaskListItem(
          2,
          `What licence conditions has ${popName} breached?`,
          'Completed',
          expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.licenceConditions),
        )
        checkTaskListItem(
          3,
          'What alternatives to recall have been tried already?',
          'Completed',
          expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.alternativesTried),
        )
        checkTaskListItem(
          4,
          `Is ${popName} on an indeterminate sentence?`,
          'Completed',
          expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.isIndeterminate),
        )
        checkTaskListItem(
          5,
          `Is ${popName} on an extended sentence?`,
          'Completed',
          expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.isExtended),
        )

        cy.getElement('Continue').should('exist')
      })
    })

    describe('With FTR56 enabled', () => {
      it('no tasks completed', () => {
        const recommendationWithNoTasksCompleted = RecommendationResponseGenerator.generate({
          triggerLeadingToRecall: false,
          licenceConditionsBreached: false,
          alternativesToRecallTried: false,
          sentenceGroup: 'none',
          indeterminateSentenceType: false,
        })
        const popName = recommendationWithNoTasksCompleted.personOnProbation.name
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNoTasksCompleted })

        cy.visit(
          `${routeUrls.recommendations}/${recommendationWithNoTasksCompleted.id}/task-list-consider-recall?flagFTR56Enabled=1`,
        )

        testStandardBackLink()

        cy.get('.moj-task-list__item').should('have.length', 4).as('taskListItems')

        checkTaskListItem(
          0,
          `What has made you consider recalling ${popName}?`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.triggerLeadingToRecall),
        )
        checkTaskListItem(
          1,
          `What licence conditions has ${popName} breached?`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.licenceConditions),
        )
        checkTaskListItem(
          2,
          'What alternatives to recall have been tried already?',
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.alternativesTried),
        )
        checkTaskListItem(
          3,
          `${popName}'s sentence information`,
          'To do',
          expectedLinkHref(recommendationWithNoTasksCompleted.id, ppPaths.sentenceInformation),
        )

        cy.getElement('Continue').should('not.exist')
      })

      describe('all tasks completed', () => {
        ;[true, false].forEach(sentenceTypeIsIndeterminate => {
          it(`Indeterminate sentence type ${sentenceTypeIsIndeterminate ? '' : 'not '}selected`, () => {
            const sentenceGroup = sentenceTypeIsIndeterminate
              ? SentenceGroup.INDETERMINATE
              : faker.helpers.arrayElement(
                  Object.values(SentenceGroup).filter(val => val !== SentenceGroup.INDETERMINATE),
                )
            const recommendationWithAllTasksCompleted = RecommendationResponseGenerator.generate({
              sentenceGroup,
            })
            const popName = recommendationWithAllTasksCompleted.personOnProbation.name
            cy.task('getRecommendation', { statusCode: 200, response: recommendationWithAllTasksCompleted })

            cy.visit(
              `${routeUrls.recommendations}/${recommendationWithAllTasksCompleted.id}/task-list-consider-recall?flagFTR56Enabled=1`,
            )

            testStandardBackLink()

            cy.get('.moj-task-list__item')
              .should('have.length', sentenceTypeIsIndeterminate ? 5 : 4)
              .as('taskListItems')

            checkTaskListItem(
              0,
              `What has made you consider recalling ${popName}?`,
              'Completed',
              expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.triggerLeadingToRecall),
            )
            checkTaskListItem(
              1,
              `What licence conditions has ${popName} breached?`,
              'Completed',
              expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.licenceConditions),
            )
            checkTaskListItem(
              2,
              'What alternatives to recall have been tried already?',
              'Completed',
              expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.alternativesTried),
            )
            checkTaskListItem(
              3,
              `${popName}'s sentence information`,
              'Completed',
              expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.sentenceInformation),
            )
            if (sentenceTypeIsIndeterminate) {
              checkTaskListItem(
                4,
                `What type of sentence is ${popName} on?`,
                'Completed',
                expectedLinkHref(recommendationWithAllTasksCompleted.id, ppPaths.indeterminateSentenceType),
              )
            }

            cy.getElement('Continue').should('exist')
          })
        })
      })
    })
  })
})
