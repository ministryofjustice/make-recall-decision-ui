import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'

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
      ppudSentenceId: 'ADD_NEW',
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
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    cy.task('getStatuses', { statusCode: 200, response: [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }] })
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
  })

  describe('Filtering', () => {
    it('should only show determinate sentences and not indeterminate ones', () => {
      cy.visit(testPageUrl)
      cy.get('body').then($body => {
        cy.writeFile(`cypress/logs/resultDeterminate.txt`, $body[0].outerHTML)
      })
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
  })
})
