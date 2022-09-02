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
      formatDateTimeFromIsoString({ isoDate: convictions[1].licenceExpiryDate })
    )
    // offence and sentence
    let opts = { parent: '[data-qa="conviction-1"]' }
    // custodial sentence
    cy.getDefinitionListValue('Main offence', opts).should('contain', 'Robbery (other than armed robbery)')
    cy.getDefinitionListValue('Additional offence(s)', opts).should('contain', 'Shoplifting')
    cy.getDefinitionListValue('Additional offence(s)', opts).should('contain', 'Burglary')
    cy.getDefinitionListValue('Sentence type', opts).should('contain', 'ORA Adult Custody (inc PSS) (16 weeks)')
    cy.getDefinitionListValue('Sentence expiry date', opts).should('contain', '23 November 2021')
    opts = { parent: '[data-qa="conviction-2"]' }
    // non-custodial sentence
    cy.getDefinitionListValue('Main offence', opts).should('contain', 'Shoplifting')
    cy.getElement('Additional offence(s)', opts).should('not.exist')
    cy.getDefinitionListValue('Sentence type', opts).should('contain', 'ORA Suspended Sentence Order (2 months)')
    cy.getElement('Sentence expiry date', opts).should('not.exist')

    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')

    // warning banner should not be there
    cy.getElement({ qaAttr: 'banner-multiple-active-custodial' }).should('not.exist')
  })

  it('sort by sentence expiry date; missing data', () => {
    const crn = 'X34983'
    const convictions = [
      {
        active: true,
        isCustodial: false,
        offences: [{ mainOffence: true, description: 'Non-custodial' }],
        licenceConditions: [],
      },
      {
        active: true,
        isCustodial: true,
        sentenceExpiryDate: '2020-06-16',
        offences: [{ mainOffence: true, description: 'Custodial' }],
        licenceConditions: [],
      },
      {
        active: true,
        isCustodial: true,
        sentenceExpiryDate: null,
        offences: [{ mainOffence: true, description: 'Custodial' }],
        licenceConditions: [],
      },
      {
        active: true,
        isCustodial: true,
        sentenceExpiryDate: '2023-06-17',
        offences: [{ mainOffence: true, description: 'Custodial' }],
        licenceConditions: [],
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
    const opts = { parent: '[data-qa="conviction-1"]' }
    cy.getDefinitionListValue('Sentence expiry date', opts).should('contain', '17 June 2023')
    cy.getDefinitionListValue('Sentence type', opts).should('contain', 'Not available')
    cy.getDefinitionListValue('Sentence expiry date', { parent: '[data-qa="conviction-2"]' }).should(
      'contain',
      '16 June 2020'
    )
    cy.getElement('Sentence expiry date', { parent: '[data-qa="conviction-3"]' }).should('not.exist')
    cy.getDefinitionListValue('Sentence expiry date', { parent: '[data-qa="conviction-4"]' }).should(
      'contain',
      'Not available'
    )
  })

  it('shows "Not available" for last release and licence expiry date if dates are missing', () => {
    const crn = 'X34983'
    const convictions = [
      {
        active: false,
        isCustodial: false,
        offences: [],
        licenceConditions: [],
      },
      {
        active: true,
        isCustodial: true,
        offences: [],
        licenceConditions: [],
      },
    ]
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        convictions,
        releaseSummary: {
          lastRelease: {
            date: null,
          },
        },
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getText('lastReleaseDate').should('equal', 'Not available')
    cy.getText('licenceExpiryDate').should('equal', 'Not available')
  })

  it('shows banner and "Not available" for last release and licence expiry date if there are multiple active custodial convictions', () => {
    const crn = 'X34983'
    const convictions = [
      {
        active: false,
        licenceExpiryDate: '2020-07-16',
        offences: [],
        licenceConditions: [],
      },
      {
        active: true,
        isCustodial: true,
        licenceExpiryDate: '2020-06-16',
        offences: [],
        licenceConditions: [],
      },
      {
        active: true,
        isCustodial: true,
        licenceExpiryDate: '2023-06-17',
        offences: [],
        licenceConditions: [],
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

    cy.interceptGoogleAnalyticsEvent(
      {
        ea: 'multipleCustodialConvictionsBanner',
        ec: crn,
        el: '2',
      },
      'multipleConvictionsEvent'
    )
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getText('lastReleaseDate').should('equal', 'Not available')
    cy.getText('licenceExpiryDate').should('equal', 'Not available')

    // banner
    cy.getElement({ qaAttr: 'banner-multiple-active-custodial' }).should('exist')
    cy.getElement('This person has 2 or more active convictions in NDelius').should('exist')
    cy.wait('@multipleConvictionsEvent')
  })

  it('shows a message in offence panel, and not available for licence dates, if no active custodial convictions', () => {
    const crn = 'X34983'
    const convictions = [
      {
        active: false,
        isCustodial: false,
        licenceExpiryDate: '2020-07-16',
        offences: [],
        licenceConditions: [],
      },
      {
        active: false,
        isCustodial: true,
        licenceExpiryDate: '2020-06-16',
        offences: [],
        licenceConditions: [],
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
    cy.getText('lastReleaseDate').should('equal', 'Not available')
    cy.getText('licenceExpiryDate').should('equal', 'Not available')
    // warning banner should not be there
    cy.getElement({ qaAttr: 'banner-multiple-active-custodial' }).should('not.exist')
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
