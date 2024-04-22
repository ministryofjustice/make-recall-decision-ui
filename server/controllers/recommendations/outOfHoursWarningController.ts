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

  const isOutOfHoursWorker =
    user.roles.includes('ROLE_MARD_RESIDENT_WORKER') || user.roles.includes('ROLE_MARD_DUTY_MANAGER')

  if (!isOutOfHoursWorker) {
    return res.redirect('/inappropriate-error')
  }

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

    const activate = []

    const isBookedToPpud = statuses.find(status => status.name === STATUSES.BOOKED_TO_PPUD)
    const isApRationaleCollected = statuses.find(status => status.name === STATUSES.AP_COLLECTED_RATIONALE)

    if (isBookedToPpud) {
      // spo rationale has not been supplied, we auto close.
      activate.push(STATUSES.REC_CLOSED)
      // a new recommendation document will be created when the user clicks the button at the bottom of this page.
    } else if (!isApRationaleCollected) {
      // clear the spo recall rationale.
      await updateRecommendation({
        recommendationId: String(recommendationId),
        valuesToSave: {
          spoRecallRationale: '',
        },
        token: user.token,
        featureFlags: flags,
      })
    }

    if (activate.length > 0) {
      await updateStatuses({
        recommendationId: String(recommendationId),
        token: user.token,
        activate: [],
        deActivate: [],
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
      res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/ap-licence-conditions`)
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

  res.redirect(303, `${routeUrls.recommendations}/${recommendation.id}/ap-licence-conditions`)

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
