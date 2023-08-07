import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { createRecommendationController } from './createRecommendation'
import { createRecommendation } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

const crn = ' A1234AB '
let res: Response
const token = 'token'
const featureFlags = { flagDomainEventRecommendationStarted: true }

describe('createRecommendationController', () => {
  beforeEach(() => {
    res = mockRes({
      token,
      locals: { user: { username: 'Dave', region: { code: 'N07', name: 'London' } }, flags: featureFlags },
    })
  })

  it('should redirect if successful', async () => {
    ;(createRecommendation as jest.Mock).mockReturnValueOnce({ id: '123' })
    const req = mockReq({ body: { crn } })
    await createRecommendationController(req, res)
    expect(createRecommendation).toHaveBeenCalledWith({ crn: 'A1234AB' }, token, {
      flagDomainEventRecommendationStarted: true,
    })
    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/')
    expect(req.session.errors).toBeUndefined()
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecommendationStarted',
      'Dave',
      {
        crn: 'A1234AB',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
      },
      featureFlags
    )
  })

  it('should reload with a stored error, on a failed API call', async () => {
    ;(createRecommendation as jest.Mock).mockRejectedValue(new Error('API error'))
    const req = mockReq({ body: { crn } })
    await createRecommendationController(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/cases/${crn.trim()}/overview`)
    expect(req.session.errors).toEqual([
      {
        name: 'saveError',
        text: 'An error occurred creating a new recommendation',
      },
    ])
  })
})
