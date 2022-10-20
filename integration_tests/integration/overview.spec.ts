import { DateTime } from 'luxon'
import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Overview', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.signIn()
  })

  it('shows licence and offence information', () => {
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    // licence info
    const { releaseSummary, convictions, risk } = getCaseOverviewResponse
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

    // offence description
    cy.getDefinitionListValue('Description', { parent: '[data-qa="offence-description"]' }).should(
      'contain',
      risk.assessments.offenceDescription
    )

    // contingency plan
    cy.viewDetails('View more detail on contingency plan').should('contain', risk.riskManagementPlan.contingencyPlans)

    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')

    // warning banner should not be there
    cy.getElement({ qaAttr: 'banner-multiple-active-custodial' }).should('not.exist')
  })

  it('no risk flags', () => {
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: { ...getCaseOverviewResponse, risk: { ...getCaseOverviewResponse.risk, flags: [] } },
    })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getElement('No risks').should('exist')
  })

  it('OASys last updated banner', () => {
    const latestDateCompleted = DateTime.now().minus({ week: 22 }).toISODate()
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        risk: {
          riskManagementPlan: {
            assessmentStatusComplete: true,
            lastUpdatedDate: '2022-09-24T08:39:00.000Z',
            contingencyPlans: 'Text from contingency plan',
            latestDateCompleted,
            initiationDate: '2022-10-09T01:02:03.123Z',
          },
        },
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    const date = formatDateTimeFromIsoString({ isoDate: latestDateCompleted, monthAndYear: true })
    cy.getElement(`OASys was last updated in ${date}`).should('exist')
  })

  it('More recent OASys banner', () => {
    const initiationDate = DateTime.now().minus({ week: 23 }).toISODate()
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        risk: {
          riskManagementPlan: {
            assessmentStatusComplete: false,
            lastUpdatedDate: '2022-09-24T08:39:00.000Z',
            contingencyPlans: 'Text from contingency plan',
            latestDateCompleted: '2022-10-09T01:02:03.123Z',
            initiationDate,
          },
        },
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    const date = formatDateTimeFromIsoString({ isoDate: initiationDate, monthAndYear: true })
    cy.getElement(
      `OASys was last updated in ${date}. There’s a more recent assessment in OASys that’s not complete.`
    ).should('exist')
  })

  describe('Licence / Offence and sentence', () => {
    it('sort by sentence expiry date; missing data', () => {
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

    it('message in offence panel, and not available for licence dates, if no active custodial convictions', () => {
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
  })

  describe('Offence description', () => {
    it('the assessment is incomplete', () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          risk: { ...getCaseOverviewResponse.risk, assessments: { offenceDataFromLatestCompleteAssessment: false } },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('banner-latest-complete-assessment').should(
        'contain',
        'This information is from the latest complete OASys assessment. Check OASys for new information. There’s a more recent assessment that’s not complete.'
      )
    })

    it("main offences don't match", () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          risk: { ...getCaseOverviewResponse.risk, assessments: { offenceCodesMatch: false } },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('banner-offence-mismatch').should(
        'contain',
        'The main offence in OASys does not match the main offence in NDelius. Double-check OASys and NDelius.'
      )
    })

    it('call for assessments data errored', () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          risk: { ...getCaseOverviewResponse.risk, assessments: { error: 'NOT_FOUND' } },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('offence-description-error').should(
        'contain',
        'This information cannot be found in OASys. Double-check OASys for the latest description of the index offence.'
      )
    })
  })

  describe('Contingency plan', () => {
    it('the contingency plan is from an incomplete assessment', () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          risk: {
            riskManagementPlan: {
              ...getCaseOverviewResponse.risk.riskManagementPlan,
              assessmentStatusComplete: false,
            },
          },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('banner-contingency-incomplete-assessment').should(
        'contain',
        'This contingency plan is from an assessment that’s not complete. Check OAsys if you need the last complete assessment.'
      )
    })

    it('call for contingency plan errored', () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          risk: {
            riskManagementPlan: {
              error: 'SERVER_ERROR',
            },
          },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('contingency-plan-error').should(
        'contain',
        'This information cannot be found in OASys. Double-check OASys for the latest contingency plan.'
      )
    })

    it('contingency plan data missing', () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          risk: {
            riskManagementPlan: {
              ...getCaseOverviewResponse.risk.riskManagementPlan,
              contingencyPlans: null,
            },
          },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('contingency-plan-error').should(
        'contain',
        'This information cannot be found in OASys. Double-check OASys.'
      )
    })
  })
})
