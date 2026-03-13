import { fakerEN_GB as faker } from '@faker-js/faker'
import testRadioButtons from '../../../componentTests/radioButtons.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import config from '../../../../server/config'
import { SentenceGroup } from '../../../../server/controllers/recommendations/sentenceInformation/formOptions'

context('Suitability for fixed term recall page', () => {
  const recommendationId = faker.number.int()
  const testPageUrl = `/recommendations/${recommendationId}/suitability-for-fixed-term-recall`

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
          `Answer the following questions to assess what recall type is appropriate for ${recommendation.personOnProbation.name}`,
        ).should('exist')
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
          },
          {
            href: 'isServingTerroristOrNationalSecurityOffence',
            message: `Select whether ${recommendation.personOnProbation.name} is serving a sentence for a terrorist or national security offence`,
          },
          {
            href: 'isAtRiskOfInvolvedInForeignPowerThreat',
            message: `Select whether ${recommendation.personOnProbation.name} is considered to be a person at risk of being involved in foreign power threat activity`,
          },
          {
            href: 'wasReferredToParoleBoard244ZB',
            message: `Select whether ${recommendation.personOnProbation.name} was referred to the Parole Board under section 244ZB (power to detain) on this sentence`,
          },
          {
            href: 'wasRepatriatedForMurder',
            message: `Select whether ${recommendation.personOnProbation.name} has been repatriated to the UK following a sentence for murder`,
          },
          {
            href: 'isServingSOPCSentence',
            message: `Select whether ${recommendation.personOnProbation.name} is serving a Sentence for offenders of particular concern (SOPC)`,
          },
          {
            href: 'isServingDCRSentence',
            message: `Select whether ${recommendation.personOnProbation.name} is serving a Discretionary conditional release (DCR) sentence`,
          },
        ])
      })
    })

    describe('when sentence group if YOUTH_SDS', () => {
      const recommendation = RecommendationResponseGenerator.generate({ sentenceGroup: SentenceGroup.YOUTH_SDS })
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendation })
        cy.task('getStatuses', { statusCode: 200, response: [] })
        cy.signIn()
      })

      it('should display correctly when sentence group is YOUTH_SDS', () => {
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)
        cy.title().should(
          'equal',
          `Check the person's suitability for a standard or fixed term recall - ${config.applicationName}`,
        )
        cy.getElement(
          `Check the following information to assess what recall type is appropriate for ${recommendation.personOnProbation.name}`,
        ).should('exist')
        ;[
          {
            label: `Is ${recommendation.personOnProbation.name} sentence 12 months or over?`,
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

      it('should handle form errors', () => {
        cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

        cy.get('button').click()

        testForErrorPageTitle()
        testForErrorSummary([
          {
            href: 'isYouthSentenceOver12Months',
            message: `Select whether ${recommendation.personOnProbation.name}'s sentence is 12 months or over`,
          },
          {
            href: 'isYouthChargedWithSeriousOffence',
            message: `Select whether ${recommendation.personOnProbation.name} is being recalled because of being charged with a serious offence`,
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
      cy.getElement('Robbery (other than armed robbery)').should('exist')
      cy.getElement('Shoplifting Burglary').should('exist')
      cy.getElement('ORA Adult Custody (inc PSS)').should('exist')
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
        },
        {
          href: 'isUnder18',
          message: `Select whether ${recommendation.personOnProbation.name} is under 18`,
        },
        {
          href: 'isMappaCategory4',
          message: `Select whether ${recommendation.personOnProbation.name} is in MAPPA category 4`,
        },
        {
          href: 'isMappaLevel2Or3',
          message: `Select whether ${recommendation.personOnProbation.name}'s MAPPA level is 2 or 3`,
        },
        {
          href: 'isRecalledOnNewChargedOffence',
          message: `Select whether ${recommendation.personOnProbation.name} is being recalled on a new charged offence`,
        },
        {
          href: 'isServingFTSentenceForTerroristOffence',
          message: `Select whether ${recommendation.personOnProbation.name} is serving a fixed term sentence for a terrorist offence`,
        },
        {
          href: 'hasBeenChargedWithTerroristOrStateThreatOffence',
          message: `Select whether ${recommendation.personOnProbation.name} has been charged with a terrorist or state threat offence`,
        },
      ])
    })
  })
})
