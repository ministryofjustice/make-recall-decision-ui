import audit from './audit'
import { appInsightsEvent } from '../monitoring/azureAppInsights'
import { mockReq, mockRes } from '../middleware/testutils/mockRequestUtils'
import { EVENTS } from '../utils/constants'
import { AuditService } from '../services/auditService'

jest.mock('../monitoring/azureAppInsights')
jest.spyOn(AuditService.prototype, 'recommendationView')

describe('audit', () => {
  it('emit audit message', async () => {
    const next = jest.fn()

    audit(
      mockReq({
        params: {
          recommendationId: '123',
          pageUrlSlug: 'whatever',
        },
      }),
      mockRes({
        locals: {
          user: { username: 'tommy' },
          recommendation: { crn: 'abc' },
        },
      }),
      next
    )

    expect(appInsightsEvent).toHaveBeenCalledWith(
      EVENTS.MRD_RECOMMENDATION_PAGE_VIEW,
      'tommy',
      {
        crn: 'abc',
        pageUrlSlug: 'whatever',
        recommendationId: '123',
      },
      {}
    )

    expect(AuditService.prototype.recommendationView).toHaveBeenCalledWith({
      crn: 'abc',
      recommendationId: '123',
      pageUrlSlug: 'whatever',
      username: 'tommy',
      logErrors: false,
    })

    expect(next).not.toHaveBeenCalled()
  })
})
