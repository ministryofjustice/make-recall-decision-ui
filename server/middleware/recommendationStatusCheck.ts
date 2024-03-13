import { RequestHandler, Router } from 'express'
import { Check } from './check'

export enum STATUSES {
  SPO_CONSIDER_RECALL = 'SPO_CONSIDER_RECALL',
  SPO_RECORDED_RATIONALE = 'SPO_RECORDED_RATIONALE',
  PO_RECALL_CONSULT_SPO = 'PO_RECALL_CONSULT_SPO',
  SPO_SIGNATURE_REQUESTED = 'SPO_SIGNATURE_REQUESTED',
  SPO_SIGNED = 'SPO_SIGNED',
  ACO_SIGNATURE_REQUESTED = 'ACO_SIGNATURE_REQUESTED',
  ACO_SIGNED = 'ACO_SIGNED',
  RECALL_DECIDED = 'RECALL_DECIDED',
  NO_RECALL_DECIDED = 'NO_RECALL_DECIDED',
  DELETED = 'DELETED',
  PP_DOCUMENT_CREATED = 'PP_DOCUMENT_CREATED',
  SENT_TO_PPCS = 'SENT_TO_PPCS',
  BOOKED_TO_PPUD = 'BOOKED_TO_PPUD',
  BOOKING_ON_STARTED = 'BOOKING_ON_STARTED',
  REC_CLOSED = 'REC_CLOSED',
  PO_START_RECALL = 'PO_START_RECALL',
  REC_DELETED = 'REC_DELETED',
  AP_RECORDED_RATIONALE = 'AP_RECORDED_RATIONALE',
  AP_COLLECTED_RATIONALE = 'AP_COLLECTED_RATIONALE',
}

const router = Router()

export function setupRecommendationStatusCheck(): Router {
  router.get('/inappropriate-error', (req, res) => {
    return res.render('inappropriateError')
  })

  return router
}

export default function recommendationStatusCheck(statusCheck?: Check): RequestHandler {
  return (req, res, next) => {
    if (statusCheck && !statusCheck(res.locals)) {
      return res.redirect('/inappropriate-error')
    }
    next()
  }
}
