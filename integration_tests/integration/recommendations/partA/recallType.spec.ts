import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { randomiseCriteria } from '../../../../data/utils'

context('Recall Type Page', () => {
  const testPageUrl = `/recommendations/123456789/recall-type`

  const defaultRecommendation = RecommendationResponseGenerator.generate({
    recallType: 'none',
  })

  beforeEach(() => {
    cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendation })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  const testRecallTypeRadioButton = (
    radioElement: () => Cypress.Chainable<JQuery<Element>>,
    radioGroup: () => Cypress.Chainable<JQuery<HTMLElement>>,
    expectedId: string,
    expectedLabel: string,
    conditional?: { idSuffix: string }
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
        .should('contain.text', 'Give details to justify your recall type recommendation')
      cy.get('@conditionalGroup')
        .find('textarea')
        .should('exist')
        .should('have.id', `recallTypeDetails${conditional.idSuffix}`)
        .should('have.value', '')
    }
  }

  describe('Page Data', () => {
    it('Standard page load', () => {
      cy.visit(testPageUrl)

      // Page Heading
      cy.pageHeading().should('equal', 'What do you recommend?')

      // Recall type Radio inputs
      cy.get('.govuk-form-group').should('have.length', 3).eq(0).as('recallTypeFormGroup')

      cy.get('@recallTypeFormGroup').get('fieldset').should('exist').as('recallTypeFieldset')

      cy.get('@recallTypeFieldset').get('legend').should('exist').should('contain.text', 'Select your recommendation')

      cy.get('@recallTypeFieldset').get('.govuk-radios').should('exist').as('radioGroup')
      cy.get('@radioGroup').get('div.govuk-radios__item').should('exist').should('have.length', 3).as('radios')

      testRecallTypeRadioButton(
        () => cy.get('@radios').eq(0),
        () => cy.get('@radioGroup'),
        'recallType',
        'Fixed term recall',
        {
          idSuffix: 'FixedTerm',
        }
      )
      testRecallTypeRadioButton(
        () => cy.get('@radios').eq(1),
        () => cy.get('@radioGroup'),
        'recallType-2',
        'Standard recall',
        {
          idSuffix: 'Standard',
        }
      )
      testRecallTypeRadioButton(
        () => cy.get('@radios').eq(2),
        () => cy.get('@radioGroup'),
        'recallType-3',
        'No recall - send a decision not to recall letter'
      )

      // Continue button
      cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
    })

    describe('And the Person on Probation does not meet any of the exception criteria', () => {
      const recommendationWithoutExceptionCriteria = RecommendationResponseGenerator.generate({
        isSentence48MonthsOrOver: false,
        isUnder18: false,
        isMappaCategory4: false,
        isMappaLevel2Or3: false,
        isRecalledOnNewChargedOffence: false,
        isServingFTSentenceForTerroristOffence: false,
        hasBeenChargedWithTerroristOrStateThreatOffence: false,
      })
      const expectedName = recommendationWithoutExceptionCriteria.personOnProbation.name

      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithoutExceptionCriteria })
        cy.task('getStatuses', { statusCode: 200, response: [] })

        cy.visit(testPageUrl)
      })

      it('The expected mandatory radio options are rendered', () => {
        cy.get('.govuk-form-group').get('fieldset').get('legend').get('.govuk-radios').as('radiosGroup')
        cy.get('@radiosGroup').get('div.govuk-radios__item').as('renderedRadios')
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(0),
          () => cy.get('@radiosGroup'),
          'recallType',
          'Fixed term recall'
        )
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(1),
          () => cy.get('@radiosGroup'),
          'recallType-2',
          'No recall'
        )
      })

      it('Then the mandatory suitability panel is displayed', () => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithoutExceptionCriteria })
        cy.task('getStatuses', { statusCode: 200, response: [] })

        cy.visit(testPageUrl)

        cy.get('.moj-ticket-panel').should('exist').as('panel')

        cy.get('@panel')
          .find('h2')
          .should('exist')
          .should('contain.text', `${expectedName} must be given a fixed term recall, if recalled`)

        cy.get('@panel').find('.govuk-details').should('exist').as('details')

        cy.get('@details')
          .find('summary')
          .should('exist')
          .should('contain.text', 'Understanding mandatory fixed term recalls')

        cy.get('@details').find('.govuk-details__text').should('exist').as('detailsText')

        cy.get('@detailsText')
          .should(
            'contain.text',
            'Sentences under 48 months must be given a fixed term recall unless the person being recalled is:'
          )
          .should('contain.text', 'This applies to people aged 18 and over.')
        cy.get('@detailsText')
          .find('li')
          .should('exist')
          .should('have.length', 5)
          .should('contain.text', 'being managed at MAPPA level 2 or 3, or in category 4, at the point of recall')
          .should('contain.text', 'on an extended determinate sentence')
          .should('contain.text', 'being recalled for a new charged offence')
          .should(
            'contain.text',
            'serving a fixed term sentence for an offence within section 247A (2) of the Criminal Justice Act 2003 (terrorist prisoners) (opens in new tab)'
          )
          .should('contain.text', 'serving a sentence for a terrorist or state threat offence')
          .find('a')
          .should('exist')
          .should('have.class', 'govuk-link')
          .should('have.attr', 'href', 'https://www.legislation.gov.uk/ukpga/2003/44/section/247A')
          .should('have.attr', 'rel', 'noreferrer noopener')
          .should('have.attr', 'target', '_blank')
      })
    })

    describe('And the Person on Probation meets any of the exception criteria', () => {
      const randomCriteria = randomiseCriteria<{
        isSentence48MonthsOrOver: boolean
        isUnder18: boolean
        isMappaCategory4: boolean
        isMappaLevel2Or3: boolean
        isRecalledOnNewChargedOffence: boolean
        isServingFTSentenceForTerroristOffence: boolean
        hasBeenChargedWithTerroristOrStateThreatOffence: boolean
      }>(
        [
          { key: 'isSentence48MonthsOrOver', generate: 'boolean' },
          { key: 'isUnder18', generate: 'boolean' },
          { key: 'isMappaCategory4', generate: 'boolean' },
          { key: 'isMappaLevel2Or3', generate: 'boolean' },
          { key: 'isRecalledOnNewChargedOffence', generate: 'boolean' },
          { key: 'isServingFTSentenceForTerroristOffence', generate: 'boolean' },
          { key: 'hasBeenChargedWithTerroristOrStateThreatOffence', generate: 'boolean' },
        ],
        criteria => Object.keys(criteria).some(k => criteria[k] ?? false)
      )

      const recommendationWithExceptionCriteria = RecommendationResponseGenerator.generate({
        isSentence48MonthsOrOver: randomCriteria.isSentence48MonthsOrOver,
        isUnder18: randomCriteria.isUnder18,
        isMappaCategory4: randomCriteria.isMappaCategory4,
        isMappaLevel2Or3: randomCriteria.isMappaLevel2Or3,
        isRecalledOnNewChargedOffence: randomCriteria.isRecalledOnNewChargedOffence,
        isServingFTSentenceForTerroristOffence: randomCriteria.isServingFTSentenceForTerroristOffence,
        hasBeenChargedWithTerroristOrStateThreatOffence: randomCriteria.hasBeenChargedWithTerroristOrStateThreatOffence,
      })
      const expectedName = recommendationWithExceptionCriteria.personOnProbation.name

      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithExceptionCriteria })
        cy.task('getStatuses', { statusCode: 200, response: [] })

        cy.visit(testPageUrl)
      })

      it('The expected discretionary radio options are rendered', () => {
        cy.get('.govuk-form-group').get('fieldset').get('legend').get('.govuk-radios').as('radiosGroup')
        cy.get('@radiosGroup').get('div.govuk-radios__item').as('renderedRadios')
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(0),
          () => cy.get('@radiosGroup'),
          'recallType',
          'Fixed term recall',
          {
            idSuffix: 'FixedTerm',
          }
        )
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(1),
          () => cy.get('@radiosGroup'),
          'recallType-2',
          'Standard recall',
          {
            idSuffix: 'Standard',
          }
        )
        testRecallTypeRadioButton(
          () => cy.get('@renderedRadios').eq(2),
          () => cy.get('@radiosGroup'),
          'recallType-3',
          'No recall'
        )
      })

      describe(`Randomised Criteria: 48+:${randomCriteria.isSentence48MonthsOrOver} | 18+:${randomCriteria.isUnder18} | M4:${randomCriteria.isMappaCategory4} | M2/3:${randomCriteria.isMappaLevel2Or3} | New:${randomCriteria.isRecalledOnNewChargedOffence} | STerr:${randomCriteria.isServingFTSentenceForTerroristOffence} | CTerr:${randomCriteria.hasBeenChargedWithTerroristOrStateThreatOffence}`, () => {
        it('Then the discretionary suitability panel is displayed', () => {
          cy.get('.moj-ticket-panel').should('exist').as('panel')

          cy.get('@panel')
            .find('h2')
            .should('exist')
            .should('contain.text', `${expectedName} can have either a fixed term or standard recall`)

          cy.get('@panel')
            .find('p')
            .first()
            .should('exist')
            .should('have.class', 'govuk-body')
            .should(
              'have.text',
              'Based on the information, if you decide to recommend a recall it can be either a fixed term or standard recall.'
            )

          cy.get('@panel').find('details').as('detailPanel')

          cy.get('@detailPanel')
            .find('summary span')
            .should('exist')
            .should('have.class', 'govuk-details__summary-text')
            .should('contain.text', 'Deciding between a fixed term or standard recall')

          cy.get('@detailPanel')
            .find('p')
            .eq(0)
            .should('exist')
            .should('have.class', 'govuk-body')
            .should(
              'have.text',
              `You can recommend a fixed term recall if you think the risk ${expectedName} poses could be safely managed in the community when the fixed term period ends.`
            )

          cy.get('@detailPanel')
            .find('p')
            .eq(1)
            .should('exist')
            .should('have.class', 'govuk-body')
            .should('contain.text', 'When deciding, think about:')

          cy.get('@detailPanel')
            .find('ul')
            .should('exist')
            .should('have.class', 'govuk-list--bullet')
            .should('contain.text', 'the index offence – was it sexual or violent?')
            .should('contain.text', 'any pattern of behaviour, including in previous offending')
            .should('contain.text', 'current behaviours and attitudes')
            .should('contain.text', 'how the risk will be managed on the first day of re-release')
            .should('contain.text', 'any other risk factors')
            .should('contain.text', 'the risk assessment')

          cy.get('@detailPanel')
            .find('p')
            .eq(2)
            .should('exist')
            .should('have.class', 'govuk-body')
            .should(
              'contain.text',
              `If you think the risk ${expectedName} poses could not be managed in the community at the end of the fixed term period, you can recommend a standard recall.`
            )

          cy.get('@detailPanel')
            .find('.govuk-warning-text')
            .should('exist')
            .should(
              'contain.text',
              'You need to provide a clear justification for the recall type you recommend, explaining why you think the risk can or cannot be managed in the community.'
            )
        })
      })
    })

    describe('Error message display', () => {
      describe('When no Recall Type is selected', () => {
        ;[true, false].forEach(ftrMandatory => {
          describe(`FTR Mandatory: ${ftrMandatory}`, () => {
            it('Then the expected error message is displayed', () => {
              const recommendationForMandatoryValue = RecommendationResponseGenerator.generate({
                isSentence48MonthsOrOver: !ftrMandatory,
                isUnder18: !ftrMandatory,
                isMappaCategory4: !ftrMandatory,
                isMappaLevel2Or3: !ftrMandatory,
                isRecalledOnNewChargedOffence: !ftrMandatory,
                isServingFTSentenceForTerroristOffence: !ftrMandatory,
                hasBeenChargedWithTerroristOrStateThreatOffence: !ftrMandatory,
              })
              cy.task('getRecommendation', { statusCode: 200, response: recommendationForMandatoryValue })
              cy.task('getStatuses', { statusCode: 200, response: [] })

              cy.visit(testPageUrl)

              cy.get('button.govuk-button').click()

              testForErrorPageTitle()
              testForErrorSummary([
                {
                  href: 'recallType',
                  message: ftrMandatory
                    ? "Select if you're recommending a fixed term recall or no recall"
                    : "Select if you're recommending a fixed term recall, standard recall or no recall",
                },
              ])
            })
          })
        })
      })
    })
  })
})
