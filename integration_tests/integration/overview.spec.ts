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
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview for Paula Smith')
    // licence info
    const { lastRelease, activeConvictions, risk } = getCaseOverviewResponse
    cy.getText('lastReleaseDate').should('equal', formatDateTimeFromIsoString({ isoDate: lastRelease.releaseDate }))
    cy.getText('licenceExpiryDate').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: activeConvictions[1].sentence.licenceExpiryDate })
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

    // offence analysis
    cy.getDefinitionListValue('Analysis', { parent: '[data-qa="offence-analysis"]' }).should(
      'contain',
      'Mr Smith was recalled again on 13/12/2021.'
    )

    // contingency plan
    cy.getElement('Last updated: 24 September 2022', { parent: '[data-qa="contingency-plan"]' }).should('exist')
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
    cy.task('getStatuses', { statusCode: 200, response: [] })
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
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    const date = formatDateTimeFromIsoString({ isoDate: latestDateCompleted, monthAndYear: true })
    cy.getElement(`OASys was last updated in ${date}`).should('exist')
  })

  it('Most recent assessment is complete and over 22 weeks old', () => {
    const latestDateCompleted = DateTime.now().minus({ week: 23 }).toISODate()
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        risk: {
          riskManagementPlan: {
            assessmentStatusComplete: true,
            contingencyPlans: 'Text from contingency plan',
            latestDateCompleted,
          },
        },
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    const date = formatDateTimeFromIsoString({ isoDate: latestDateCompleted, monthAndYear: true })
    cy.getElement(`OASys was last updated in ${date}.`).should('exist')
  })

  it('Most recent assessment is incomplete and the last complete one is over 22 weeks old', () => {
    const latestDateCompleted = DateTime.now().minus({ week: 23 }).toISODate()
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        risk: {
          riskManagementPlan: {
            assessmentStatusComplete: false,
            contingencyPlans: 'Text from contingency plan',
            latestDateCompleted,
          },
        },
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    const date = formatDateTimeFromIsoString({ isoDate: latestDateCompleted, monthAndYear: true })
    cy.getElement(
      `OASys was last updated in ${date}. There's a more recent assessment in OASys that's not complete. Double-check this for any new information.`
    ).should('exist')
  })

  describe('Licence / Offence and sentence', () => {
    it('sort by sentence expiry date; missing data', () => {
      const activeConvictions = [
        { mainOffence: { description: 'Non-custodial' } },
        {
          mainOffence: { description: 'Custodial' },
          sentence: { isCustodial: true, sentenceExpiryDate: '2020-06-16' },
        },
        {
          mainOffence: { description: 'Custodial' },
          sentence: { isCustodial: true, sentenceExpiryDate: null },
        },
        {
          mainOffence: { description: 'Custodial' },
          sentence: { isCustodial: true, sentenceExpiryDate: '2023-06-17' },
        },
      ]
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          activeConvictions,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      const activeConvictions = [{ sentence: { isCustodial: true, custodialStatusCode: 'B' } }]
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          activeConvictions,
          lastRelease: null,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('lastReleaseDate').should('equal', 'Not available')
      cy.getText('licenceExpiryDate').should('equal', 'Not available')
    })

    it('shows a banner and no licence box if a single active custodial conviction which is not released on licence', () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          activeConvictions: [
            {
              mainOffence: { description: 'Robbery' },
              sentence: { isCustodial: true, custodialStatusCode: 'A' },
            },
          ],
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getElement(
        'This person is not on licence in NDelius. Check the throughcare details in NDelius are correct.'
      ).should('exist')
      cy.getElement({ qaAttr: 'lastReleaseDate' }).should('not.exist')
      cy.getElement({ qaAttr: 'licenceExpiryDate' }).should('not.exist')
    })

    it('shows banner and "Not available" for last release and licence expiry date if there are multiple active custodial convictions', () => {
      const activeConvictions = [
        { sentence: { isCustodial: true, custodialStatusCode: 'B', licenceExpiryDate: '2020-06-16' } },
        { sentence: { isCustodial: true, custodialStatusCode: 'B', licenceExpiryDate: '2023-06-17' } },
      ]
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          hasAllConvictionsReleasedOnLicence: true,
          ...getCaseOverviewResponse,
          activeConvictions,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('lastReleaseDate').should('equal', 'Not available')
      cy.getText('licenceExpiryDate').should('equal', 'Not available')

      // banner
      cy.getElement({ qaAttr: 'banner-multiple-active-custodial' }).should('exist')
      cy.getElement('This person has 2 or more active convictions in NDelius').should('exist')
    })

    it('shows "not on licence" banner and no licence box if there are multiple active custodial convictions and not all are released on licence', () => {
      const activeConvictions = [
        { sentence: { isCustodial: true, custodialStatusCode: 'B', licenceExpiryDate: '2020-07-16' } },
        { sentence: { isCustodial: true, custodialStatusCode: 'A', licenceExpiryDate: '2020-06-16' } },
      ]
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          activeConvictions,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)

      // banner
      cy.getElement(
        'This person is not on licence for at least one of their active convictions. Check the throughcare details in NDelius are correct.',
        { parent: '[data-qa="banner-multiple-active-custodial"]' }
      ).should('exist')
      cy.getElement({ qaAttr: 'lastReleaseDate' }).should('not.exist')
      cy.getElement({ qaAttr: 'licenceExpiryDate' }).should('not.exist')
    })

    it('message in offence panel, and not available for licence dates, if no active custodial convictions', () => {
      const activeConvictions = []
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          activeConvictions,
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getElement('This person has no active offences or convictions.').should('exist')
      cy.getText('lastReleaseDate').should('equal', 'Not available')
      cy.getText('licenceExpiryDate').should('equal', 'Not available')
      // warning banner should not be there
      cy.getElement({ qaAttr: 'banner-multiple-active-custodial' }).should('not.exist')
    })
  })

  describe('Offence analysis', () => {
    it('the assessment is incomplete', () => {
      cy.task('getCase', {
        sectionId: 'overview',
        statusCode: 200,
        response: {
          ...getCaseOverviewResponse,
          risk: { ...getCaseOverviewResponse.risk, assessments: { offenceDataFromLatestCompleteAssessment: false } },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
          risk: { ...getCaseOverviewResponse.risk, assessments: { offencesMatch: false } },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('offence-analysis-error').should(
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
              lastUpdatedDate: '2021-05-23T00:00:00.000Z',
            },
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getElement('Started on: 1 September 2022', { parent: '[data-qa="contingency-plan"]' }).should('exist')
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
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
      cy.task('getStatuses', { statusCode: 200, response: [] })
      cy.visit(`${routeUrls.cases}/${crn}/overview`)
      cy.getText('contingency-plan-error').should(
        'contain',
        'This information cannot be found in OASys. Double-check OASys.'
      )
    })
  })
})
