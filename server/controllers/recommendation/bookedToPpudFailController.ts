import { NextFunction, Request, Response } from 'express'
import { getRecommendation } from '../../data/makeDecisionApiClient'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import BookingErrorType from '../../booking/BookingErrorType'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
  } = res.locals

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse
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
