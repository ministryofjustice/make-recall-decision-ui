import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { formatDateTimeFromIsoString } from '../../../../server/utils/dates/formatting'

context('Check MAPPA information', () => {
  const mockRecommendation = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${mockRecommendation.id}/check-mappa-information`

  beforeEach(() => {
    cy.task('getRecommendation', { statusCode: 200, response: mockRecommendation })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  const testCases = [
    {
      name: 'with level 1 and category 1',
      mappa: {
        level: 1,
        lastUpdatedDate: '2022-09-24',
        category: 1,
      },
      expected: {
        mappaLevel2Or3: 'No',
        mappaCategory4: 'No',
      },
    },
    {
      name: 'with level 2 and category 2',
      mappa: {
        level: 2,
        lastUpdatedDate: '2022-09-24',
        category: 2,
      },
      expected: {
        mappaLevel2Or3: 'Yes',
        mappaCategory4: 'No',
      },
    },
    {
      name: 'with level 3 and category 3',
      mappa: {
        level: 3,
        lastUpdatedDate: '2026-09-20',
        category: 3,
      },
      expected: {
        mappaLevel2Or3: 'Yes',
        mappaCategory4: 'No',
      },
    },
    {
      name: 'with level 3 and category 4',
      mappa: {
        level: 3,
        lastUpdatedDate: '2026-09-20',
        category: 4,
      },
      expected: {
        mappaLevel2Or3: 'Yes',
        mappaCategory4: 'Yes',
      },
    },
  ]

  describe('Page data', () => {
    testCases.forEach(testCase => {
      it(`should load the page ${testCase.name}`, () => {
        cy.task('getCase', {
          sectionId: 'risk',
          statusCode: 200,
          response: testCase,
        })

        cy.visit(testPageUrl)

        cy.pageHeading().should(
          'equal',
          `Check ${mockRecommendation.personOnProbation.name}'s MAPPA information to begin assessing recall type suitability`,
        )

        cy.get('.mappa-widget')
          .should('contain.text', `Cat ${testCase.mappa.category}/Level ${testCase.mappa.level} MAPPA`)
          .should(
            'contain.text',
            `Last updated: ${formatDateTimeFromIsoString({ isoDate: testCase.mappa.lastUpdatedDate })}`,
          )

        cy.get('[data-qa="check-mappa-information-summary-list"]').within(() => {
          cy.get('dd').eq(0).should('contain.text', testCase.expected.mappaLevel2Or3)
          cy.get('dd').eq(1).should('contain.text', testCase.expected.mappaCategory4)
        })
      })
    })

    it('should handle mappa information errors', () => {
      cy.task('getCase', {
        sectionId: 'risk',
        statusCode: 200,
        response: {
          mappa: {
            error: 'foo',
            level: 0,
            category: 0,
            lastUpdatedDate: null,
          },
        },
      })

      cy.visit(testPageUrl)

      cy.pageHeading().should(
        'equal',
        `Check ${mockRecommendation.personOnProbation.name}'s MAPPA information to begin assessing recall type suitability`,
      )

      cy.get('.mappa-widget').should('contain.text', `Unknown MAPPA`)

      cy.get('[data-qa="check-mappa-information-summary-list"]').within(() => {
        cy.get('dd').eq(0).should('contain.text', 'No')
        cy.get('dd').eq(1).should('contain.text', 'No')
      })
    })
  })
})
