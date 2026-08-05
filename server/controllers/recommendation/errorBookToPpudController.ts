import { NextFunction, Request, Response } from 'express'
import { getRecommendation } from '../../data/makeDecisionApiClient'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import BookingErrorType from '../../booking/BookingErrorType'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
  } = res.locals

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse

  const errorBookToPpud = BookingErrorType.DOCUMENTS // recommendation.bookingMemento?.errorType

  const isDocumentError = errorBookToPpud === BookingErrorType.DOCUMENTS

  res.locals = {
    ...res.locals,
    page: {
      id: 'errorBookToPpud',
    },
    recommendation,
    isDocumentError,
    isDataError: !isDocumentError,
  }

  res.render('pages/recommendations/errorBookToPpud')
  next()
}

export default {
  get,
}
