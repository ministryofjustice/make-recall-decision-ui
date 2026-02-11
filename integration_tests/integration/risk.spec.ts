import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import { routeUrls } from '../../server/routes/routeUrls'
import getCaseRiskNoDataResponse from '../../api/responses/get-case-risk-no-data.json'
import completeRecommendationResponse from '../../api/responses/get-recommendation.json'

context('Risk page', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.task('reset')
    cy.window().then(win => win.sessionStorage.clear())
    cy.task('getUser', { user: 'USER1', statusCode: 200, response: { homeArea: { code: 'N07', name: 'London' } } })
    cy.signIn()

    // Mock the API calls
    cy.task('getActiveRecommendation', { statusCode: 200, response: { recommendationId: 12345 } })
    cy.task('getRecommendation', {
      statusCode: 200,
      response: { ...completeRecommendationResponse },
    })
    cy.task('getStatuses', { statusCode: 200, response: [] })
  })

  it('shows RoSH, MAPPA and v1 predictor scores', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: {
        ...getCaseRiskResponse,
      },
    })

    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.pageHeading().should('equal', 'Risk for Jane Bloggs')
    cy.getElement({ qaAttr: 'banner-latest-complete-assessment' }).should('not.exist')

    // Content panels
    const { whoIsAtRisk, natureOfRisk, riskIncreaseFactors, riskImminence, riskMitigationFactors } =
      getCaseRiskResponse.roshSummary
    cy.viewDetails('View more detail on Who is at risk').should('contain', whoIsAtRisk)
    cy.getElement('Last updated: 9 October 2021', { parent: '[data-qa="whoIsAtRisk"]' }).should('exist')
    cy.viewDetails('View more detail on Details of the risk').should('contain', natureOfRisk)
    cy.getElement('Last updated: 9 October 2021', { parent: '[data-qa="natureOfRisk"]' }).should('exist')
    cy.viewDetails('View more detail on When the risk will be highest').should('contain', riskImminence)
    cy.getElement('Last updated: 9 October 2021', { parent: '[data-qa="riskImminence"]' }).should('exist')
    cy.viewDetails('View more detail on Circumstances that will increase the risk').should(
      'contain',
      riskIncreaseFactors
    )
    cy.getElement('Last updated: 9 October 2021', { parent: '[data-qa="riskIncreaseFactors"]' }).should('exist')
    cy.viewDetails('View more detail on Factors that will reduce the risk').should('contain', riskMitigationFactors)
    cy.getElement('Last updated: 9 October 2021', { parent: '[data-qa="riskMitigationFactors"]' }).should('exist')

    // v1 predictor scores
    const v1Predictors = [OGRS3_EXPECTED, RSR_EXPECTED, OGP_EXPECTED, OVP_EXPECTED, OSP_IIC_EXPECTED, OSP_DC_EXPECTED]

    v1Predictors.forEach(predictor => {
      assertPredictorScale(predictor)
    })

    // v2 predictor scores don't exist in the mocked response
    const v2Predictors = [
      ALL_REOFFENDING_EXPECTED,
      VIOLENT_REOFFENDING_EXPECTED,
      SERIOUS_VIOLENT_REOFFENDING_EXPECTED,
      DIRECT_CONTACT_SEXUAL_REOFFENDING_EXPECTED,
      INDIRECT_IMAGE_CONTACT_SEXUAL_REOFFENDING_EXPECTED,
      COMBINED_SERIOUS_REOFFENDING_EXPECTED,
    ]

    v2Predictors.forEach(predictor => {
      cy.contains('.predictor-scale', predictor.name).should('not.exist')
    })

    // RoSH table
    cy.getElement('Last updated: 9 October 2021', { parent: '[data-qa="roshTable"]' }).should('exist')
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Children' }).then(rowValues => {
      expect(rowValues).to.deep.eq(['Medium', 'Low'])
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Public' }).then(rowValues => {
      expect(rowValues).to.deep.eq(['High', 'Very high'])
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Known adult' }).then(rowValues => {
      expect(rowValues).to.deep.eq(['High', 'Medium'])
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Staff' }).then(rowValues => {
      expect(rowValues).to.deep.eq(['Very high', 'High'])
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Prisoners' }).then(rowValues => {
      expect(rowValues).to.deep.eq(['N/A', 'Medium'])
    })

    // MAPPA level
    cy.getElement('Cat 2/Level 1 MAPPA').should('exist')
    cy.getElement('Last updated: 24 September 2022', { parent: '[data-qa="mappa"]' }).should('exist')
  })

  it('shows v2 predictor scores correctly', () => {
    const predictorScores = {
      current: {
        date: '2026-10-24',
        scores: {
          allReoffendingPredictor: {
            score: 12.5,
            band: 'MEDIUM',
            staticOrDynamic: 'STATIC',
          },
          violentReoffendingPredictor: {
            score: 8.0,
            band: 'LOW',
            staticOrDynamic: 'DYNAMIC',
          },
          seriousViolentReoffendingPredictor: {
            score: 15.2,
            band: 'HIGH',
            staticOrDynamic: 'STATIC',
          },
          directContactSexualReoffendingPredictor: {
            score: 6.3,
            band: 'LOW',
          },
          indirectImageContactSexualReoffendingPredictor: {
            score: 9.8,
            band: 'MEDIUM',
          },
          combinedSeriousReoffendingPredictor: {
            score: 18.7,
            band: 'VERY_HIGH',
            staticOrDynamic: 'DYNAMIC',
            algorithmVersion: 'v2.1.0',
          },
        },
      },
      historical: [],
    }
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: {
        ...getCaseRiskResponse,
        predictorScores,
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.pageHeading().should('equal', 'Risk for Jane Bloggs')

    const v2Predictors = [
      ALL_REOFFENDING_EXPECTED,
      VIOLENT_REOFFENDING_EXPECTED,
      SERIOUS_VIOLENT_REOFFENDING_EXPECTED,
      DIRECT_CONTACT_SEXUAL_REOFFENDING_EXPECTED,
      INDIRECT_IMAGE_CONTACT_SEXUAL_REOFFENDING_EXPECTED,
      COMBINED_SERIOUS_REOFFENDING_EXPECTED,
    ]

    v2Predictors.forEach(predictor => {
      assertPredictorScale(predictor)
    })
  })

  it('shows predictor scores with old OSP values', () => {
    const currentScore = {
      date: '2021-10-24',
      scores: {
        OSPC: {
          level: 'LOW',
          type: 'OSP-C',
        },
        OSPI: {
          level: 'MEDIUM',
          type: 'OSP-I',
        },
      },
    }
    const predictorScores = {
      current: currentScore,
      historical: [currentScore],
    }
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: {
        ...getCaseRiskResponse,
        predictorScores,
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)

    assertPredictorScale(OSPC_EXPECTED)
    assertPredictorScale(OSPI_EXPECTED)
    cy.contains('.predictor-scale', 'OSP-IIC').should('not.exist')
    cy.contains('.predictor-scale', 'OSP-DC').should('not.exist')
  })

  it('shows predictor scores with new OSP values', () => {
    const currentScore = {
      date: '2021-10-24',
      scores: {
        OSPDC: {
          level: 'LOW',
          type: 'OSP-DC',
        },
        OSPIIC: {
          level: 'MEDIUM',
          type: 'OSP-IIC',
        },
      },
    }
    const predictorScores = {
      current: currentScore,
      historical: [currentScore],
    }
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: {
        ...getCaseRiskResponse,
        predictorScores,
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)

    assertPredictorScale(OSP_IIC_EXPECTED)
    assertPredictorScale(OSP_DC_EXPECTED)
    cy.contains('.predictor-scale', 'OSP-C').should('not.exist')
    // using regex: /^OSP-I$/ rather than 'OSP-I' to avoid false positives from the string containing 'OSP-I' due to OSP-IIC is present
    cy.contains('.predictor-scale', /^OSP-I$/).should('not.exist')
  })

  it('shows messages if RoSH / MAPPA / predictor score data is not found', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: {
        ...getCaseRiskNoDataResponse,
        roshSummary: { error: 'NOT_FOUND_LATEST_COMPLETE' },
        mappa: { error: 'NOT_FOUND' },
      },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)

    // predictor scores
    cy.getText('rsr-missing').should('contain', 'Data not available.')
    cy.getText('ospdc-missing').should('contain', 'Data not available.')
    cy.getText('ospiic-missing').should('contain', 'Data not available.')
    cy.getElement('ospc-missing').should('not.exist')
    cy.getElement('ospi-missing').should('not.exist')
    cy.getText('ogrs-missing').should('contain', 'Data not available.')
    cy.getText('ogp-missing').should('contain', 'Data not available.')
    cy.getText('ovp-missing').should('contain', 'Data not available.')

    // RoSH content boxes & table
    ;['whoIsAtRisk', 'natureOfRisk', 'riskImminence', 'riskIncreaseFactors', 'riskMitigationFactors'].forEach(id =>
      cy
        .getElement('This information cannot be retrieved from OASys. Double-check as it may be out of date.', {
          parent: `[data-qa="${id}"]`,
        })
        .should('exist')
    )

    cy.getElement('This information cannot be retrieved from OASys. Double-check as it may be out of date.', {
      parent: `[data-qa="roshTable"]`,
    }).should('exist')

    cy.getElement('Unknown RoSH').should('exist')
    cy.getElement('Unknown MAPPA').should('exist')
    cy.getElement('No MAPPA data found in NDelius.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('If you think this is wrong:', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('1. Check and update NDelius.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('2. Refresh this page to see your update.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('You can continue with the Part A', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('if you still get this error. Update the', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('MAPPA section manually.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
  })

  it('shows messages if an error occurs fetching RoSH / MAPPA / predictor score data', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: getCaseRiskNoDataResponse,
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)

    // RoSH content boxes
    ;['whoIsAtRisk', 'natureOfRisk', 'riskImminence', 'riskIncreaseFactors', 'riskMitigationFactors'].forEach(id =>
      cy
        .getElement('This information cannot be retrieved from OASys.', {
          parent: `[data-qa="${id}"]`,
        })
        .should('exist')
    )
    cy.getElement('Unknown RoSH').should('exist')
    cy.getElement('This information cannot be retrieved from OASys.').should('exist')
    cy.getElement('Unknown MAPPA').should('exist')
    cy.getElement('No MAPPA data found in NDelius.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('If you think this is wrong:', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('1. Check and update NDelius.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('2. Refresh this page to see your update.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('You can continue with the Part A', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('if you still get this error. Update the', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
    cy.getElement('MAPPA section manually.', {
      parent: '[data-qa="mappa"]',
    }).should('exist')
  })

  it('shows messages if RoSH data empty', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: { ...getCaseRiskNoDataResponse, roshSummary: { error: 'MISSING_DATA' } },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)

    // RoSH content boxes
    ;['whoIsAtRisk', 'natureOfRisk', 'riskImminence', 'riskIncreaseFactors', 'riskMitigationFactors'].forEach(id =>
      cy
        .getElement('The latest complete OASys assessment does not have full RoSH information.', {
          parent: `[data-qa="${id}"]`,
        })
        .should('exist')
    )
    cy.getElement('The latest complete OASys assessment does not have full RoSH information.', {
      parent: '[data-qa="roshTable"]',
    }).should('exist')
  })

  describe('Timeline', () => {
    it('Predictor scores and RoSH history available', () => {
      cy.task('getCase', {
        sectionId: 'risk',
        statusCode: 200,
        response: getCaseRiskResponse,
      })

      cy.visit(`${routeUrls.cases}/${crn}/risk`)

      // RoSH history
      cy.get('[data-qa="timeline-item-1"]').should('contain', '17 October 2022')
      cy.get('[data-qa="timeline-item-1"]').should('contain', 'RoSH VERY HIGH')
      cy.getLinkHref({ qaAttr: 'view-contacts' }, { parent: '[data-qa="timeline-item-1"]' }).should(
        'contain',
        '/cases/X34983/contact-history?dateFrom-day=17&dateFrom-month=10&dateFrom-year=2022&dateTo-day=17&dateTo-month=10&dateTo-year=2022&includeSystemGenerated=YES'
      )

      cy.get('[data-qa="timeline-item-3"]').should('contain', '23 June 2021')
      cy.get('[data-qa="timeline-item-3"]').should('contain', 'RoSH HIGH')
      cy.viewDetails('View notes on RoSH history on 23 June 2021').should(
        'contain',
        'Registering Staff ID re-assigned in TR Migration'
      )
      //  Step 0: Open all hidden sections
      cy.get('#predictor-timeline__toggle-all').click()

      //  Timeline Item 1: 17 October 2022 (RoSH, always visible)
      let opts = { parent: '[data-qa="timeline-item-1"]' }
      cy.getElement('17 October 2022', opts).should('be.visible')
      cy.get(opts.parent).contains('span.predictor-timeline-item__level', 'RoSH').should('be.visible')
      cy.get(opts.parent).contains('span.predictor-timeline-item__level', 'VERY HIGH').should('be.visible')
      cy.get(opts.parent).contains('from NDelius', { matchCase: false }).should('be.visible')
      cy.get(opts.parent).contains('View contacts from 17 October 2022').should('be.visible')

      //  Timeline Item 2: 13 July 2021 (Legacy + new predictors)
      opts = { parent: '[data-qa="timeline-item-2"]' }
      cy.getElement('13 July 2021', opts).should('be.visible')

      // RSR
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'RSR').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'HIGH').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '18%').should('be.visible')

      // OSP-DC
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OSP-DC').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'LOW').should('be.visible')

      // OSP-IIC
      cy.get(opts.parent)
        .contains('span.legacy-predictor-timeline-item__type_and_level', 'OSP-IIC')
        .should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'MEDIUM').should('be.visible')

      // OGRS3
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OGRS3').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'MEDIUM').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '20%').should('be.visible')

      // OGP
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OGP').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'HIGH').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '63%').should('be.visible')

      // OVP
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OVP').should('be.visible')
      cy.get(opts.parent)
        .contains('span.legacy-predictor-timeline-item__type_and_level', 'VERY HIGH')
        .should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '64%').should('be.visible')

      //  Timeline Item 3: 23 June 2021 (RoSH, always visible)
      opts = { parent: '[data-qa="timeline-item-3"]' }
      cy.getElement('23 June 2021', opts).should('be.visible')
      cy.get(opts.parent).contains('span.predictor-timeline-item__level', 'RoSH').should('be.visible')
      cy.get(opts.parent).contains('span.predictor-timeline-item__level', 'HIGH').should('be.visible')
      cy.get(opts.parent).contains('from NDelius', { matchCase: false }).should('be.visible')
      cy.get(opts.parent).contains('View contacts from 23 June 2021').should('be.visible')
      cy.get(opts.parent).contains('Registering Staff ID re-assigned in TR Migration').should('be.visible')

      //  Timeline Item 4: 4 May 2019 (Legacy + new predictors)
      opts = { parent: '[data-qa="timeline-item-4"]' }
      cy.getElement('4 May 2019', opts).should('be.visible')

      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'RSR').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'MEDIUM').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '12%').should('be.visible')

      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OSP-C').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'MEDIUM').should('be.visible')

      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OSP-I').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'LOW').should('be.visible')

      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OGRS3').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'HIGH').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '55%').should('be.visible')

      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OGP').should('be.visible')
      cy.get(opts.parent)
        .contains('span.legacy-predictor-timeline-item__type_and_level', 'VERY HIGH')
        .should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '85%').should('be.visible')

      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__type_and_level', 'OVP').should('be.visible')
      cy.get(opts.parent).contains('span.legacy-predictor-timeline-item__score', '91%').should('be.visible')

      cy.get('.predictor-timeline__item')
        .contains('.predictor-timeline__byline', '23 February 2026 at 09:00')
        .parents('.predictor-timeline__item')
        .as('item2026')

      cy.get('@item2026').contains('23 February 2026 at 09:00').should('be.visible')

      cy.get('@item2026').find('div.govuk-warning-text.predictor-timeline__warning').should('be.visible')

      cy.get('@item2026').find('span.govuk-warning-text__icon').should('be.visible').and('contain.text', '!')

      cy.get('@item2026')
        .find('strong.govuk-warning-text__text')
        .should('be.visible')
        .and('contain.text', 'All assessments started after this date use updated risk predictor tools')

      cy.get('@item2026')
        .find('details.govuk-details.predictor-timeline__details summary span.govuk-details__summary-text')
        .should('be.visible')
        .and('contain.text', 'How the risk predictor tools have changed')
    })

    it('errors fetching both predictor and RoSH history', () => {
      cy.task('getCase', {
        sectionId: 'risk',
        statusCode: 200,
        response: getCaseRiskNoDataResponse,
      })
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      cy.getText('timeline-missing').should(
        'equal',
        'RoSH levels and predictor scores cannot be retrieved from NDelius or OASys. Double-check NDelius and OASys.'
      )
    })

    it('error fetching predictor scores', () => {
      cy.task('getCase', {
        sectionId: 'risk',
        statusCode: 200,
        response: {
          ...getCaseRiskResponse,
          predictorScores: {
            error: 'SERVER_ERROR',
          },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      cy.getText('score-history-missing').should(
        'equal',
        'Predictor scores cannot be retrieved from OASys. Double-check OASys.'
      )
      cy.get('[data-qa="timeline-item-1"]').should('contain', 'RoSH VERY HIGH')
      cy.get('[data-qa="timeline-item-2"]').should('contain', 'RoSH HIGH')
    })

    it('error fetching RoSH history', () => {
      cy.task('getCase', {
        sectionId: 'risk',
        statusCode: 200,
        response: {
          ...getCaseRiskResponse,
          roshHistory: {
            error: 'SERVER_ERROR',
          },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      cy.getText('rosh-history-missing').should(
        'equal',
        'Historical RoSH levels cannot be retrieved from NDelius. Double-check NDelius and OASys.'
      )
      cy.get('[data-qa="timeline-item-1"]').should('contain', '13 July 2021')
      cy.get('[data-qa="timeline-item-2"]').should('contain', '4 May 2019')
    })

    it('score timeline - hide individual scores if missing', () => {
      cy.task('getCase', {
        sectionId: 'risk',
        statusCode: 200,
        response: {
          ...getCaseRiskResponse,
          predictorScores: {
            historical: [
              {
                date: '2021-07-13',
                scores: {
                  RSR: null,
                  OSPC: {
                    level: 'LOW',
                    score: 6.8,
                    type: 'OSP-C',
                  },
                },
              },
            ],
          },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      const opts = { parent: '[data-qa="timeline-item-2"]' }
      cy.get('#predictor-timeline__toggle-all').click()
      cy.get('[data-qa="timeline-item-1"]').should('not.contain', 'RSR')
      cy.getElement('OSP-C LOW', opts).should('be.visible')
    })
  })

  it('shows a message if the assessment is incomplete', () => {
    cy.task('getCase', {
      sectionId: 'risk',
      statusCode: 200,
      response: { ...getCaseRiskResponse, assessmentStatus: 'INCOMPLETE' },
    })
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.getText('banner-latest-complete-assessment').should(
      'equal',
      'This information is from the latest complete OASys assessment. Check OASys for new information. There’s a more recent assessment that’s not complete.'
    )
  })
})

type PredictorScaleExpectation = {
  name: string
  level: string
  score: string
  lastUpdated: string
  positionClass: string
  bandPercentages: string[]
  staticOrDynamic?: string
}

const ALL_REOFFENDING_EXPECTED: PredictorScaleExpectation = {
  name: 'All Reoffending Predictor',
  level: 'MEDIUM',
  score: '12.5%',
  lastUpdated: '24 October 2026',
  positionClass: 'scale-marker-wrapper--position-two-of-four',
  bandPercentages: ['50%', '75%', '90%', '100%'],
  staticOrDynamic: 'Static',
}

const VIOLENT_REOFFENDING_EXPECTED: PredictorScaleExpectation = {
  name: 'Violent Reoffending Predictor',
  level: 'LOW',
  score: '8%',
  lastUpdated: '24 October 2026',
  positionClass: 'scale-marker-wrapper--position-one-of-four',
  bandPercentages: ['30%', '60%', '80%', '100%'],
  staticOrDynamic: 'Dynamic',
}

const SERIOUS_VIOLENT_REOFFENDING_EXPECTED: PredictorScaleExpectation = {
  name: 'Serious Violent Reoffending Predictor',
  level: 'HIGH',
  score: '',
  lastUpdated: '24 October 2026',
  positionClass: 'scale-marker-wrapper--position-three-of-four',
  bandPercentages: ['0.99%', '2.99%', '6.89%', '99%'],
  staticOrDynamic: 'Static',
}

const DIRECT_CONTACT_SEXUAL_REOFFENDING_EXPECTED: PredictorScaleExpectation = {
  name: 'Direct Contact - Sexual Reoffending Predictor',
  level: 'LOW',
  score: '',
  lastUpdated: '24 October 2026',
  positionClass: 'scale-marker-wrapper--position-one-of-four',
  bandPercentages: ['', '', '', ''],
}

const INDIRECT_IMAGE_CONTACT_SEXUAL_REOFFENDING_EXPECTED: PredictorScaleExpectation = {
  name: 'Images and Indirect Contact - Sexual Reoffending Predictor',
  level: 'MEDIUM',
  score: '',
  lastUpdated: '24 October 2026',
  positionClass: 'scale-marker-wrapper--position-two-of-three',
  bandPercentages: ['', '', ''],
  staticOrDynamic: undefined,
}

const COMBINED_SERIOUS_REOFFENDING_EXPECTED: PredictorScaleExpectation = {
  name: 'Combined Serious Reoffending Predictor',
  level: 'VERY HIGH',
  score: '18.7%',
  lastUpdated: '24 October 2026',
  positionClass: 'scale-marker-wrapper--position-four-of-four',
  bandPercentages: ['1%', '3%', '6.9%', '25%'],
  staticOrDynamic: 'Dynamic',
}

const OGRS3_EXPECTED: PredictorScaleExpectation = {
  name: 'OGRS3',
  level: 'MEDIUM',
  score: '20%',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-two-of-four',
  bandPercentages: ['50%', '75%', '90%', '100%'],
}

const RSR_EXPECTED: PredictorScaleExpectation = {
  name: 'RSR',
  level: 'HIGH',
  score: '18%',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-three-of-four',
  bandPercentages: ['3%', '6.9%', '25%', ''],
}

const OGP_EXPECTED: PredictorScaleExpectation = {
  name: 'OGP',
  level: 'HIGH',
  score: '22%',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-three-of-four',
  bandPercentages: ['34%', '67%', '85%', '100%'],
}

const OVP_EXPECTED: PredictorScaleExpectation = {
  name: 'OVP',
  level: 'VERY HIGH',
  score: '64%',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-four-of-four',
  bandPercentages: ['30%', '60%', '80%', '100%'],
}

const OSP_IIC_EXPECTED: PredictorScaleExpectation = {
  name: 'OSP-IIC',
  level: 'MEDIUM',
  score: '',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-two-of-three',
  bandPercentages: ['', '', ''],
}

const OSP_DC_EXPECTED: PredictorScaleExpectation = {
  name: 'OSP-DC',
  level: 'LOW',
  score: '',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-one-of-three',
  bandPercentages: ['', '', ''],
}

const OSPC_EXPECTED: PredictorScaleExpectation = {
  name: 'OSP-C',
  level: 'LOW',
  score: '',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-one-of-four',
  bandPercentages: ['', '', '', ''],
}

const OSPI_EXPECTED: PredictorScaleExpectation = {
  name: 'OSP-I',
  level: 'MEDIUM',
  score: '',
  lastUpdated: '24 October 2021',
  positionClass: 'scale-marker-wrapper--position-two-of-three',
  bandPercentages: ['', '', ''],
}

const assertPredictorScale = ({
  name,
  level,
  score,
  lastUpdated,
  positionClass,
  bandPercentages,
  staticOrDynamic,
}: PredictorScaleExpectation) => {
  cy.contains('.predictor-scale', name).within(() => {
    cy.get('h2.govuk-heading-m').should('have.text', name)

    cy.get('.govuk-hint').should('have.text', `Last updated: ${lastUpdated}`)

    if (staticOrDynamic) {
      cy.get('.govuk-tag')
        .invoke('text')
        .then(text => {
          expect(text.trim()).to.equal(staticOrDynamic)
        })
    } else {
      cy.get('.govuk-tag').should('not.exist')
    }

    cy.get(`.${positionClass}`).should('exist')

    cy.get('.scale-marker__card').within(() => {
      cy.get('h3').should('have.text', level)
      if (score) {
        cy.get('.scale-marker__card-bottom p').should('have.text', score)
      } else {
        cy.get('.scale-marker__card-bottom').should('not.exist')
      }
    })

    cy.get('[class*="scale-bar"] > div').then($bands => {
      const values = $bands.toArray().map(el => el.getAttribute('data-band-persentage'))
      expect(values).to.deep.equal(bandPercentages)
    })
  })
}
