import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import bookedToPpudFailController from './bookedToPpudFailController'
import config from '../../config'
import StageEnum from '../../booking/StageEnum'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('loads the page for a data error', async () => {
    const recommendation = {
      bookingMemento: {
        stage: StageEnum.POSTING_RECALL_DATA,
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
    expect(res.locals.isUploadDocsError).toBe(false)
    expect(res.locals.isMinutesError).toBe(false)
    expect(res.locals.uploadFailedDocName).toBe('licence.pdf')
    expect(res.locals.ppudUrl).toBe(config.ppud)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudFail')
    expect(next).toHaveBeenCalled()
  })

  it('loads the page for a documents upload error', async () => {
    const recommendation = {
      bookingMemento: {
        stage: StageEnum.UPLOADING_DOCUMENTS,
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
    expect(res.locals.isUploadDocsError).toBe(true)
    expect(res.locals.isMinutesError).toBe(false)
    expect(res.locals.uploadFailedDocName).toBe('partA.docx')
    expect(res.locals.ppudUrl).toBe(config.ppud)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudFail')
    expect(next).toHaveBeenCalled()
  })

  it('loads the page for a minutes error', async () => {
    const recommendation = {
      bookingMemento: {
        stage: StageEnum.BOOKING_MINUTE,
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
    expect(res.locals.isUploadDocsError).toBe(false)
    expect(res.locals.isMinutesError).toBe(true)
    expect(res.locals.uploadFailedDocName).toBeUndefined()
    expect(res.locals.ppudUrl).toBe(config.ppud)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudFail')
    expect(next).toHaveBeenCalled()
  })
})
