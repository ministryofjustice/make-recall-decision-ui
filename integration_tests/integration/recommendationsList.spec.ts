import { routeUrls } from '../../server/routes/routeUrls'
import getRecommendationsResponse from '../../api/responses/get-case-recommendations.json'

context('Recommendations tab in case summary', () => {
  const crn = 'X34983'
  const recommendations = [
    {
      lastModifiedByName: 'Angela Hartnett',
      lastModifiedDate: '2022-12-07T13:59:38.733Z',
      recommendationId: '1',
      status: 'RECALL_CONSIDERED',
    },
    {
      status: 'DRAFT',
      lastModifiedByName: 'Angelos Angelou',
      lastModifiedDate: '2022-11-23T13:59:38.733Z',
      recommendationId: '2',
    },
    {
      status: 'DRAFT',
      lastModifiedByName: 'Jamie Heifer',
      lastModifiedDate: '2022-06-07T13:59:38.733Z',
      recommendationId: '3',
      recallType: {
        selected: {
          value: 'STANDARD',
        },
      },
    },
    {
      status: 'DRAFT',
      lastModifiedByName: 'Gary Lamb',
      lastModifiedDate: '2021-11-17T13:59:38.733Z',
      recommendationId: '4',
      recallType: {
        selected: {
          value: 'NO_RECALL',
        },
      },
    },
    {
      status: 'DOCUMENT_DOWNLOADED',
      lastModifiedByName: 'Barry Smithson',
      lastModifiedDate: '2021-09-23T13:59:38.733Z',
      recommendationId: '5',
      recallType: {
        selected: {
          value: 'FIXED_TERM',
        },
      },
    },
    {
      status: 'DOCUMENT_DOWNLOADED',
      lastModifiedByName: 'Mary Berry',
      lastModifiedDate: '2019-05-14T13:59:38.733Z',
      recommendationId: '6',
      recallType: {
        selected: {
          value: 'NO_RECALL',
        },
      },
    },
    {
      status: '',
      lastModifiedByName: 'A. Milner',
      lastModifiedDate: '2016-04-18T13:59:38.733Z',
      recommendationId: '7',
    },
  ]

  const checkValuesInTable = expectedTableRows => {
    for (let i = 0; i < expectedTableRows.length; i += 1) {
      cy.getRowValuesFromTable({ tableCaption: 'Recommendations', rowSelector: `[data-qa="${i + 1}"]` }).then(row1 => {
        expect(row1).to.deep.eq(expectedTableRows[i])
      })
    }
  }

  it('if signed in user is a PO - lists all recommendations with actions', () => {
    cy.signIn()
    cy.task('getCase', {
      sectionId: 'recommendations',
      statusCode: 200,
      response: {
        ...getRecommendationsResponse,
        recommendations,
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/recommendations?flagRecommendationsPage=1`)
    cy.pageHeading().should('equal', 'Recommendations for Paula Smith')

    checkValuesInTable([
      ['Considering recall', 'Angela Hartnett', '7 Dec 2022', 'Make a recommendation'],
      ['Recommendation started', 'Angelos Angelou', '23 Nov 2022', 'Update recommendation'],
      ['Making decision to recall', 'Jamie Heifer', '7 Jun 2022', 'Update recommendation'],
      ['Making decision not to recall', 'Gary Lamb', '17 Nov 2021', 'Update recommendation'],
      ['Decided to recall', 'Barry Smithson', '23 Sep 2021', 'Download Part A\nfrom 23 September 2021 at 14:59'],
      ['Decided not to recall', 'Mary Berry', '14 May 2019', 'Download letter\nfrom 14 May 2019 at 14:59'],
      ['Unknown', 'A. Milner', '18 Apr 2016', ''],
    ])

    cy.getLinkHref('Update recommendation', { parent: '[data-qa="2"]' }).should(
      'contain',
      '/recommendations/2/task-list'
    )
    cy.getLinkHref('Update recommendation', { parent: '[data-qa="3"]' }).should(
      'contain',
      '/recommendations/3/task-list'
    )
    cy.getLinkHref('Update recommendation', { parent: '[data-qa="4"]' }).should(
      'contain',
      '/recommendations/4/task-list-no-recall'
    )
    cy.getLinkHref('Download Part A from 23 September 2021 at 14:59', {
      parent: '[data-qa="5"]',
    }).should('contain', '/recommendations/5/documents/part-a?crn=X514364')
    cy.getLinkHref('Download letter from 14 May 2019 at 14:59', { parent: '[data-qa="6"]' }).should(
      'contain',
      '/recommendations/6/documents/no-recall-letter?crn=X514364'
    )
  })

  it('if signed in user is a SPO - lists all recommendations with only download actions available', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getCase', {
      sectionId: 'recommendations',
      statusCode: 200,
      response: {
        ...getRecommendationsResponse,
        recommendations,
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/recommendations?flagRecommendationsPage=1`)
    cy.pageHeading().should('equal', 'Recommendations for Paula Smith')

    checkValuesInTable([
      ['Considering recall', 'Angela Hartnett', '7 Dec 2022', ''],
      ['Recommendation started', 'Angelos Angelou', '23 Nov 2022', ''],
      ['Making decision to recall', 'Jamie Heifer', '7 Jun 2022', ''],
      ['Making decision not to recall', 'Gary Lamb', '17 Nov 2021', ''],
      ['Decided to recall', 'Barry Smithson', '23 Sep 2021', 'Download Part A\nfrom 23 September 2021 at 14:59'],
      ['Decided not to recall', 'Mary Berry', '14 May 2019', 'Download letter\nfrom 14 May 2019 at 14:59'],
      ['Unknown', 'A. Milner', '18 Apr 2016', ''],
    ])
  })

  it('shows delete links if flag is on', () => {
    cy.signIn({ hasSpoRole: true })
    cy.task('getCase', {
      sectionId: 'recommendations',
      statusCode: 200,
      response: {
        ...getRecommendationsResponse,
        recommendations,
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/recommendations?flagRecommendationsPage=1&flagDeleteRecommendation=1`)
    cy.pageHeading().should('equal', 'Recommendations for Paula Smith')

    checkValuesInTable([
      ['Considering recall', 'Angela Hartnett', '7 Dec 2022', '', 'Delete'],
      ['Recommendation started', 'Angelos Angelou', '23 Nov 2022', '', 'Delete'],
      ['Making decision to recall', 'Jamie Heifer', '7 Jun 2022', '', 'Delete'],
      ['Making decision not to recall', 'Gary Lamb', '17 Nov 2021', '', 'Delete'],
      [
        'Decided to recall',
        'Barry Smithson',
        '23 Sep 2021',
        'Download Part A\nfrom 23 September 2021 at 14:59',
        'Delete',
      ],
      ['Decided not to recall', 'Mary Berry', '14 May 2019', 'Download letter\nfrom 14 May 2019 at 14:59', 'Delete'],
      ['Unknown', 'A. Milner', '18 Apr 2016', '', 'Delete'],
    ])
  })

  it('shows a message if no recommendations', () => {
    cy.signIn()
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
