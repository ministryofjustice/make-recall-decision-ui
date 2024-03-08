import { NextFunction, Request, Response } from 'express'
import { validateCrn } from '../../utils/utils'

import {
  createRecommendation,
  getStatuses,
  updateRecommendation,
  updateStatuses,
} from '../../data/makeDecisionApiClient'
import { routeUrls } from '../../routes/routeUrls'
import { getCaseSection } from '../caseSummary/getCaseSection'
import { CaseSectionId } from '../../@types/pagesForms'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

async function get(req: Request, res: Response, next: NextFunction) {
  const { crn } = req.params
  const normalizedCrn = validateCrn(crn)

  const { user, flags } = res.locals
  const caseSection = await getCaseSection(
    'overview' as CaseSectionId,
    normalizedCrn,
    user.token,
    user.userId,
    req.query,
    flags
  )

  const recommendationId = caseSection.caseSummary.activeRecommendation?.recommendationId
  if (recommendationId) {
    const statuses = (
      await getStatuses({
        recommendationId: String(recommendationId),
        token: user.token,
      })
    ).filter(status => status.active)

    // MRD-2357 - if an in-flight recommendation exists then clear the spoRecallRationale
    if (
      (user.roles.includes('ROLE_MARD_RESIDENT_WORKER') || user.roles.includes('MARD_DUTY_MANAGER_USER')) &&
      statuses.find(
        status => status.name === STATUSES.SPO_CONSIDER_RECALL || status.name === STATUSES.SPO_RECORDED_RATIONALE
      )
    ) {
      await updateRecommendation({
        recommendationId: String(recommendationId),
        valuesToSave: {
          spoRecallRationale: '',
        },
        token: user.token,
        featureFlags: flags,
      })
    }
  }
  res.locals = {
    ...res.locals,
    crn,
    page: {
      id: 'outOfHoursWarning',
    },
  }

  res.render(`pages/outOfHoursWarning`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const normalizedCrn = validateCrn(req.body.crn)

  const { user, flags } = res.locals

  const caseSection = await getCaseSection(
    'overview' as CaseSectionId,
    normalizedCrn,
    user.token,
    user.userId,
    req.query,
    flags
  )

  const recommendationId = caseSection.caseSummary.activeRecommendation?.recommendationId
  if (recommendationId) {
    const statuses = (
      await getStatuses({
        recommendationId: String(recommendationId),
        token: user.token,
      })
    ).filter(status => status.active)

    const isPPDocumentCreated = statuses.find(status => status.name === STATUSES.PP_DOCUMENT_CREATED)
    if (!isPPDocumentCreated) {
      res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/licence-conditions-ap`)
      return
    }
  }

  const recommendation = await createRecommendation({ crn: normalizedCrn }, user.token, flags)
  await updateStatuses({
    recommendationId: String(recommendation.id),
    token: user.token,
    activate: [STATUSES.PO_START_RECALL],
    deActivate: [],
  })

  res.redirect(303, `${routeUrls.recommendations}/${recommendation.id}/licence-conditions-ap`)

  appInsightsEvent(
    EVENTS.MRD_RECOMMENDATION_STARTED,
    res.locals.user.username,
    {
      crn: normalizedCrn,
      recommendationId: recommendation.id.toString(),
      region: user.region,
    },
    flags
  )
}

export default { get, post }
