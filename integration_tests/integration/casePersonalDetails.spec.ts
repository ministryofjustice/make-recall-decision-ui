import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/formatting'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

context('Personal details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.window().then(win => win.sessionStorage.clear())
    cy.task('getUser', { user: 'USER1', statusCode: 200, response: { homeArea: { code: 'N07', name: 'London' } } })
    cy.signIn()
  })

  it('can view the personal details page', () => {
    const crn = 'X34983'
    const { personalDetailsOverview } = getCasePersonalDetailsResponse
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
    cy.pageHeading().should('equal', 'Personal details for Jane Bloggs')

    cy.getText('personalDetailsOverview-crn').should('equal', personalDetailsOverview.crn)
    cy.getText('personalDetailsOverview-dateOfBirth').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: personalDetailsOverview.dateOfBirth })
    )
    cy.getText('personalDetailsOverview-age').should('equal', personalDetailsOverview.age.toString())
    cy.getText('personalDetailsOverview-gender').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: personalDetailsOverview.gender })
    )
    // personal details
    cy.getDefinitionListValue('Main addresses').should('contain', '5 Anderton Road')
    cy.contains('Address 1 5 Anderton Road Newham London E15 1UJ').should('be.visible')
    cy.contains('Address 2 33 Balaam St Birmingham BH1 234').should('be.visible')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Name: Jane Doe')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Code: N07')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Team: NPS London')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Telephone: 01234567890')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Email: jenny@probation.com')
    cy.getLinkHref('jenny@probation.com').should('equal', 'mailto:jenny@probation.com')
  })

  it('shows None if no addresses available', () => {
    const crn = 'X34983'
    cy.task('getCase', {
      sectionId: 'personal-details',
      statusCode: 200,
      response: { ...getCasePersonalDetailsResponse, addresses: [] },
    })
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
    cy.getDefinitionListValue('Main address').should('contain', 'None')
  })
})
