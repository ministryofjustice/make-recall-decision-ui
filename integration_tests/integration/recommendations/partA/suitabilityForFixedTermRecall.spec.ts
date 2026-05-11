import { fakerEN_GB as faker } from '@faker-js/faker'
import testRadioButtons from '../../../componentTests/radioButtons.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import { SentenceGroup } from '../../../../server/controllers/recommendations/sentenceInformation/formOptions'
import { testSummaryList } from '../../../componentTests/summaryList.tests'
import { CaseSummaryOverviewResponseGenerator } from '../../../../data/caseSummary/overview/caseSummaryOverviewResponseGenerator'
import { CaseSummaryRiskResponseGenerator } from '../../../../data/caseSummary/risk/caseSummaryRiskResponseGenerator'

context('Suitability for fixed term recall page', () => {
  const recommendationId = faker.number.int()
  const testPageUrl = `/recommendations/${recommendationId}/suitability-for-fixed-term-recall`
  const caseSummaryOverviewResponse = CaseSummaryOverviewResponseGenerator.generate({
    activeConvictions: [
      {
        mainOffence: {
          code: '001',
          description: 'Shoplifting',
        },
        additionalOffences: [],
        sentence: {
          description: 'ORA Suspended Sentence Order',
          isCustodial: false,
          length: 16,
          lengthUnits: 'weeks',
          licenceExpiryDate: '2026-11-24',
        },
      },
    ],
  })
  const caseSummaryRiskResponse = CaseSummaryRiskResponseGenerator.generate({
    personalDetailsOverview: {
      dateOfBirth: '2000-11-09',
      age: 21,
    },
    mappa: {
      level: 1,
      category: 2,
      lastUpdatedDate: '2026-02-01T00:00:00Z',
      error: null,
    },
  })

  describe('with FTR56 flag enabled', () => {
    describe('when sentence group is ADULT_SDS', () => {
      const recommendation = RecommendationResponseGenerator.generate({ sentenceGroup: SentenceGroup.ADULT_SDS })
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
        cy.task('getStatuses', { statusCode: 200, response: [] })
        cy.signIn()
      })

      it('should display correctly', () => {
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)
        cy.title().should(
          'equal',
          `Check the person's suitability for a standard or fixed term recall - ${config.applicationName}`,
        )
        cy.getElement(
          `Check ${recommendation.personOnProbation.name}'s suitability for a standard or fixed term recall`,
        ).should('exist')
        cy.getElement(
          `Answer the following questions to assess what recall type is appropriate for ${recommendation.personOnProbation.name}.`,
        ).should('exist')
        cy.get('.app-summary-card').within(() => {
          cy.get('h2').should('contain.text', 'Fixed term recall exclusion criteria')
          cy.get('h3').should('contain.text', 'Sentence group')
          cy.get('p.govuk-body').should('contain.text', 'Selected in sentence information step')
          cy.get('.govuk-grid-column-two-thirds').should('contain.text', 'Adult determinate sentence')
        })
        cy.get('.moj-banner--warning').should('not.exist')
        ;[
          {
            label: `Is ${recommendation.personOnProbation.name} being recalled because of being charged with an offence?`,
            fieldId: 'isChargedWithOffence',
          },
          {
            label: `Is ${recommendation.personOnProbation.name} serving a sentence for a terrorist or national security offence?`,
            fieldId: 'isServingTerroristOrNationalSecurityOffence',
          },
          {
            label: `Is ${recommendation.personOnProbation.name} considered to be a person at risk of being involved in foreign power threat activity?`,
            fieldId: 'isAtRiskOfInvolvedInForeignPowerThreat',
          },
          {
            label: `Was ${recommendation.personOnProbation.name} referred to the Parole Board under section 244ZB (power to detain) on this sentence?`,
            fieldId: 'wasReferredToParoleBoard244ZB',
          },
          {
            label: `Has ${recommendation.personOnProbation.name} been repatriated to the UK following a sentence for murder?`,
            fieldId: 'wasRepatriatedForMurder',
          },
          {
            label: `Is ${recommendation.personOnProbation.name} serving a Sentence for offenders of particular concern (SOPC)?`,
            fieldId: 'isServingSOPCSentence',
          },
          {
            label: `Is ${recommendation.personOnProbation.name} serving a Discretionary conditional release (DCR) sentence?`,
            fieldId: 'isServingDCRSentence',
          },
        ].forEach((testCase, index) => {
          testRadioButtons(cy.get('.govuk-form-group').eq(index), {
            legend: {
              text: testCase.label,
            },
            options: [
              {
                input: {
                  id: testCase.fieldId,
                  value: 'YES',
                },
                label: {
                  text: 'Yes',
                },
              },
              {
                input: {
                  id: `${testCase.fieldId}-2`,
                  value: 'NO',
                },
                label: {
                  text: 'No',
                },
              },
            ],
          })
        })
      })

      it('should handle form errors', () => {
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

        cy.get('button').click()

        testForErrorPageTitle()
        testForErrorSummary([
          {
            href: 'isChargedWithOffence',
            message: `Select whether ${recommendation.personOnProbation.name} is being recalled because of being charged with an offence`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
          {
            href: 'isServingTerroristOrNationalSecurityOffence',
            message: `Select whether ${recommendation.personOnProbation.name} is serving a sentence for a terrorist or national security offence`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
          {
            href: 'isAtRiskOfInvolvedInForeignPowerThreat',
            message: `Select whether ${recommendation.personOnProbation.name} is considered to be a person at risk of being involved in foreign power threat activity`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
          {
            href: 'wasReferredToParoleBoard244ZB',
            message: `Select whether ${recommendation.personOnProbation.name} was referred to the Parole Board under section 244ZB (power to detain) on this sentence`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
          {
            href: 'wasRepatriatedForMurder',
            message: `Select whether ${recommendation.personOnProbation.name} has been repatriated to the UK following a sentence for murder`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
          {
            href: 'isServingSOPCSentence',
            message: `Select whether ${recommendation.personOnProbation.name} is serving a Sentence for offenders of particular concern (SOPC)`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
          {
            href: 'isServingDCRSentence',
            message: `Select whether ${recommendation.personOnProbation.name} is serving a Discretionary conditional release (DCR) sentence`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
        ])
      })
    })

    describe('when sentence group is YOUTH_SDS', () => {
      const recommendation = RecommendationResponseGenerator.generate({ sentenceGroup: SentenceGroup.YOUTH_SDS })
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
        cy.task('getStatuses', { statusCode: 200, response: [] })
        cy.signIn()
        cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseSummaryOverviewResponse })
        cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: caseSummaryRiskResponse })
      })

      it('should display correctly when sentence group is YOUTH_SDS', () => {
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)
        cy.title().should(
          'equal',
          `Check the person's suitability for a standard or fixed term recall - ${config.applicationName}`,
        )
        cy.getElement(
          `Check ${recommendation.personOnProbation.name}'s suitability for a standard or fixed term recall`,
        ).should('exist')
        cy.getElement(
          `Check the following information to assess what recall type is appropriate for ${recommendation.personOnProbation.name}.`,
        ).should('exist')

        // MAPPA information card
        cy.get('.app-summary-card')
          .eq(0)
          .within(() => {
            cy.get('h2').should('contain.text', 'MAPPA Information')
            cy.get('h3').eq(0).should('contain.text', 'From NDelius')
            cy.get('.mappa-widget').within(() => {
              cy.get('h2').should('contain.text', 'Cat 2/Level 1 MAPPA')
              cy.get('p').should('contain.text', 'Last updated: 1 February 2026')
            })
            testSummaryList(cy.get('[data-qa="check-mappa-information-summary-list"]'), {
              rows: [
                {
                  key: 'MAPPA level 2 or 3',
                  value: 'No',
                },
              ],
            })
            cy.get('h3').eq(1).should('contain.text', 'Recall type MAPPA criteria')
          })

        cy.get('.app-summary-card')
          .eq(1)
          .within(() => {
            cy.get('h2').should('contain.text', 'Fixed term recall exclusion criteria')
            cy.get('h3').should('contain.text', 'Sentence group')
            cy.get('p.govuk-body').should('contain.text', 'Selected in sentence information step')
            cy.get('.govuk-grid-column-two-thirds').should('contain.text', 'Youth determinate sentence')
            ;[
              {
                label: `Is ${recommendation.personOnProbation.name}'s sentence 12 months or over?`,
                fieldId: 'isYouthSentenceOver12Months',
              },
              {
                label: `Is ${recommendation.personOnProbation.name} being recalled because of being charged with a serious offence?`,
                fieldId: 'isYouthChargedWithSeriousOffence',
              },
            ].forEach((testCase, index) => {
              testRadioButtons(cy.get('.govuk-form-group').eq(index), {
                legend: {
                  text: testCase.label,
                },
                options: [
                  {
                    input: {
                      id: testCase.fieldId,
                      value: 'YES',
                    },
                    label: {
                      text: 'Yes',
                    },
                  },
                  {
                    input: {
                      id: `${testCase.fieldId}-2`,
                      value: 'NO',
                    },
                    label: {
                      text: 'No',
                    },
                  },
                ],
              })
            })
          })
      })

      it("should not display a banner when the recall type rationale won't be overwritten", () => {
        const nonMandatoryRecommendation = RecommendationResponseGenerator.generate({
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          recallType: 'any',
          isMappaLevel2Or3: false,
          isYouthSentenceOver12Months: false,
          isYouthChargedWithSeriousOffence: false,
        })

        cy.task('getRecommendation', { statusCode: 200, response: nonMandatoryRecommendation })
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

        cy.get('.moj-banner--warning').should('not.exist')
      })

      it('should display a banner when the recall type rationale will be overwritten', () => {
        const mandatoryRecommendation = RecommendationResponseGenerator.generate({
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          recallType: 'any',
          isMappaLevel2Or3: true,
          isYouthSentenceOver12Months: true,
          isYouthChargedWithSeriousOffence: true,
        })

        cy.task('getRecommendation', { statusCode: 200, response: mandatoryRecommendation })
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

        cy.get('.moj-banner--warning')
          .should('exist')
          .within(() => {
            cy.get('h2').should('contain.text', 'Changes could affect your recall recommendation choices')
            cy.get('p.govuk-body').should(
              'contain.text',
              `Changing your answers could make ${mandatoryRecommendation.personOnProbation.name} eligible for a mandatory fixed term recall. If this happens, information explaining your previous recall type selection will be deleted.`,
            )
          })
      })

      it('should handle form errors', () => {
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

        cy.get('button').click()

        testForErrorPageTitle()
        testForErrorSummary([
          {
            href: 'isYouthSentenceOver12Months',
            message: `Select whether ${recommendation.personOnProbation.name}'s sentence is 12 months or over`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
          {
            href: 'isYouthChargedWithSeriousOffence',
            message: `Select whether ${recommendation.personOnProbation.name} is being recalled because of being charged with a serious offence`,
            checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
          },
        ])
      })
    })
  })

  describe('without FTR56 flag enabled', () => {
    const recommendation = RecommendationResponseGenerator.generate()

    beforeEach(() => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.signIn()
      cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: caseSummaryOverviewResponse })
      cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: caseSummaryRiskResponse })
    })

    it('should display correctly', () => {
      cy.visit(`${testPageUrl}`)
      cy.title().should(
        'equal',
        `Check the person's suitability for a standard or fixed term recall - ${config.applicationName}`,
      )

      cy.getElement(
        `Check ${recommendation.personOnProbation.name}'s suitability for a standard or fixed term recall`,
      ).should('exist')
      cy.getElement(
        'Use the following information to answer the questions and assess which type of recall is appropriate.',
      ).should('exist')

      cy.getElement('9 November 2000 (age 21)').should('exist')
      cy.getElement('Shoplifting').should('exist')
      cy.getElement('ORA Suspended Sentence Order').should('exist')
      cy.getElement('16 weeks').should('exist')

      // radios
      ;[
        {
          label: `Is ${recommendation.personOnProbation.name}'s sentence 48 months or over?`,
          fieldId: 'isSentence48MonthsOrOver',
          hint: {
            hintText: `Use the total length if ${recommendation.personOnProbation.name} is serving consecutive sentences.`,
          },
        },
        {
          label: `Is ${recommendation.personOnProbation.name} under 18?`,
          fieldId: 'isUnder18',
        },
        {
          label: `Is ${recommendation.personOnProbation.name} in MAPPA category 4?`,
          fieldId: 'isMappaCategory4',
        },
        {
          label: `Is ${recommendation.personOnProbation.name}'s MAPPA level 2 or 3?`,
          fieldId: 'isMappaLevel2Or3',
        },
        {
          label: `Is ${recommendation.personOnProbation.name} being recalled on a new charged offence?`,
          fieldId: 'isRecalledOnNewChargedOffence',
        },
        {
          label: `Is ${recommendation.personOnProbation.name} serving a fixed term sentence for a terrorist offence?`,
          fieldId: 'isServingFTSentenceForTerroristOffence',
        },
        {
          label: `Has ${recommendation.personOnProbation.name} been charged with a terrorist or state threat offence?`,
          fieldId: 'hasBeenChargedWithTerroristOrStateThreatOffence',
        },
      ].forEach((testCase, index) => {
        testRadioButtons(cy.get('.govuk-form-group').eq(index), {
          legend: {
            text: testCase.label,
            ...(testCase.hint && { hintId: `#${testCase.fieldId}-hint`, hintText: testCase.hint.hintText }),
          },
          options: [
            {
              input: {
                id: testCase.fieldId,
                value: 'YES',
              },
              label: {
                text: 'Yes',
              },
            },
            {
              input: {
                id: `${testCase.fieldId}-2`,
                value: 'NO',
              },
              label: {
                text: 'No',
              },
            },
          ],
        })
      })
    })

    it('should handle form errors', () => {
      cy.visit(`${testPageUrl}`)

      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'isSentence48MonthsOrOver',
          message: `Select whether ${recommendation.personOnProbation.name}'s sentence is 48 months or over`,
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
        {
          href: 'isUnder18',
          message: `Select whether ${recommendation.personOnProbation.name} is under 18`,
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
        {
          href: 'isMappaCategory4',
          message: `Select whether ${recommendation.personOnProbation.name} is in MAPPA category 4`,
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
        {
          href: 'isMappaLevel2Or3',
          message: `Select whether ${recommendation.personOnProbation.name}'s MAPPA level is 2 or 3`,
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
        {
          href: 'isRecalledOnNewChargedOffence',
          message: `Select whether ${recommendation.personOnProbation.name} is being recalled on a new charged offence`,
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
        {
          href: 'isServingFTSentenceForTerroristOffence',
          message: `Select whether ${recommendation.personOnProbation.name} is serving a fixed term sentence for a terrorist offence`,
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
        {
          href: 'hasBeenChargedWithTerroristOrStateThreatOffence',
          message: `Select whether ${recommendation.personOnProbation.name} has been charged with a terrorist or state threat offence`,
          checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
        },
      ])
    })
  })
})
