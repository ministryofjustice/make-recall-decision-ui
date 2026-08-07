import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
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

    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    const next = mockNext()

    await bookedToPpudFailController.get(req, res, next)

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

    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        recommendation,
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
