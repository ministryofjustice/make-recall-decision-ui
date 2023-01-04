import { routeUrls } from '../../server/routes/routeUrls'
import getRecommendationsResponse from '../../api/responses/get-case-recommendations.json'

context('Recommendations list', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.signIn()
  })

  it('lists all recommendations', () => {
    cy.task('getCase', {
      sectionId: 'recommendations',
      statusCode: 200,
      response: {
        ...getRecommendationsResponse,
        recommendations: [
          {
            statusForRecallType: 'CONSIDERING_RECALL',
            lastModifiedByName: 'Angela Hartnett',
            lastModifiedDate: '2022-12-07T13:59:38.733Z',
            recommendationId: '1',
          },
          {
            statusForRecallType: 'RECOMMENDATION_STARTED',
            lastModifiedByName: 'Angelos Angelou',
            lastModifiedDate: '2022-11-23T13:59:38.733Z',
            recommendationId: '2',
          },
          {
            statusForRecallType: 'MAKING_DECISION_TO_RECALL',
            lastModifiedByName: 'Jamie Heifer',
            lastModifiedDate: '2022-06-07T13:59:38.733Z',
            recommendationId: '3',
          },
          {
            statusForRecallType: 'MAKING_DECISION_NOT_TO_RECALL',
            lastModifiedByName: 'Gary Lamb',
            lastModifiedDate: '2021-11-17T13:59:38.733Z',
            recommendationId: '4',
          },
          {
            statusForRecallType: 'DECIDED_TO_RECALL',
            lastModifiedByName: 'Barry Smithson',
            lastModifiedDate: '2021-09-23T13:59:38.733Z',
            recommendationId: '5',
          },
          {
            statusForRecallType: 'DECIDED_NOT_TO_RECALL',
            lastModifiedByName: 'Mary Berry',
            lastModifiedDate: '2019-05-14T13:59:38.733Z',
            recommendationId: '6',
          },
          {
            statusForRecallType: 'UNKNOWN',
            lastModifiedByName: 'A. Milner',
            lastModifiedDate: '2016-04-18T13:59:38.733Z',
            recommendationId: '7',
          },
        ],
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/recommendations?flagRecommendationsPage=1&flagDeleteRecommendation=1`)
    cy.pageHeading().should('equal', 'Recommendations for Paula Smith')

    const expectedTableRows = [
      ['Considering recall', 'Angela Hartnett', '7 Dec 2022', 'Make a recommendation'],
      ['Recommendation started', 'Angelos Angelou', '23 Nov 2022', 'Update recommendation'],
      ['Making decision to recall', 'Jamie Heifer', '7 Jun 2022', 'Update recommendation'],
      ['Making decision not to recall', 'Gary Lamb', '17 Nov 2021', 'Update recommendation'],
      ['Decided to recall', 'Barry Smithson', '23 Sep 2021', 'Download Part A'],
      ['Decided not to recall', 'Mary Berry', '14 May 2019', 'Download letter'],
      ['Unknown', 'A. Milner', '18 Apr 2016', ''],
    ]
    for (let i = 0; i < expectedTableRows.length; i += 1) {
      cy.getRowValuesFromTable({ tableCaption: 'Recommendations', rowQaAttr: `recommendation-${i + 1}` }).then(row1 => {
        expect(row1).to.deep.eq(expectedTableRows[i])
      })
    }
    cy.getLinkHref('Update recommendation', { parent: '[data-qa="recommendation-2"]' }).should(
      'contain',
      '/recommendations/2/task-list'
    )
    cy.getLinkHref('Update recommendation', { parent: '[data-qa="recommendation-3"]' }).should(
      'contain',
      '/recommendations/3/task-list'
    )
    cy.getLinkHref('Update recommendation', { parent: '[data-qa="recommendation-4"]' }).should(
      'contain',
      '/recommendations/4/task-list-no-recall'
    )
    cy.getLinkHref('Download Part A', { parent: '[data-qa="recommendation-5"]' }).should(
      'contain',
      '/recommendations/5/documents/part-a?crn=X514364'
    )
    cy.getLinkHref('Download letter', { parent: '[data-qa="recommendation-6"]' }).should(
      'contain',
      '/recommendations/6/documents/no-recall-letter?crn=X514364'
    )
  })

  it('shows a message if no recommendations', () => {
    cy.task('getCase', {
      sectionId: 'recommendations',
      statusCode: 200,
      response: {
        ...getRecommendationsResponse,
        recommendations: [],
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/recommendations?flagRecommendationsPage=1&flagDeleteRecommendation=1`)
    cy.getElement('No recommendations to display.').should('exist')
  })
})