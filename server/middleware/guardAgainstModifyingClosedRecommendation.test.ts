import { mockNext, mockReq, mockRes } from './testutils/mockRequestUtils'
import { guardAgainstModifyingClosedRecommendation } from './guardAgainstModifyingClosedRecommendation'

describe('guardAgainstModifyingClosedRecommendation', () => {
  it('let through any normal request', () => {
    const res = mockRes({
      locals: {
        recommendation: {
          status: 'DRAFT',
        },
      },
    })
    const next = mockNext()
    guardAgainstModifyingClosedRecommendation(mockReq(), res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('redirect against a closed recommendation', () => {
    const res = mockRes({
      locals: {
        recommendation: {
          status: 'DOCUMENT_DOWNLOADED',
          crn: '123',
        },
      },
    })
    const next = mockNext()
    guardAgainstModifyingClosedRecommendation(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/cases/123/overview')
    expect(next).toHaveBeenCalled()
  })

  it('allows access to confirmation-part-a', () => {
    const res = mockRes({
      locals: {
        recommendation: {
          status: 'DOCUMENT_DOWNLOADED',
          crn: '123',
        },
        urlInfo: { currentPageId: 'confirmation-part-a' },
      },
    })
    const next = mockNext()
    guardAgainstModifyingClosedRecommendation(mockReq(), res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('allows access to confirmation-no-recall', () => {
    const res = mockRes({
      locals: {
        recommendation: {
          status: 'DOCUMENT_DOWNLOADED',
          crn: '123',
        },
        urlInfo: { currentPageId: 'confirmation-part-a' },
      },
    })
    const next = mockNext()
    guardAgainstModifyingClosedRecommendation(mockReq(), res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
