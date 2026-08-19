import { NextFunction, Request, Response } from 'express'
import config from '../../config'
import StageEnum from '../../booking/StageEnum'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  const isDataError = recommendation.bookingMemento?.stage === StageEnum.POSTING_RECALL_DATA
  const isUploadDocsError = recommendation.bookingMemento?.stage === StageEnum.UPLOADING_DOCUMENTS
  const isMinutesError = recommendation.bookingMemento?.stage === StageEnum.BOOKING_MINUTE

  res.locals = {
    ...res.locals,
    page: {
      id: 'bookedToPpudFail',
    },
    recommendation,
    isDataError,
    isUploadDocsError,
    isMinutesError,
    uploadFailedDocName: recommendation.bookingMemento?.uploadFailedDocName,
    ppudUrl: config.ppud,
  }

  res.render('pages/recommendations/bookedToPpudFail')
  next()
}

export default {
  get,
}
