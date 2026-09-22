import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import bookedToPpudFailController from './bookedToPpudFailController'
import config from '../../config'
import StageEnum from '../../booking/StageEnum'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  const stages = [
    {
      stage: StageEnum.STARTED,
      hasMinute: false,
      isDataError: true,
      isUploadDocsError: false,
      isMinutesError: false,
    },
    {
      stage: StageEnum.OFFENDER_BOOKED,
      hasMinute: false,
      isDataError: true,
      isUploadDocsError: false,
      isMinutesError: false,
    },
    {
      stage: StageEnum.SENTENCE_BOOKED,
      hasMinute: false,
      isDataError: true,
      isUploadDocsError: false,
      isMinutesError: false,
    },
    {
      stage: StageEnum.OFFENCE_BOOKED,
      hasMinute: false,
      isDataError: true,
      isUploadDocsError: false,
      isMinutesError: false,
    },
    {
      stage: StageEnum.RELEASE_BOOKED,
      hasMinute: false,
      isDataError: true,
      isUploadDocsError: false,
      isMinutesError: false,
    },
    {
      stage: StageEnum.RECALL_BOOKED,
      hasMinute: true,
      isDataError: false,
      isUploadDocsError: false,
      isMinutesError: true,
    },
    {
      stage: StageEnum.RECALL_BOOKED,
      hasMinute: false,
      isDataError: false,
      isUploadDocsError: true,
      isMinutesError: false,
    },
    {
      stage: StageEnum.MINUTE_BOOKED,
      hasMinute: true,
      isDataError: false,
      isUploadDocsError: true,
      isMinutesError: false,
    },
  ]

  it.each(stages)(
    'loads the page correctly for $stage with minute present: $hasMinute',
    async ({ stage, hasMinute, isDataError, isUploadDocsError, isMinutesError }) => {
      const recommendation = {
        bookingMemento: {
          stage,
          uploadFailedDocName: 'failed-document.pdf',
        },
        ...(hasMinute
          ? {
              bookRecallToPpud: {
                minute: 'Background information',
              },
            }
          : {}),
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
      expect(res.locals.isDataError).toBe(isDataError)
      expect(res.locals.isUploadDocsError).toBe(isUploadDocsError)
      expect(res.locals.isMinutesError).toBe(isMinutesError)
      expect(res.locals.uploadFailedDocName).toBe('failed-document.pdf')
      expect(res.locals.ppudUrl).toBe(config.ppud)

      expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpudFail')
      expect(next).toHaveBeenCalled()
    },
  )
})
