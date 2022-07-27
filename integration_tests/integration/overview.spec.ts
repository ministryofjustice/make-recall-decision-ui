import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Overview', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('shows licence and offence information', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    // licence info
    const { releaseSummary, convictions } = getCaseOverviewResponse
    cy.getText('lastReleaseDate').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: releaseSummary.lastRelease.date })
    )
    cy.getText('licenceExpiryDate').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: convictions[0].licenceExpiryDate })
    )
    // offence and sentence
    let opts = { parent: '[data-qa="conviction-1"]' }
    cy.getDefinitionListValue('Main offence', opts).should('contain', 'Grievous bodily harm')
    cy.getElement('Additional offence(s)', opts).should('not.exist')
    cy.getDefinitionListValue('Sentence type', opts).should('contain', 'Prison (9 months)')
    cy.getDefinitionListValue('Sentence expiry date', opts).should('contain', '18 June 2022')
    opts = { parent: '[data-qa="conviction-2"]' }
    cy.getDefinitionListValue('Main offence', opts).should('contain', 'Robbery (other than armed robbery)')
    cy.getDefinitionListValue('Additional offence(s)', opts).should('contain', 'Shoplifting')
    cy.getDefinitionListValue('Additional offence(s)', opts).should('contain', 'Burglary')
    cy.getDefinitionListValue('Sentence type', opts).should('contain', 'ORA Adult Custody (inc PSS) (16 weeks)')
    cy.getDefinitionListValue('Sentence expiry date', opts).should('contain', '23 November 2021')

    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')
  })

  it('shows "Not available" for last release and licence expiry date if there are multiple active custodial convictions', () => {
    const crn = 'X34983'
    const convictions = [
      {
        active: false,
        licenceExpiryDate: '2020-07-16',
        offences: [],
      },
      {
        active: true,
        isCustodial: true,
        licenceExpiryDate: '2020-06-16',
        offences: [],
      },
      {
        active: true,
        isCustodial: true,
        licenceExpiryDate: '2023-06-17',
        offences: [],
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
    cy.getText('lastReleaseDate').should('equal', 'Not available')
    cy.getText('licenceExpiryDate').should('equal', 'Not available')

    // offence and sentence
    let opts = { parent: '[data-qa="conviction-1"]' }
    cy.getDefinitionListValue('Main offence', opts).should('contain', 'Not available')
    cy.getDefinitionListValue('Sentence type', opts).should('contain', 'Not available')
    cy.getDefinitionListValue('Sentence expiry date', opts).should('contain', 'Not available')
    opts = { parent: '[data-qa="conviction-2"]' }
    cy.getDefinitionListValue('Main offence', opts).should('contain', 'Not available')
    cy.getDefinitionListValue('Sentence type', opts).should('contain', 'Not available')
    cy.getDefinitionListValue('Sentence expiry date', opts).should('contain', 'Not available')
  })

  it('shows a message in offence panel if no active custodial convictions', () => {
    const crn = 'X34983'
    const convictions = [
      {
        active: false,
        licenceExpiryDate: '2020-07-16',
        offences: [],
      },
      {
        active: false,
        isCustodial: true,
        licenceExpiryDate: '2020-06-16',
        offences: [],
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
    cy.getElement('This person has no active offences or convictions.').should('exist')
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
