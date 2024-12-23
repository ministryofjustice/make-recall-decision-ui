import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import { routeUrls } from '../../server/routes/routeUrls'
import getCaseRiskNoDataResponse from '../../api/responses/get-case-risk-no-data.json'
import { ospdcLevelLabel, riskLevelLabel } from '../../server/utils/nunjucks'
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

  it('shows RoSH, MAPPA and predictor scores', () => {
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.pageHeading().should('equal', 'Risk for Paula Smith')
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

    // predictor scores
    const currentScores = getCaseRiskResponse.predictorScores.current.scores
    cy.getElement(`RSR (risk of serious recidivism) score - ${currentScores.RSR.score}%`).should('exist')
    cy.getElement('scale-ospc').should('not.exist')
    cy.getElement('scale-ospi').should('not.exist')
    cy.getText('scale-ospdc').should('contain', ospdcLevelLabel(currentScores.OSPDC.level))
    cy.getText('scale-ospiic').should('contain', currentScores.OSPIIC.level)
    cy.getText('ogrs-1yr').should('equal', `${currentScores.OGRS.oneYear}%`)
    cy.getText('ogrs-2yr').should('equal', `${currentScores.OGRS.twoYears}%`)
    cy.getText('ogrs-level').should('equal', riskLevelLabel(currentScores.OGRS.level))
    cy.getText('ogp-1yr').should('equal', `${currentScores.OGP.oneYear}%`)
    cy.getText('ogp-2yr').should('equal', `${currentScores.OGP.twoYears}%`)
    cy.getText('ogp-level').should('equal', riskLevelLabel(currentScores.OGP.level))
    cy.getText('ovp-1yr').should('equal', `${currentScores.OVP.oneYear}%`)
    cy.getText('ovp-2yr').should('equal', `${currentScores.OVP.twoYears}%`)
    cy.getText('ovp-level').should('equal', riskLevelLabel(currentScores.OVP.level))

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

  it('displays VERY_HIGH OSPDC predictor score correctly', () => {
    const currentScore = {
      date: '2021-10-24',
      scores: {
        OSPDC: {
          level: 'VERY_HIGH',
          type: 'OSP/DC',
        },
        OSPIIC: {
          level: 'MEDIUM',
          type: 'OSP/IIC',
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

    // predictor scores
    cy.getText('scale-ospdc').should('contain', ospdcLevelLabel(currentScore.scores.OSPDC.level))
    cy.getText('scale-ospiic').should('contain', currentScore.scores.OSPIIC.level)
    cy.getElement('scale-ospc').should('not.exist')
    cy.getElement('scale-ospi').should('not.exist')
  })

  it('shows predictor scores with old OSP values', () => {
    const currentScore = {
      date: '2021-10-24',
      scores: {
        OSPC: {
          level: 'LOW',
          type: 'OSP/C',
        },
        OSPI: {
          level: 'MEDIUM',
          type: 'OSP/I',
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

    // predictor scores
    cy.getText('scale-ospc').should('contain', ospdcLevelLabel(currentScore.scores.OSPC.level))
    cy.getText('scale-ospi').should('contain', currentScore.scores.OSPI.level)
    cy.getElement('scale-ospdc').should('not.exist')
    cy.getElement('scale-ospiic').should('not.exist')
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
    ;[
      'whoIsAtRisk',
      'natureOfRisk',
      'riskImminence',
      'riskIncreaseFactors',
      'riskMitigationFactors',
      'roshTable',
    ].forEach(id =>
      cy
        .getElement('This information cannot be retrieved from OASys. Double-check as it may be out of date.', {
          parent: `[data-qa="${id}"]`,
        })
        .should('exist')
    )
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

      // predictor score history
      cy.clickButton('Open all scores in timeline')
      let opts = { parent: '[data-qa="timeline-item-2"]' }
      cy.getElement('13 July 2021', opts).should('be.visible')
      cy.getElement('RSR HIGH 18', opts).should('be.visible')
      cy.getElement('OSP/DC LOW', opts).should('be.visible')
      cy.getElement('OSP/IIC MEDIUM', opts).should('be.visible')
      cy.getElement('OGRS 1YR MEDIUM 10', opts).should('be.visible')
      cy.getElement('OGRS 2YR MEDIUM 20', opts).should('be.visible')
      cy.getElement('OGP 1YR HIGH 56', opts).should('be.visible')
      cy.getElement('OGP 2YR HIGH 63', opts).should('be.visible')
      cy.getElement('OVP 1YR VERY HIGH 34', opts).should('be.visible')
      cy.getElement('OVP 2YR VERY HIGH 64', opts).should('be.visible')

      opts = { parent: '[data-qa="timeline-item-4"]' }
      cy.getElement('4 May 2019', opts).should('be.visible')
      cy.getElement('RSR MEDIUM 12', opts).should('be.visible')
      cy.getElement('OSP/C MEDIUM', opts).should('be.visible')
      cy.getElement('OSP/I LOW', opts).should('be.visible')
      cy.getElement('OGRS 1YR HIGH 45', opts).should('be.visible')
      cy.getElement('OGRS 2YR HIGH 55', opts).should('be.visible')
      cy.getElement('OGP 1YR VERY HIGH 77', opts).should('be.visible')
      cy.getElement('OGP 2YR VERY HIGH 85', opts).should('be.visible')
      // scores missing a level
      cy.getElement('OVP 1YR 82', opts).should('be.visible')
      cy.getElement('OVP 2YR 91', opts).should('be.visible')
      // close button
      cy.clickButton('Close scores for 13 July 2021')
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
                    type: 'OSP/C',
                  },
                },
              },
            ],
          },
        },
      })
      cy.visit(`${routeUrls.cases}/${crn}/risk`)
      const opts = { parent: '[data-qa="timeline-item-2"]' }
      cy.clickButton('Open all scores in timeline')
      cy.get('[data-qa="timeline-item-1"]').should('not.contain', 'RSR')
      cy.getElement('OSP/C LOW', opts).should('be.visible')
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
