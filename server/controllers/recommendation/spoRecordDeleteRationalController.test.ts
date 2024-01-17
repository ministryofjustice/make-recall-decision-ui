import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, getRecommendation, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import spoRecordDeleteRationaleController from './spoRecordDeleteRationaleController'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load recommendation record to delete', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDER_RECALL, active: true }])
    ;(getRecommendation as jest.Mock).mockReturnValueOnce(recommendationApiResponse)

    const res = mockRes({
      locals: {
        page: {
          id: 'recordDeleteRecommendationRationale',
        },
      },
    })
    const next = mockNext()
    await spoRecordDeleteRationaleController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'recordDeleteRecommendationRationale' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/recordDeleteRecommendationRationale')

    expect(res.locals.recommendation.spoDeleteRecommendationRationale).toEqual('some reason to delete')
    expect(next).toHaveBeenCalled()
  })
})
describe('post', () => {
  it('send to NDelius', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(updateStatuses as jest.Mock).mockResolvedValue([])

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        sensitive: 'sensitive',
        crn: 'X098092',
      },
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        user: { username: 'Dave', region: { code: 'N07', name: 'London' } },
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()
    await spoRecordDeleteRationaleController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        sensitive: true,
        sendSpoDeleteRationaleToDelius: true,
      },
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdDeletedRecommendation',
      'Dave',
      {
        crn: 'X098092',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.REC_CLOSED, STATUSES.REC_DELETED],
      deActivate: [],
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/spo-delete-confirmation`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with checkbox unchecked', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(updateStatuses as jest.Mock).mockResolvedValue([])

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        sensitive: undefined,
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    await spoRecordDeleteRationaleController.post(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        sensitive: false,
        sendSpoDeleteRationaleToDelius: true,
      },
      featureFlags: {},
    })
  })
})
