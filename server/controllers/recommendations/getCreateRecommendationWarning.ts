import { Request, Response } from 'express'
import { isPreprodOrProd, validateCrn } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { AuditService } from '../../services/auditService'

const auditService = new AuditService()

export const getCreateRecommendationWarning = async (req: Request, res: Response): Promise<void> => {
  const { crn } = req.params
  const {
    env,
    user: { username, region },
    flags,
  } = res.locals
  const normalizedCrn = validateCrn(crn)
  const pageUrlSlug = 'create-recommendation-warning'
  res.locals.crn = normalizedCrn
  res.render('pages/createRecommendationWarning')
  appInsightsEvent(
    EVENTS.MRD_RECOMMENDATION_PAGE_VIEW,
    username,
    {
      crn,
      pageUrlSlug,
      region,
    },
    flags
  )
  auditService.recommendationView({
    crn: normalizedCrn,
    pageUrlSlug,
    username,
    logErrors: isPreprodOrProd(env) && process.env.NODE_ENV !== 'test',
  })
}
