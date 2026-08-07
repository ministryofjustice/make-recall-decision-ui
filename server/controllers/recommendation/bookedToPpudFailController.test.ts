import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation } from '../../data/makeDecisionApiClient'
import bookedToPpudFailController from './bookedToPpudFailController'
import BookingErrorType from '../../booking/BookingErrorType'
import config from '../../config'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('loads the page for a data error', async () => {
    const recommendation = {
      bookingMemento: {
        errorType: BookingErrorType.DATA,
        uploadFailedDocName: 'licence.pdf',
      },
    }

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        user: {
          token: 'token',
        },
      },
    })

    const next = mockNext()

    await bookedToPpudFailController.get(req, res, next)

    expect(getRecommendation).toHaveBeenCalledWith('1', 'token')

    expect(res.locals.page).toEqual({
      id: 'bookedToPpudFail',
    })
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.isDataError).toBe(true)
    expect(res.locals.errorType).toBe(BookingErrorType.DATA)
    expect(res.locals.uploadFailedDocName).toBe('licence.pdf')
    expect(res.locals.ppudUrl).toBe(config.ppud)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudFail')
    expect(next).toHaveBeenCalled()
  })

  it('loads the page for a documents error', async () => {
    const recommendation = {
      bookingMemento: {
        errorType: BookingErrorType.DOCUMENTS,
        uploadFailedDocName: 'partA.docx',
      },
    }

    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)

    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        user: {
          token: 'token',
        },
      },
    })

    const next = mockNext()

    await bookedToPpudFailController.get(req, res, next)

    expect(res.locals.page).toEqual({
      id: 'bookedToPpudFail',
    })
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.isDataError).toBe(false)
    expect(res.locals.errorType).toBe(BookingErrorType.DOCUMENTS)
    expect(res.locals.uploadFailedDocName).toBe('partA.docx')
    expect(res.locals.ppudUrl).toBe(config.ppud)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudFail')
    expect(next).toHaveBeenCalled()
  })
})
