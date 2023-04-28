import recommendationStatusCheck, { statusIsActive } from './recommendationStatusCheck'
import { mockNext, mockReq, mockRes } from './testutils/mockRequestUtils'
import { getStatuses } from '../data/makeDecisionApiClient'

jest.mock('../data/makeDecisionApiClient')

describe('recommendationStatusCheck', () => {
  it('should allow as status is present and active', async () => {
    const res = mockRes({})
    const next = mockNext()

    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: 'XYZ',
        active: true,
      },
    ])

    await recommendationStatusCheck(statusIsActive('XYZ'))(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
    expect(res.locals.statuses).toEqual([
      {
        name: 'XYZ',
        active: true,
      },
    ])
  })

  it('should redirect as status is missing', async () => {
    const res = mockRes({})
    const next = mockNext()

    ;(getStatuses as jest.Mock).mockResolvedValue([])

    await recommendationStatusCheck(statusIsActive('XYZ'))(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(res.redirect).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should redirect as status is inactive', async () => {
    const res = mockRes({})
    const next = mockNext()

    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: 'XYZ',
        active: false,
      },
    ])

    await recommendationStatusCheck(statusIsActive('XYZ'))(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(res.redirect).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should allow all', async () => {
    const res = mockRes({})
    const next = mockNext()

    await recommendationStatusCheck()(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(getStatuses).not.toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
