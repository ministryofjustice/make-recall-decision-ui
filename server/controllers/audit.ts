import { NextFunction, Request, Response } from 'express'
import { appInsightsEvent } from '../monitoring/azureAppInsights'
import { EVENTS } from '../utils/constants'
import { isPreprodOrProd } from '../utils/utils'
import { AuditService } from '../services/auditService'

const auditService = new AuditService()

export default function audit(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { username, region },
    flags: featureFlags,
  } = res.locals
  const pageUrlSlug = req.path.substring(req.path.lastIndexOf('/') + 1)
  appInsightsEvent(
    EVENTS.MRD_RECOMMENDATION_PAGE_VIEW,
    username,
    {
      crn: res.locals.recommendation.crn,
      recommendationId,
      region,
      pageUrlSlug: pageUrlSlug.trim().length === 0 ? '<root>' : pageUrlSlug,
    },
    featureFlags
  )
  auditService.recommendationView({
    crn: res.locals.recommendation.crn,
    recommendationId,
    pageUrlSlug,
    username,
    logErrors: isPreprodOrProd(res.locals.env) && process.env.NODE_ENV !== 'test',
  })
}
