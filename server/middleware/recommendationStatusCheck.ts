import { RequestHandler, Router } from 'express'
import { getStatuses } from '../data/makeDecisionApiClient'
import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'

export enum STATUSES {
  SPO_CONSIDER_RECALL = 'SPO_CONSIDER_RECALL',
  SPO_CONSIDERING_RECALL = 'SPO_CONSIDERING_RECALL',
  PO_RECALL_CONSULT_SPO = 'PO_RECALL_CONSULT_SPO',
  SPO_SIGNATURE_REQUESTED = 'SPO_SIGNATURE_REQUESTED',
  SPO_SIGNED = 'SPO_SIGNED',
  ACO_SIGNATURE_REQUESTED = 'ACO_SIGNATURE_REQUESTED',
  ACO_SIGNED = 'ACO_SIGNED',
}

const router = Router()

export function setupRecommendationStatusCheck(): Router {
  router.get('/inappropriate-error', (req, res) => {
    return res.render('inappropriateError')
  })

  return router
}

export type StatusCheck = (statuses: RecommendationStatusResponse[]) => boolean

export function statusIsActive(name: string): StatusCheck {
  return (statuses: RecommendationStatusResponse[]) => {
    return !!statuses.find(status => status.name === name && status.active)
  }
}

export function not(statusCheck: StatusCheck): StatusCheck {
  return (statuses: RecommendationStatusResponse[]) => {
    return !statusCheck(statuses)
  }
}

export function or(...statusChecks: StatusCheck[]): StatusCheck {
  return (statuses: RecommendationStatusResponse[]) => {
    return statusChecks.some(check => check(statuses))
  }
}

export function and(...statusChecks: StatusCheck[]): StatusCheck {
  return (statuses: RecommendationStatusResponse[]) => {
    return statusChecks.every(check => check(statuses))
  }
}

export default function recommendationStatusCheck(statusCheck?: StatusCheck): RequestHandler {
  return async (req, res, next) => {
    const { recommendationId } = req.params
    const {
      user: { token },
    } = res.locals

    if (statusCheck) {
      const statuses = await getStatuses({
        recommendationId,
        token,
      })
      res.locals.statuses = statuses
      if (!statusCheck(statuses)) {
        return res.redirect('/inappropriate-error')
      }
    }
    next()
  }
}
