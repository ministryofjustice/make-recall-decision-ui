import getCaseResponse from '../../api/responses/get-case-personal-details.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'

context('Personal details', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('can view the personal details page', () => {
    const crn = 'X34983'
    const { personalDetailsOverview } = getCaseResponse
    cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
    cy.pageHeading().should('equal', 'Personal details for Paula Smith')

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
    cy.getDefinitionListValue('Current addresses').should('contain', '5 Anderton Road')
    cy.getDefinitionListValue('Current addresses').should('contain', 'Newham')
    cy.getDefinitionListValue('Current addresses').should('contain', 'London')
    cy.getDefinitionListValue('Current addresses').should('contain', 'E15 1UJ')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Name: Jenny Eclair')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Code: N07')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Team: NPS London')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Telephone: 07824637629')
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
    cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
    cy.getDefinitionListValue('Current addresses').should('contain', 'None')
  })
})
