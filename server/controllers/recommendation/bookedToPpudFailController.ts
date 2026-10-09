import { NextFunction, Request, Response } from 'express'
import config from '../../config'
import StageEnum from '../../booking/StageEnum'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  const stage = recommendation.bookingMemento?.stage
  const hasMinute = !!recommendation.bookRecallToPpud?.minute

  const isDataError =
    stage === StageEnum.STARTED ||
    stage === StageEnum.OFFENDER_BOOKED ||
    stage === StageEnum.SENTENCE_BOOKED ||
    stage === StageEnum.OFFENCE_BOOKED ||
    stage === StageEnum.RELEASE_BOOKED

  const isMinutesError = stage === StageEnum.RECALL_BOOKED && hasMinute

  const isUploadDocsError = stage === StageEnum.MINUTE_BOOKED || (stage === StageEnum.RECALL_BOOKED && !hasMinute)

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
