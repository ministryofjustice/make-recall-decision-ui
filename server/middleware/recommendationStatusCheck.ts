import { RequestHandler, Router } from 'express'
import { getStatuses } from '../data/makeDecisionApiClient'
import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'

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
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
}

const router = Router()

export function setupRecommendationStatusCheck(): Router {
  router.get('/inappropriate-error', (req, res) => {
    return res.render('inappropriateError')
  })

  return router
}

export type StatusCheck = (statuses: RecommendationStatusResponse[], roles: string[]) => boolean

export function statusIsActive(name: string): StatusCheck {
  return (statuses: RecommendationStatusResponse[], _: string[]) => {
    return !!statuses.find(status => status.name === name && status.active)
  }
}

export function roleIsActive(name: string): StatusCheck {
  return (_: RecommendationStatusResponse[], roles: string[]) => {
    return !!roles.find(role => role === name)
  }
}

export function not(statusCheck: StatusCheck): StatusCheck {
  return (statuses: RecommendationStatusResponse[], roles: string[]) => {
    return !statusCheck(statuses, roles)
  }
}

export function or(...statusChecks: StatusCheck[]): StatusCheck {
  return (statuses: RecommendationStatusResponse[], roles: string[]) => {
    return statusChecks.some(check => check(statuses, roles))
  }
}

export function and(...statusChecks: StatusCheck[]): StatusCheck {
  return (statuses: RecommendationStatusResponse[], roles: string[]) => {
    return statusChecks.every(check => check(statuses, roles))
  }
}

export default function recommendationStatusCheck(statusCheck?: StatusCheck): RequestHandler {
  return async (req, res, next) => {
    const { recommendationId } = req.params
    const {
      user: { token, roles },
    } = res.locals

    if (statusCheck) {
      const statuses = await getStatuses({
        recommendationId,
        token,
      })
      res.locals.statuses = statuses
      if (!statusCheck(statuses, roles)) {
        return res.redirect('/inappropriate-error')
      }
    }
    next()
  }
}
