import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { currentHighestRosh } from './checkBookingDetailsController'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, statuses } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse

  const offence = recommendationResponse.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  const sentToPpcs = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.SENT_TO_PPCS)

  const recallReceived = recommendation.bookRecallToPpud?.receivedDateTime ?? sentToPpcs?.created

  const acoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.ACO_SIGNED)

  const poRecallConsultSpo = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.PO_RECALL_CONSULT_SPO)

  res.locals = {
    ...res.locals,
    page: {
      id: 'bookingSummary',
    },
    offence,
    currentHighestRosh: currentHighestRosh(recommendation.currentRoshForPartA),
    practitioner: recommendation.practitionerForPartA
      ? recommendation.practitionerForPartA
      : recommendation.whoCompletedPartA,
    acoSigned,
    poRecallConsultSpo,
    recallReceived,
  }

  res.render(`pages/recommendations/bookingSummary`)
  next()
}

export default { get }
