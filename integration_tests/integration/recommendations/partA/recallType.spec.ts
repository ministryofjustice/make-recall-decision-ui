import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { randomiseCriteria } from '../../../../data/utils'
import { SentenceGroup } from '../../../../server/controllers/recommendations/sentenceInformation/formOptions'
import config from '../../../../server/config'

context('Recall Type Page', () => {
  const testPageUrl = `/recommendations/123456789/recall-type`

  const testRecallTypeRadioButton = (
    radioElement: () => Cypress.Chainable<JQuery<Element>>,
    radioGroup: () => Cypress.Chainable<JQuery<HTMLElement>>,
    expectedId: string,
    expectedLabel: string,
    conditional?: { idSuffix: string; text: string },
  ) => {
    radioElement().find('input').should('exist').should('have.id', expectedId).should('have.attr', 'name', 'recallType')
    radioElement()
      .find('label')
      .should('exist')
      .should('have.attr', 'for', expectedId)
      .should('contain.text', expectedLabel)

    if (conditional) {
      radioGroup().find(`.govuk-radios__conditional#conditional-${expectedId}`).should('exist').as('conditional')

      cy.get('@conditional').find('.govuk-form-group').should('exist').as('conditionalGroup')

      cy.get('@conditionalGroup')
        .find('label')
        .should('exist')
        .should('have.attr', 'for', `recallTypeDetails${conditional.idSuffix}`)
        .should('contain.text', conditional.text)
      cy.get('@conditionalGroup')
        .find('textarea')
        .should('exist')
        .should('have.id', `recallTypeDetails${conditional.idSuffix}`)
        .should('have.value', '')
    }
  }

  describe('Page Data', () => {
    beforeEach(() => {
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.signIn()
    })

    describe('For Adult SDS', () => {
      it('And the Person on Probation meets any of the exception criteria', () => {
        const randomCriteria = randomiseCriteria<{
          isMappaCategory4?: boolean
          isMappaLevel2Or3?: boolean
          wasReferredToParoleBoard244ZB: boolean
          wasRepatriatedForMurder: boolean
          isServingSOPCSentence: boolean
          isServingDCRSentence: boolean
          isChargedWithOffence: boolean
          isServingTerroristOrNationalSecurityOffence: boolean
          isAtRiskOfInvolvedInForeignPowerThreat: boolean
        }>(
          [
            { key: 'isMappaCategory4', generate: 'boolean' },
            { key: 'isMappaLevel2Or3', generate: 'boolean' },
            { key: 'wasReferredToParoleBoard244ZB', generate: 'boolean' },
            { key: 'wasRepatriatedForMurder', generate: 'boolean' },
            { key: 'isServingSOPCSentence', generate: 'boolean' },
            { key: 'isServingDCRSentence', generate: 'boolean' },
            { key: 'isChargedWithOffence', generate: 'boolean' },
            { key: 'isServingTerroristOrNationalSecurityOffence', generate: 'boolean' },
            { key: 'isAtRiskOfInvolvedInForeignPowerThreat', generate: 'boolean' },
          ],
          criteria => Object.keys(criteria).some(k => criteria[k] ?? true),
        )

        const recommendationWithExceptionCriteria = RecommendationResponseGenerator.generate({
          recallType: 'none',
          sentenceGroup: SentenceGroup.ADULT_SDS,
          isMappaCategory4: randomCriteria.isMappaCategory4,
          isMappaLevel2Or3: randomCriteria.isMappaLevel2Or3,
          wasReferredToParoleBoard244ZB: randomCriteria.wasReferredToParoleBoard244ZB,
          wasRepatriatedForMurder: randomCriteria.wasRepatriatedForMurder,
          isServingSOPCSentence: randomCriteria.isServingSOPCSentence,
          isServingDCRSentence: randomCriteria.isServingDCRSentence,
          isChargedWithOffence: randomCriteria.isChargedWithOffence,
          isServingTerroristOrNationalSecurityOffence: randomCriteria.isServingTerroristOrNationalSecurityOffence,
          isAtRiskOfInvolvedInForeignPowerThreat: randomCriteria.isAtRiskOfInvolvedInForeignPowerThreat,
        })

        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithExceptionCriteria })

        cy.visit(testPageUrl)

        cy.title().should('equal', `What do you recommend? - ${config.applicationName}`)

        // Page Heading
        cy.pageHeading().should('equal', 'What do you recommend?')

        cy.get('.moj-ticket-panel').within(() => {
          cy.get('h3').should(
            'contain.text',
            `${recommendationWithExceptionCriteria.personOnProbation.name} must be given a fixed term recall, if recalled`,
          )
          cy.get('p.govuk-body').should(
            'contain.text',
            'This is based on their MAPPA information and the answers you’ve provided in the previous step. If this does not look right, you can go back to amend your answers.',
          )
        })

        // Only one form group is expected - the one with the radio buttons
        cy.get('.govuk-form-group').should('have.length', 1).eq(0).as('recallTypeFormGroup')

        cy.get('@recallTypeFormGroup').get('fieldset').should('exist').as('recallTypeFieldset')

        cy.get('@recallTypeFieldset').get('legend').should('exist').should('contain.text', 'Select your recommendation')

        cy.get('@recallTypeFieldset').get('.govuk-radios').should('exist').as('radioGroup')
        cy.get('@radioGroup').get('div.govuk-radios__item').should('exist').should('have.length', 2).as('radios')

        testRecallTypeRadioButton(
          () => cy.get('@radios').eq(0),
          () => cy.get('@radioGroup'),
          'recallType',
          'Fixed term recall',
        )
        testRecallTypeRadioButton(
          () => cy.get('@radios').eq(1),
          () => cy.get('@radioGroup'),
          'recallType-2',
          'No recall - create a decision not to recall letter',
        )

        // Continue button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })

      it('And the Person on Probation does not meet any of the exception criteria', () => {
        const recommendationWithoutExceptionCriteria = RecommendationResponseGenerator.generate({
          recallType: 'none',
          sentenceGroup: SentenceGroup.ADULT_SDS,
          isMappaCategory4: false,
          isMappaLevel2Or3: false,
          wasReferredToParoleBoard244ZB: false,
          wasRepatriatedForMurder: false,
          isServingSOPCSentence: false,
          isServingDCRSentence: false,
          isChargedWithOffence: false,
          isServingTerroristOrNationalSecurityOffence: false,
          isAtRiskOfInvolvedInForeignPowerThreat: false,
        })

        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithoutExceptionCriteria })

        cy.visit(testPageUrl)

        cy.title().should('equal', `What do you recommend? - ${config.applicationName}`)

        // Page Heading
        cy.pageHeading().should('equal', 'What do you recommend?')

        cy.get('.moj-ticket-panel').within(() => {
          cy.get('h3').should(
            'contain.text',
            `${recommendationWithoutExceptionCriteria.personOnProbation.name} must be given a fixed term recall, if recalled`,
          )
          cy.get('p.govuk-body').should(
            'contain.text',
            'This is based on their MAPPA information and the answers you’ve provided in the previous step. If this does not look right, you can go back to amend your answers.',
          )
        })

        cy.get('.govuk-form-group').get('fieldset').get('legend').get('.govuk-radios').as('radiosGroup')
        cy.get('@radiosGroup').get('div.govuk-radios__item').as('renderedRadios')
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(0),
          () => cy.get('@radiosGroup'),
          'recallType',
          'Fixed term recall',
        )
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(1),
          () => cy.get('@radiosGroup'),
          'recallType-2',
          'No recall - create a decision not to recall letter',
        )
      })

      describe('Error message display', () => {
        describe('When no Recall Type is selected', () => {
          it('Then the expected error message is displayed', () => {
            const recommendationForMandatoryValue = RecommendationResponseGenerator.generate({
              recallType: 'none',
              sentenceGroup: SentenceGroup.ADULT_SDS,
            })
            cy.task('getRecommendation', { statusCode: 200, response: recommendationForMandatoryValue })
            cy.task('getStatuses', { statusCode: 200, response: [] })

            cy.visit(testPageUrl)

            cy.get('button.govuk-button').click()

            testForErrorPageTitle()
            testForErrorSummary([
              {
                href: 'recallType',
                message: 'Select a recall recommendation',
                checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
              },
            ])
          })
        })
      })
    })

    describe('For Youth SDS', () => {
      it('And the Person on Probation meets any of the exception criteria', () => {
        const randomCriteria = randomiseCriteria<{
          isMappaLevel2Or3?: boolean
          wasReferredToParoleBoard244ZB: boolean
          wasRepatriatedForMurder: boolean
          isServingSOPCSentence: boolean
          isServingDCRSentence: boolean
          isChargedWithOffence: boolean
          isServingTerroristOrNationalSecurityOffence: boolean
          isAtRiskOfInvolvedInForeignPowerThreat: boolean
        }>(
          [
            { key: 'isMappaLevel2Or3', generate: 'boolean' },
            { key: 'wasReferredToParoleBoard244ZB', generate: 'boolean' },
            { key: 'wasRepatriatedForMurder', generate: 'boolean' },
            { key: 'isServingSOPCSentence', generate: 'boolean' },
            { key: 'isServingDCRSentence', generate: 'boolean' },
            { key: 'isChargedWithOffence', generate: 'boolean' },
            { key: 'isServingTerroristOrNationalSecurityOffence', generate: 'boolean' },
            { key: 'isAtRiskOfInvolvedInForeignPowerThreat', generate: 'boolean' },
          ],
          criteria => Object.keys(criteria).some(k => criteria[k] ?? true),
        )

        const recommendationWithExceptionCriteria = RecommendationResponseGenerator.generate({
          recallType: 'none',
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          isMappaLevel2Or3: randomCriteria.isMappaLevel2Or3,
          wasReferredToParoleBoard244ZB: randomCriteria.wasReferredToParoleBoard244ZB,
          wasRepatriatedForMurder: randomCriteria.wasRepatriatedForMurder,
          isServingSOPCSentence: randomCriteria.isServingSOPCSentence,
          isServingDCRSentence: randomCriteria.isServingDCRSentence,
          isChargedWithOffence: randomCriteria.isChargedWithOffence,
          isServingTerroristOrNationalSecurityOffence: randomCriteria.isServingTerroristOrNationalSecurityOffence,
          isAtRiskOfInvolvedInForeignPowerThreat: randomCriteria.isAtRiskOfInvolvedInForeignPowerThreat,
        })
        const expectedName = recommendationWithExceptionCriteria.personOnProbation.name

        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithExceptionCriteria })

        cy.visit(testPageUrl)

        cy.title().should('equal', `What do you recommend? - ${config.applicationName}`)

        // Page Heading
        cy.pageHeading().should('equal', 'What do you recommend?')

        cy.get('.moj-ticket-panel').should('exist').as('panel')
        cy.get('body').then(() => {
          cy.get('@panel')
            .find('p')
            .first()
            .invoke('text')
            .then(text => {
              cy.writeFile('cypress/logs/recallTypeP.txt', text)
            })
        })
        cy.get('@panel')
          .find('h3')
          .should('exist')
          .should('contain.text', `${expectedName} must be given a fixed term recall, if recalled`)

        cy.get('@panel')
          .find('p')
          .first()
          .should('exist')
          .should('have.class', 'govuk-body')
          .should(
            'contain.text',
            'This is based on their MAPPA information and your answers to the fixed term recall exclusion criteria. If this does not look right, you can go back to amend your answers.',
          )

        // Three form groups are expected - the one with the radio buttons and one for each conditional text area
        cy.get('.govuk-form-group').should('have.length', 1).eq(0).as('recallTypeFormGroup')

        cy.get('@recallTypeFormGroup').get('fieldset').should('exist').as('recallTypeFieldset')

        cy.get('@recallTypeFieldset').get('legend').should('exist').should('contain.text', 'Select your recommendation')

        cy.get('@recallTypeFieldset').get('.govuk-radios').should('exist').as('radioGroup')
        cy.get('@radioGroup').get('div.govuk-radios__item').should('exist').should('have.length', 2).as('radios')

        testRecallTypeRadioButton(
          () => cy.get('@radios').eq(0),
          () => cy.get('@radioGroup'),
          'recallType',
          'Fixed term recall',
        )
        testRecallTypeRadioButton(
          () => cy.get('@radios').eq(1),
          () => cy.get('@radioGroup'),
          'recallType-2',
          'No recall - create a decision not to recall letter',
        )

        // Continue button
        cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
      })

      it('And the Person on Probation does not meet any of the exception criteria', () => {
        const recommendationWithoutExceptionCriteria = RecommendationResponseGenerator.generate({
          recallType: 'none',
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          isMappaLevel2Or3: false,
          isYouthSentenceOver12Months: false,
          isYouthChargedWithSeriousOffence: false,
        })

        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithoutExceptionCriteria })

        cy.visit(testPageUrl)

        cy.title().should('equal', `What do you recommend? - ${config.applicationName}`)

        // Page Heading
        cy.pageHeading().should('equal', 'What do you recommend?')

        cy.get('.moj-ticket-panel').within(() => {
          cy.get('h3').should(
            'contain.text',
            `${recommendationWithoutExceptionCriteria.personOnProbation.name} must be given a fixed term recall, if recalled`,
          )
          cy.get('p.govuk-body').should(
            'contain.text',
            'This is based on their MAPPA information and your answers to the fixed term recall exclusion criteria. If this does not look right, you can go back to amend your answers.',
          )
        })

        cy.get('.govuk-form-group').get('fieldset').get('legend').get('.govuk-radios').as('radiosGroup')
        cy.get('@radiosGroup').get('div.govuk-radios__item').as('renderedRadios')
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(0),
          () => cy.get('@radiosGroup'),
          'recallType',
          'Fixed term recall',
        )
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(1),
          () => cy.get('@radiosGroup'),
          'recallType-2',
          'No recall - create a decision not to recall letter',
        )
      })

      describe('Error message display', () => {
        describe('When no Recall Type is selected', () => {
          it('Then the expected error message is displayed', () => {
            const recommendationForMandatoryValue = RecommendationResponseGenerator.generate({
              recallType: 'none',
              sentenceGroup: SentenceGroup.YOUTH_SDS,
            })
            cy.task('getRecommendation', { statusCode: 200, response: recommendationForMandatoryValue })
            cy.task('getStatuses', { statusCode: 200, response: [] })

            cy.visit(testPageUrl)

            cy.get('button.govuk-button').click()

            testForErrorPageTitle()
            testForErrorSummary([
              {
                href: 'recallType',
                message: 'Select a recall recommendation',
                checkFieldHasErrorStyling: false, // the individual radio item isn't styled as error
              },
            ])
          })
        })

        it('When is discretionary and recall option is submitted with no justification', () => {
          const recommendationForDiscretionaryValue = RecommendationResponseGenerator.generate({
            sentenceGroup: SentenceGroup.YOUTH_SDS,
            isMappaLevel2Or3: true,
            isYouthSentenceOver12Months: false,
            isYouthChargedWithSeriousOffence: false,
          })
          cy.task('getRecommendation', { statusCode: 200, response: recommendationForDiscretionaryValue })
          cy.task('getStatuses', { statusCode: 200, response: [] })

          cy.visit(testPageUrl)

          cy.get('input[type="radio"][name="recallType"]').check('FIXED_TERM')

          cy.get('button.govuk-button').click()

          testForErrorPageTitle()
        })
      })
    })
  })
})
