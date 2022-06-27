import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Case summary', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('can view the overview page with a list of offences', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    // offence overview
    cy.getDefinitionListValue('Offences').should('contain', 'Robbery (other than armed robbery)')
    cy.getDefinitionListValue('Offences').should('contain', 'Shoplifting')
    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')
  })

  it('shows a message if no risk flags', () => {
    const crn = 'X34983'
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: { ...getCaseOverviewResponse, risk: { flags: [] } },
    })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getElement('No risks').should('exist')
  })

  it('changes label to Offence if there is only one', () => {
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        offences: [
          {
            mainOffence: true,
            description: 'Robbery (other than armed robbery)',
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getDefinitionListValue('Offence').should('contain', 'Robbery (other than armed robbery)')
  })

  it('can view the personal details page', () => {
    const crn = 'X34983'
    const { personalDetailsOverview } = getCaseOverviewResponse
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
    cy.getDefinitionListValue('Current address').should('contain', '5 Anderton Road')
    cy.getDefinitionListValue('Current address').should('contain', 'Newham')
    cy.getDefinitionListValue('Current address').should('contain', 'London')
    cy.getDefinitionListValue('Current address').should('contain', 'E15 1UJ')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Name: Jenny Eclair')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Code: N07')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Team: NPS London')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Telephone: 07824637629')
    cy.getDefinitionListValue('Probation practitioner').should('contain', 'Email: jenny@probation.com')
    cy.getLinkHref('jenny@probation.com').should('equal', 'mailto:jenny@probation.com')
  })

  it('can switch between case summary pages', () => {
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    // tabs
    cy.clickLink('Personal details')
    cy.pageHeading().should('equal', 'Personal details for Paula Smith')
    cy.clickLink('Contact history')
    cy.pageHeading().should('equal', 'Contact history for Charles Edwin')
    cy.clickLink('Licence conditions')
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    cy.clickLink('Overview')
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
  })
})
