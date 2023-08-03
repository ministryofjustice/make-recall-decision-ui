import { Request, Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getCreateRecommendationWarning } from './getCreateRecommendationWarning'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { AuditService } from '../../services/auditService'

jest.mock('../../monitoring/azureAppInsights')

describe('getCreateRecommendationWarning', () => {
  const crn = '123'
  const accessToken = 'abc'
  let req: Request
  let res: Response

  beforeEach(() => {
    req = mockReq({ params: { crn, pageUrlSlug: 'custody-status' } })
    res = mockRes({
      token: accessToken,
      locals: { user: { username: 'Bill', region: { code: 'N07', name: 'London' } } },
    })
  })

  it('renders the create recommendation warning page', async () => {
    await getCreateRecommendationWarning(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/createRecommendationWarning')
  })

  it('fires an app insights event', async () => {
    await getCreateRecommendationWarning(req, res)
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecommendationPageView',
      'Bill',
      {
        crn,
        pageUrlSlug: 'create-recommendation-warning',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )
  })

  it('fires an audit event', async () => {
    jest.spyOn(AuditService.prototype, 'recommendationView')
    await getCreateRecommendationWarning(req, res)
    expect(AuditService.prototype.recommendationView).toHaveBeenCalledWith({
      crn,
      pageUrlSlug: 'create-recommendation-warning',
      username: 'Bill',
      logErrors: false,
    })
  })
})
