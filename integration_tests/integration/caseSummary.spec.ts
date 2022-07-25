import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Overview', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('shows licence information and a list of offences', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    // licence info
    const { releaseSummary, convictions } = getCaseOverviewResponse
    cy.getText('lastReleaseDate').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: releaseSummary.lastRelease.date })
    )
    cy.getText('licenceExpiryDate-1').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: convictions[0].licenceExpiryDate })
    )
    // offence overview
    cy.getDefinitionListValue('Offences').should('contain', 'Robbery (other than armed robbery)')
    cy.getDefinitionListValue('Offences').should('contain', 'Shoplifting')
    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')
  })

  it('shows multiple licence expiry dates', () => {
    const crn = 'X34983'
    const convictions = [
      {
        active: true,
        licenceExpiryDate: '2023-06-17',
      },
      {
        active: false,
        licenceExpiryDate: '2020-07-16',
      },
      {
        active: true,
        licenceExpiryDate: '2020-06-16',
      },
    ]
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        convictions,
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getText('licenceExpiryDate-1').should('equal', '17 June 2023')
    cy.getText('licenceExpiryDate-2').should('equal', '16 June 2020')
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
