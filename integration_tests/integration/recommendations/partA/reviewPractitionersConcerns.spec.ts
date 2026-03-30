import completeRecommendationResponse from '../../../../api/responses/get-recommendation.json'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { SentenceGroup } from '../../../../server/controllers/recommendations/sentenceInformation/formOptions'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import routeUrls from '../../../../server/routes/routeUrls'

describe("SPO review practitioner's concerns page", () => {
  beforeEach(() => {
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_SPO'] })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse, recallConsideredList: null },
    })
    cy.task('getStatuses', {
      statusCode: 200,
      response: [
        { name: RECOMMENDATION_STATUS.SPO_CONSIDER_RECALL, active: true },
        { name: RECOMMENDATION_STATUS.SPO_SIGNATURE_REQUESTED, active: true },
      ],
    })
  })

  describe('with FTR56 flag disabled', () => {
    it('should load the page correctly', () => {
      cy.visit(`${routeUrls.recommendations}/1/review-practitioners-concerns`)

      cy.pageHeading().should('equal', "Review practitioner's concerns")
      cy.getElement('Review these details and discuss the case with the practitioner.').should('exist')

      cy.getElement('What has made you consider recalling Jane Bloggs?').should('exist')
      cy.get('.govuk-details')
        .eq(0)
        .within(() => {
          cy.get('.govuk-details__summary-text').should('contain.text', 'View Answer')
          cy.get('.govuk-details__text').should('contain.text', completeRecommendationResponse.triggerLeadingToRecall)
        })

      cy.getElement('How has Jane Bloggs responded to probation so far?').should('exist')
      cy.get('.govuk-details')
        .eq(1)
        .within(() => {
          cy.get('.govuk-details__summary-text').should('contain.text', 'View Answer')
          cy.get('.govuk-details__text').should('contain.text', completeRecommendationResponse.responseToProbation)
        })

      cy.getElement('What licence conditions has Jane Bloggs breached?').should('exist')
      cy.get('.govuk-details')
        .eq(2)
        .within(() => {
          cy.get('.govuk-details__summary-text').should('contain.text', 'View Answer')

          const { licenceConditionsBreached: breached } = completeRecommendationResponse

          const expectedText = [
            ...breached.standardLicenceConditions.selected.reduce((acc, selectedValue) => {
              acc.push(
                breached.standardLicenceConditions.allOptions.find(actualValue => selectedValue === actualValue.value)
                  .text,
              )
              return acc
            }, []),
            ...breached.additionalLicenceConditions.selectedOptions.reduce<string[]>((acc, selectedValue) => {
              const foundVal = breached.additionalLicenceConditions.allOptions.find(
                actualValue =>
                  actualValue.mainCatCode === selectedValue.mainCatCode &&
                  actualValue.subCatCode === selectedValue.subCatCode,
              )

              acc.push(foundVal.title)
              acc.push(foundVal.details)
              acc.push('Notes')
              acc.push(foundVal.note)

              return acc
            }, []),
          ]
          cy.get('.govuk-details__text')
            .invoke('text')
            .then(receivedText => {
              // So many weird characters because of the <pre>, it's easiest to just smush it all together
              // with no spaces or newlines
              expect(receivedText.replace(/\s+/g, '').replace('&nbsp;', '')).to.contain(
                expectedText.join('').replace(/\s+/g, ''),
              )
            })
        })

      cy.getElement('What alternatives have been tried already?').should('exist')
      cy.get('.govuk-details')
        .eq(3)
        .within(() => {
          cy.get('.govuk-details__summary-text').should('contain.text', 'View Answer')

          const { alternativesToRecallTried } = completeRecommendationResponse

          const expectedText = [
            ...alternativesToRecallTried.selected.reduce((acc, selectedValue) => {
              acc.push(
                alternativesToRecallTried.allOptions.find(
                  allOptionsValue => allOptionsValue.value === selectedValue.value,
                ).text,
              )
              acc.push('More details')
              acc.push(selectedValue.details)
              return acc
            }, []),
          ]

          cy.get('.govuk-details__text')
            .invoke('text')
            .then(receivedText => {
              expect(receivedText.replace(/\s+/g, '')).to.contain(expectedText.join('').replace(/\s+/g, ''))
            })
        })

      cy.getElement('Is Jane Bloggs on an indeterminate sentence?')
        .should('exist')
        .parent()
        .should('contain.text', 'Yes')

      cy.getElement('Is Jane Bloggs on an extended sentence?').should('exist').parent().should('contain.text', 'Yes')

      cy.getElement('Continue').should('exist')
    })
  })

  describe('with FTR56 flag enabled', () => {
    const recommendation = RecommendationResponseGenerator.generate()

    const otherRecommendationProperties = {
      recallConsideredList: null,
      licenceConditionsBreached: {
        standardLicenceConditions: {
          selected: ['FOO'],
          allOptions: [
            {
              value: 'FOO',
              text: 'BAR',
            },
          ],
        },
        additionalLicenceConditions: {
          selected: [],
          allOptions: [],
        },
      },
      indeterminateSentenceType: {
        selected: 'LIFE',
        allOptions: [
          {
            value: 'LIFE',
            text: 'Life sentence',
          },
        ],
      },
    }

    ;[
      {
        sentenceGroup: SentenceGroup.ADULT_SDS,
        sentenceGroupName: 'Adult determinate sentence',
      },
      {
        sentenceGroup: SentenceGroup.YOUTH_SDS,
        sentenceGroupName: 'Youth determinate sentence',
      },
      {
        sentenceGroup: SentenceGroup.EXTENDED,
        sentenceGroupName: 'Extended sentence',
      },
      {
        sentenceGroup: SentenceGroup.INDETERMINATE,
        sentenceGroupName: 'Indeterminate',
        sentenceType: 'Life sentence',
      },
    ].forEach(testCase => {
      it(`should display correctly for ${testCase.sentenceGroup}`, () => {
        cy.task('getRecommendation', {
          statusCode: 200,
          response: {
            ...recommendation,
            sentenceGroup: testCase.sentenceGroup,
            ...otherRecommendationProperties,
            isIndeterminateSentence: testCase.sentenceGroup === SentenceGroup.INDETERMINATE ? 'Yes' : 'No',
          },
        })

        cy.visit(`${routeUrls.recommendations}/1/review-practitioners-concerns?flagFTR56Enabled=1`)

        cy.pageHeading().should('equal', "Review practitioner's concerns")
        cy.getElement('Review these details and discuss the case with the practitioner.').should('exist')

        cy.getElement(`What has made you consider recalling ${recommendation.personOnProbation.name}?`).should('exist')
        cy.get('.govuk-details')
          .eq(0)
          .within(() => {
            cy.get('.govuk-details__summary-text').should('contain.text', 'View Answer')
            cy.get('.govuk-details__text').should('contain.text', recommendation.triggerLeadingToRecall)
          })

        cy.getElement(`What licence conditions has ${recommendation.personOnProbation.name} breached?`).should('exist')
        cy.get('.govuk-details')
          .eq(1)
          .within(() => {
            cy.get('.govuk-details__summary-text').should('contain.text', 'View Answer')
            cy.get('.govuk-details__text').should('contain.text', 'BAR')
          })

        cy.getElement('What alternatives have been tried already?').should('exist')
        cy.get('.govuk-details')
          .eq(2)
          .within(() => {
            cy.get('.govuk-details__summary-text').should('contain.text', 'View Answer')

            const { alternativesToRecallTried } = recommendation

            const expectedText = [
              ...alternativesToRecallTried.selected.reduce((acc, selectedValue) => {
                acc.push(
                  alternativesToRecallTried.allOptions.find(
                    allOptionsValue => allOptionsValue.value === selectedValue.value,
                  )?.text,
                )
                acc.push('More details')
                acc.push(selectedValue.details)
                return acc
              }, []),
            ]

            cy.get('.govuk-details__text')
              .invoke('text')
              .then(receivedText => {
                expect(receivedText.replace(/\s+/g, '')).to.contain(expectedText.join('').replace(/\s+/g, ''))
              })
          })

        cy.getElement(`Which sentence group does ${recommendation.personOnProbation.name}'s sentence type fall into?`)
          .should('exist')
          .next()
          .should('contain.text', testCase.sentenceGroupName)

        if (testCase.sentenceGroup === SentenceGroup.INDETERMINATE) {
          cy.getElement(`What type of sentence is ${recommendation.personOnProbation.name} on?`)
            .should('exist')
            .next()
            .should('contain.text', testCase.sentenceType)
        } else {
          cy.getElement(`What type of sentence is ${recommendation.personOnProbation.name} on?`).should('not.exist')
        }
      })
    })
  })
})
