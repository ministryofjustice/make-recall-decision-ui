import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import replaceCurrentRecommendationController from './replaceCurrentRecommendationController'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('replaceCurrentRecommendation', () => {
  it('closes the status of the current recommendation id', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.PP_DOCUMENT_CREATED, active: true }])
    const req = mockReq({
      params: { recommendationId: '123', crn: 'AB1234C' },
    })
    const res = mockRes({
      token: 'token',
    })
    await replaceCurrentRecommendationController.get(req, res)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      activate: [STATUSES.REC_CLOSED],
      deActivate: [],
    })

    expect(res.redirect).toHaveBeenCalled()
  })
  it('closes the status of the current recommendation id when DNTR', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      { name: STATUSES.PP_DOCUMENT_CREATED, active: true },
      { name: STATUSES.NO_RECALL_DECIDED, active: true },
    ])
    const req = mockReq({
      params: { recommendationId: '123', crn: 'AB1234C' },
    })
    const res = mockRes({
      token: 'token',
    })
    await replaceCurrentRecommendationController.get(req, res)

    expect(updateStatuses).not.toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      activate: [STATUSES.SENT_TO_PPCS],
      deActivate: [],
    })

    expect(res.redirect).toHaveBeenCalled()
  })
  it('do not close the status of the current recommendation id', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.PP_DOCUMENT_CREATED, active: false }])
    const req = mockReq({
      params: { recommendationId: '123', crn: 'AB1234C' },
    })
    const res = mockRes({
      token: 'token',
    })
    await replaceCurrentRecommendationController.get(req, res)

    expect(updateStatuses).not.toHaveBeenCalledWith()

    expect(res.redirect).toHaveBeenCalled()
  })
  it('do not close the current recommendation id', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      { name: STATUSES.SENT_TO_PPCS, active: true },
      { name: STATUSES.PP_DOCUMENT_CREATED, active: true },
    ])
    const req = mockReq({
      params: { recommendationId: '123', crn: 'AB1234C' },
    })
    const res = mockRes({
      token: 'token',
    })
    await replaceCurrentRecommendationController.get(req, res)

    expect(updateStatuses).not.toHaveBeenCalledWith()

    expect(res.redirect).toHaveBeenCalled()
  })
  it('do not close the current recommendation id when DNTR', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      { name: STATUSES.REC_CLOSED, active: true },
      { name: STATUSES.PP_DOCUMENT_CREATED, active: true },
    ])
    const req = mockReq({
      params: { recommendationId: '123', crn: 'AB1234C' },
    })
    const res = mockRes({
      token: 'token',
    })
    await replaceCurrentRecommendationController.get(req, res)

    expect(updateStatuses).not.toHaveBeenCalledWith()

    expect(res.redirect).toHaveBeenCalled()
  })
})
