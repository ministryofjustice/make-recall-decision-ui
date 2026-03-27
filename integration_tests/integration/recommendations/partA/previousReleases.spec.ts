import { testSummaryList } from '../../../componentTests/summaryList.tests'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'

context('Release details screen', () => {
  const recommendation = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${recommendation.id}/previous-releases`

  beforeEach(() => {
    cy.task('getRecommendation', { statusCode: 200, response: recommendation })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.task('updateRecommendation', { statusCode: 200, response: recommendation })
    cy.signIn()
  })

  describe('Page data', () => {
    it('should load correctly', () => {
      cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

      cy.getElement('Release details').should('exist')

      cy.getElement(
        'This information is from NDelius. Update NDelius if anything is wrong, then refresh this page to see your update. This will make sure your update goes into the Part A.',
      ).should('exist')

      testSummaryList(cy.get('.govuk-summary-list '), {
        rows: [
          {
            key: 'Releasing prison or custodial establishment',
            value: recommendation.previousReleases.lastReleasingPrisonOrCustodialEstablishment,
          },
          {
            key: 'Date of current release',
            value: recommendation.previousReleases.lastReleaseDate,
          },
        ],
      })

      cy.get('button').should('contain.text', 'Continue')
    })
  })
})
