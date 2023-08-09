import { Response } from 'express'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import caseSummaryController from './caseSummaryController'
import { getCaseSummary, getCaseSummaryV2, getStatuses, updateRecommendation } from '../../data/makeDecisionApiClient'
import caseOverviewApiResponse from '../../../api/responses/get-case-overview.json'
import caseRiskApiResponse from '../../../api/responses/get-case-risk.json'
import caseLicenceConditionsResponse from '../../../api/responses/get-case-licence-conditions.json'
import casePersonalDetailsResponse from '../../../api/responses/get-case-personal-details.json'
import caseVulnerabilitiesResponse from '../../../api/responses/get-case-vulnerabilities.json'
import caseRecommendationsResponse from '../../../api/responses/get-case-recommendations.json'
import excludedResponse from '../../../api/responses/get-case-excluded.json'
import restrictedResponse from '../../../api/responses/get-case-restricted.json'
import { AuditService } from '../../services/auditService'
import { appInsightsTimingMetric } from '../../monitoring/azureAppInsights'
import { createRedisClient, RedisClient } from '../../data/redisClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { formOptions } from '../recommendations/formOptions/formOptions'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/redisClient')

describe('get', () => {
  beforeEach(() => {
    res = mockRes({ token, locals: { user: { username: 'Dave', roles: ['ROLE_MAKE_RECALL_DECISION'] } } })
  })
  let res: Response
  const crn = ' A1234AB '
  const token = 'token'
  const next = mockNext()

  it('should return case details for risk', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseRiskApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'risk', token)
    const metricsArg = (appInsightsTimingMetric as jest.Mock).mock.lastCall[0]
    expect(metricsArg.name).toEqual('getCaseRisk')
    expect(typeof metricsArg.startTime).toEqual('number')
    expect(res.render).toHaveBeenCalledWith('pages/caseSummary')
    expect(res.locals.caseSummary).toBeDefined()
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })

  it('should return case details for overview', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'overview' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'overview', token)
    const metricsArg = (appInsightsTimingMetric as jest.Mock).mock.lastCall[0]
    expect(metricsArg.name).toEqual('getCaseOverview')
    expect(typeof metricsArg.startTime).toEqual('number')
    expect(res.locals.caseSummary).toBeDefined()
    expect(res.locals.section).toEqual({
      id: 'overview',
      label: 'Overview',
    })
  })

  it('should return case details for licence conditions', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseLicenceConditionsResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'licence-conditions' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'licence-conditions', token)
    const metricsArg = (appInsightsTimingMetric as jest.Mock).mock.lastCall[0]
    expect(metricsArg.name).toEqual('getCaseLicenceConditions')
    expect(typeof metricsArg.startTime).toEqual('number')
    expect(res.locals.caseSummary.licenceConvictions).toBeDefined()
    expect(res.locals.section).toEqual({
      id: 'licence-conditions',
      label: 'Licence conditions',
    })
  })

  it('should return case details for licence conditions V2', async () => {
    res = mockRes({
      token,
      locals: { flags: { flagCvl: true }, user: { username: 'Dave', roles: ['ROLE_MAKE_RECALL_DECISION'] } },
    })
    ;(getCaseSummaryV2 as jest.Mock).mockReturnValueOnce(caseLicenceConditionsResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'licence-conditions' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummaryV2).toHaveBeenCalledWith(crn.trim(), 'licence-conditions', token)
    expect(res.locals.caseSummary.licenceConvictions.activeCustodial).toStrictEqual(
      caseLicenceConditionsResponse.activeConvictions.filter(conviction => conviction.sentence?.isCustodial)
    )
    expect(res.locals.caseSummary.standardLicenceConditions).toBe(formOptions.standardLicenceConditions)
    expect(res.locals.caseSummary.activeConvictions).toBe(caseLicenceConditionsResponse.activeConvictions)
  })

  it('should return case details for personal details', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(casePersonalDetailsResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'personal-details' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'personal-details', token)
    expect(res.locals.caseSummary).toEqual(casePersonalDetailsResponse)
    expect(res.locals.section).toEqual({
      id: 'personal-details',
      label: 'Personal details',
    })
  })

  it('should return case details for recommendations', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseRecommendationsResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'recommendations' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'recommendations', token)
    expect(res.locals.caseSummary.activeRecommendation).toEqual(caseRecommendationsResponse.activeRecommendation)
    expect(res.locals.section).toEqual({
      id: 'recommendations',
      label: 'Recommendations',
    })
  })

  it('should return case details for vulnerabilities', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseVulnerabilitiesResponse)
    const req = mockReq({ params: { crn, sectionId: 'vulnerabilities' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'vulnerabilities', token)
    expect(res.locals.caseSummary.activeRecommendation).toEqual(caseVulnerabilitiesResponse.activeRecommendation)
    expect(res.locals.section).toEqual({
      id: 'vulnerabilities',
      label: 'Vulnerabilities',
    })
  })

  it('should convert the CRN to uppercase', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn: 'abc', sectionId: 'overview' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith('ABC', 'overview', token)
  })

  it('should return grouped by dates for contact history', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce({
      contactTypeGroups: [
        {
          groupId: '1',
          label: 'Accredited programme',
          contactTypeCodes: ['C191', 'IVSP'],
        },
      ],
      contactSummary: [
        {
          code: 'C191',
          contactStartDate: '2022-06-03T08:00:00',
          descriptionType: 'Registration Review',
          outcome: null,
          notes:
            'Comment added by John Smith on 05/05/2022 at 17:45\nType: Public Protection - MAPPA\nLevel: MAPPA Level 3\nCategory: MAPPA Cat 3\nNotes: Please Note - Category 3 offenders require multi-agency management at Level 2 or 3 and should not be recorded at Level 1.',
          enforcementAction: 'action 2',
          systemGenerated: false,
        },
        {
          code: 'IVSP',
          contactStartDate: '2022-05-10T11:39:00',
          descriptionType: 'Police Liaison',
          outcome: null,
          notes: null,
          enforcementAction: 'action 1',
          systemGenerated: false,
        },
      ],
    })
    ;(createRedisClient as jest.Mock).mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      get: (): null => null,
    } as unknown as RedisClient)
    const req = mockReq({ params: { crn, sectionId: 'contact-history' } })
    await caseSummaryController.get(req, res, next)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'contact-history', token)
    expect(res.locals.caseSummary.contactSummary).toEqual({
      groupedByKey: 'startDate',
      items: [
        {
          groupValue: '2022-06-03',
          items: [
            {
              code: 'C191',
              contactStartDate: '2022-06-03T08:00:00',
              descriptionType: 'Registration Review',
              enforcementAction: 'action 2',
              notes:
                'Comment added by John Smith on 05/05/2022 at 17:45\nType: Public Protection - MAPPA\nLevel: MAPPA Level 3\nCategory: MAPPA Cat 3\nNotes: Please Note - Category 3 offenders require multi-agency management at Level 2 or 3 and should not be recorded at Level 1.',
              outcome: null,
              startDate: '2022-06-03',
              systemGenerated: false,
            },
          ],
        },
        {
          groupValue: '2022-05-10',
          items: [
            {
              code: 'IVSP',
              contactStartDate: '2022-05-10T11:39:00',
              descriptionType: 'Police Liaison',
              enforcementAction: 'action 1',
              notes: null,
              outcome: null,
              startDate: '2022-05-10',
              systemGenerated: false,
            },
          ],
        },
      ],
    })
    expect(res.locals.section).toEqual({
      id: 'contact-history',
      label: 'Contact history',
    })
  })

  it('should throw for an invalid CRN', async () => {
    const invalidCrn = 50 as unknown as string
    const req = mockReq({ params: { crn: invalidCrn, sectionId: 'contact-log' } })
    try {
      await caseSummaryController.get(req, res, next)
    } catch (err) {
      expect(err.status).toEqual(400)
    }
  })

  it('should throw for an invalid section param', async () => {
    const invalidSection = 'recalls'
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    const req = mockReq({ params: { crn, sectionId: invalidSection } })
    try {
      await caseSummaryController.get(req, res, next)
    } catch (err) {
      expect(err.message).toEqual('getCaseSection: invalid sectionId: recalls')
      expect(err.status).toEqual(404)
    }
  })

  it('should throw if the API call errors', async () => {
    const apiError = { status: 500 }
    ;(getCaseSummary as jest.Mock).mockRejectedValue(apiError)
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    try {
      await caseSummaryController.get(req, res, next)
    } catch (err) {
      expect(err).toEqual(apiError)
    }
  })

  it('should render an excluded CRN', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(excludedResponse)
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummaryController.get(req, res, next)
    expect(res.render).toHaveBeenCalledWith('pages/excludedRestrictedCrn')
    expect(res.locals.caseSummary).toEqual(excludedResponse)
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })

  it('should render a restricted CRN', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(restrictedResponse)
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummaryController.get(req, res, next)
    expect(res.render).toHaveBeenCalledWith('pages/excludedRestrictedCrn')
    expect(res.locals.caseSummary).toEqual(restrictedResponse)
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })

  it('should send an audit event', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseRiskApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    jest.spyOn(AuditService.prototype, 'caseSummaryView')
    await caseSummaryController.get(req, res, next)
    expect(AuditService.prototype.caseSummaryView).toHaveBeenCalledWith({
      crn: 'A1234AB',
      sectionId: 'risk',
      username: 'Dave',
      logErrors: false,
    })
  })

  it('show recommendation button for existing recommendation', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ params: { crn, sectionId: 'overview' } })
    await caseSummaryController.get(req, res, next)

    expect(res.locals.backLink).toEqual('/search')
    expect(res.locals.pageUrlBase).toEqual('/cases/A1234AB/')
    expect(res.locals.recommendationButton).toEqual({
      display: true,
      post: false,
      title: 'Update recommendation',
      dataAnalyticsEventCategory: 'update_recommendation_click',
      link: '/recommendations/1/',
    })
    expect(res.locals.backLink)
  })

  it('show recommendation button for existing recommendation that is not closed', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([{ name: STATUSES.CLOSED, active: true }])
    const req = mockReq({ params: { crn, sectionId: 'overview' } })

    await caseSummaryController.get(req, res, next)

    expect(res.locals.backLink).toEqual('/search')
    expect(res.locals.pageUrlBase).toEqual('/cases/A1234AB/')
    expect(res.locals.recommendationButton).toEqual({
      display: true,
      post: false,
      title: 'Make a recommendation',
      dataAnalyticsEventCategory: 'make_recommendation_click',
      link: '/cases/A1234AB/create-recommendation-warning',
    })
    expect(res.locals.backLink)
  })

  it('show recommendation button for no recommendation', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce({ ...caseOverviewApiResponse, activeRecommendation: null })
    const req = mockReq({ params: { crn, sectionId: 'overview' } })
    await caseSummaryController.get(req, res, next)

    expect(res.locals.backLink).toEqual('/search')
    expect(res.locals.pageUrlBase).toEqual('/cases/A1234AB/')
    expect(res.locals.recommendationButton).toEqual({
      display: true,
      post: false,
      title: 'Make a recommendation',
      dataAnalyticsEventCategory: 'make_recommendation_click',
      link: '/cases/A1234AB/create-recommendation-warning',
    })
    expect(res.locals.backLink)
  })

  it('show recommendation button for case review', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce({ ...caseOverviewApiResponse, activeRecommendation: null })
    const req = mockReq({ params: { crn, sectionId: 'overview', recommendationId: '123' } })
    await caseSummaryController.get(req, res, next)

    expect(res.locals.backLink).toEqual('/recommendations/123/spo-task-list-consider-recall')
    expect(res.locals.pageUrlBase).toEqual('/recommendations/123/review-case/A1234AB/')
    expect(res.locals.recommendationButton).toEqual({
      display: true,
      post: true,
      title: 'Continue',
    })
    expect(res.locals.backLink)
  })

  it('do show recommendation button for spo when no recommendation doc', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce({ ...caseOverviewApiResponse, activeRecommendation: null })
    const req = mockReq({
      params: { crn, sectionId: 'overview' },
    })
    res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })

    await caseSummaryController.get(req, res, next)

    expect(res.locals.backLink).toEqual('/search')
    expect(res.locals.pageUrlBase).toEqual('/cases/A1234AB/')
    expect(res.locals.recommendationButton).toEqual({
      display: false,
    })
    expect(res.locals.backLink)
  })

  it('do not show recommendation button for spo when recommendation doc and no appropriate spo state', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({
      params: { crn, sectionId: 'overview' },
    })
    res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })

    await caseSummaryController.get(req, res, next)

    expect(res.locals.backLink).toEqual('/search')
    expect(res.locals.pageUrlBase).toEqual('/cases/A1234AB/')
    expect(res.locals.recommendationButton).toEqual({
      display: false,
    })
    expect(res.locals.backLink)
  })

  it('do show recommendation button for spo when recommendation doc and SPO_CONSIDER_RECALL state', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([{ name: STATUSES.SPO_CONSIDER_RECALL, active: true }])
    const req = mockReq({
      params: { crn, sectionId: 'overview' },
    })
    res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })

    await caseSummaryController.get(req, res, next)

    expect(res.locals.backLink).toEqual('/search')
    expect(res.locals.pageUrlBase).toEqual('/cases/A1234AB/')
    expect(res.locals.recommendationButton).toEqual({
      display: true,
      dataAnalyticsEventCategory: 'spo_consider_recall_click',
      link: '/recommendations/1/',
      post: false,
      title: 'Consider a recall',
    })
    expect(res.locals.backLink)
  })

  it('do show recommendation button for spo when SPO_SIGNATURE_REQUESTED state', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([{ name: STATUSES.SPO_SIGNATURE_REQUESTED, active: true }])
    const req = mockReq({
      params: { crn, sectionId: 'overview' },
    })
    res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })

    await caseSummaryController.get(req, res, next)

    expect(res.locals.recommendationButton).toEqual({
      display: true,
      dataAnalyticsEventCategory: 'spo_countersign_click',
      link: '/recommendations/1/task-list',
      post: false,
      title: 'Countersign',
    })
  })
  it('do show recommendation button for spo when ACO_SIGNATURE_REQUESTED state', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    ;(getStatuses as jest.Mock).mockReturnValueOnce([{ name: STATUSES.ACO_SIGNATURE_REQUESTED, active: true }])
    const req = mockReq({
      params: { crn, sectionId: 'overview' },
    })
    res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })

    await caseSummaryController.get(req, res, next)

    expect(res.locals.recommendationButton).toEqual({
      display: true,
      dataAnalyticsEventCategory: 'spo_countersign_click',
      link: '/recommendations/1/task-list',
      post: false,
      title: 'Countersign',
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()

    await caseSummaryController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        reviewOffenderProfile: true,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/spo-task-list-consider-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
