import { NextFunction, Request, Response } from 'express'
import BookingErrorType from '../../booking/BookingErrorType'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  const isDataError = recommendation.bookingMemento?.errorType === BookingErrorType.DATA

  res.locals = {
    ...res.locals,
    page: {
      id: 'bookedToPpudFail',
    },
    recommendation,
    isDataError,
    errorType: recommendation.bookingMemento?.errorType,
    uploadFailedDocName: recommendation.bookingMemento?.uploadFailedDocName,
    ppudUrl: config.ppud,
  }

  res.render('pages/recommendations/bookedToPpudFail')
  next()
}

export default {
  get,
}
