import { fakerEN_GB as faker } from '@faker-js/faker'
import { testForErrorPageTitle } from '../../../../componentTests/errors.tests'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import CUSTODY_GROUP from '../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import RECOMMENDATION_STATUS from '../../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from '../util'

context('Select PPUD Sentence', () => {
  const recommendationId = faker.number.int()

  const recommendation = RecommendationResponseGenerator.generate({
    nomisIndexOffence: {
      selectedIndex: 1,
    },
    id: recommendationId,
    bookRecallToPpud: {
      firstName: 'John',
      lastName: 'Doe',
      custodyGroup: CUSTODY_GROUP.DETERMINATE,
      ppudSentenceId: '1',
    },
    ppudOffender: {
      sentences: [
        {
          id: '1',
          custodyType: 'EDS',
          offence: { indexOffence: 'EDS offence' },
          dateOfSentence: new Date('2020-01-01'),
        },
        {
          id: '2',
          custodyType: 'DPP',
          offence: { indexOffence: 'DPP offence' },
          dateOfSentence: new Date('2020-01-01'),
        },
        {
          id: '3',
          custodyType: 'Determinate',
          offence: { indexOffence: 'Determinate offence' },
          dateOfSentence: new Date('2020-01-01'),
        },
      ],
    },
  })

  const recommendationWithNoSelectedSentence = RecommendationResponseGenerator.generate({
    nomisIndexOffence: {
      selectedIndex: 1,
    },
    id: recommendationId,
    bookRecallToPpud: {
      firstName: 'John',
      lastName: 'Doe',
      custodyGroup: CUSTODY_GROUP.DETERMINATE,
    },
    ppudOffender: {
      sentences: [
        {
          id: '1',
          custodyType: 'EDS',
          offence: { indexOffence: 'EDS offence' },
          dateOfSentence: new Date('2020-01-01'),
        },
        {
          id: '2',
          custodyType: 'DPP',
          offence: { indexOffence: 'DPP offence' },
          dateOfSentence: new Date('2020-01-01'),
        },
        {
          id: '3',
          custodyType: 'Determinate',
          offence: { indexOffence: 'Determinate offence' },
          dateOfSentence: new Date('2020-01-01'),
        },
      ],
    },
  })
  const testPageUrl = `/recommendations/${recommendationId}/select-ppud-sentence`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  describe('Filtering', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendation })
    })
    it('should only show determinate sentences and not indeterminate ones', () => {
      cy.visit(testPageUrl)

      cy.contains('Add your booking to PPUD - John Doe')

      cy.get('.govuk-radios__input').should('exist')

      cy.get('.govuk-radios__item').then($items => {
        const labels = $items.toArray().map(item => Cypress.$(item).text().trim())

        expect(labels.some(l => l.includes('Add new sentence'))).to.equal(true)
        expect(labels.some(l => l.includes('Determinate'))).to.equal(true)
        expect(labels.some(l => l.includes('EDS'))).to.equal(true)
        expect(labels.some(l => l.includes('DPP'))).to.equal(false)
      })
    })
    it('should auto select previously selected determinate sentences', () => {
      cy.visit(testPageUrl)

      cy.get('.govuk-radios__input').should('exist')

      cy.contains('.govuk-radios__item', 'EDS').find('input[type="radio"]').should('be.checked')

      cy.contains('.govuk-radios__item', 'Determinate').find('input[type="radio"]').should('not.be.checked')
    })
    it('should not auto select when no determinate sentences are previously selected ', () => {
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNoSelectedSentence })
      cy.visit(testPageUrl)

      cy.get('.govuk-radios__input').should('exist')

      cy.contains('.govuk-radios__item', 'EDS').find('input[type="radio"]').should('not.be.checked')

      cy.contains('.govuk-radios__item', 'Determinate').find('input[type="radio"]').should('not.be.checked')
    })
  })

  describe('Error message display', () => {
    beforeEach(() => {
      cy.task('getStatuses', {
        statusCode: 200,
        response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }],
      })
      cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNoSelectedSentence })
    })
    it('Displays error message when no sentence is selected', () => {
      cy.visit(testPageUrl)

      cy.get('button.govuk-button').click()

      testForErrorPageTitle()

      cy.get('a[href="#indexOffence"]')
        .should('be.visible')
        .and('have.text', 'Select an existing sentence or add a new one')

      // nunjucks file tech debt: MRD-3199, then use testForErrorSummary for component level error message testing.
    })
  })
})
