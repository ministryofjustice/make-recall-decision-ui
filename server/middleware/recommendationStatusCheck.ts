import { RequestHandler, Router } from 'express'
import { getStatuses } from '../data/makeDecisionApiClient'

export enum STATUSES {
  SPO_CONSIDER_RECALL = 'SPO_CONSIDER_RECALL',
  SPO_CONSIDERING_RECALL = 'SPO_CONSIDERING_RECALL',
  PO_RECALL_CONSULT_SPO = 'PO_RECALL_CONSULT_SPO',
}
const router = Router()

export function setupRecommendationStatusCheck(): Router {
  router.get('/inappropriate-error', (req, res) => {
    return res.render('inappropriateError')
  })

  return router
}

export default function recommendationStatusCheck(required: string[] = []): RequestHandler {
  return async (req, res, next) => {
    const { recommendationId } = req.params
    const {
      user: { token },
    } = res.locals

    if (required.length > 0) {
      const statuses = await getStatuses({
        recommendationId,
        token,
      })

      let haveStatus = false

      required.forEach(requiredStatus => {
        const have = statuses.find(status => status.name === requiredStatus)
        if (have && have.active) {
          haveStatus = true
        }
      })

      if (!haveStatus) {
        return res.redirect('/inappropriate-error')
      }
    }
    next()
  }
}
