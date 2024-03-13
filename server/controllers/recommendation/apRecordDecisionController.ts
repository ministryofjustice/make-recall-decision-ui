import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { hasValue } from '../../utils/utils'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation, user } = res.locals

  let id: string
  let bodyText: string

  const isResidentWorker: boolean = user.roles.some((role: string) => role === 'ROLE_MARD_RESIDENT_WORKER')

  if (recommendation.spoRecallType === 'RECALL') {
    id = 'apRecordDecision'
    bodyText =
      'This will be recorded as a contact in NDelius called ‘Management oversight - recall’. You cannot undo this.'
  } else {
    id = 'apRecordDecisionDNTR'
    bodyText =
      'The decision will be recorded as a contact in NDelius called ‘Management oversight - no recall with the outcome ‘decision to not recall’. You cannot undo this.'
  }

  res.locals = {
    ...res.locals,
    page: {
      id,
      bodyText,
    },
    spoRecallRationale: recommendation.spoRecallRationale,
    isResidentWorker,
    odmName: recommendation.odmName,
    inputDisplayValues: {
      errors: res.locals.errors,
    },
  }
  res.render(`pages/recommendations/apRecordDecision`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { crn, sensitive } = req.body

  const {
    flags,
    user: { username, token, region },
    urlInfo,
  } = res.locals

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse
  let event: string
  let statuses: string[]

  if (recommendation.spoRecallType === 'RECALL') {
    event = EVENTS.MRD_SPO_RATIONALE_SENT
    statuses = [STATUSES.AP_RECORDED_RATIONALE]
  } else {
    event = EVENTS.MRD_SPO_RATIONALE_SENT
    statuses = [STATUSES.AP_RECORDED_RATIONALE]
  }

  const valuesToSave = {
    sensitive: !!sensitive,
    sendSpoRationaleToDelius: true,
  } as Record<string, boolean>

  const recallType = recommendation?.recallType?.selected?.value
  if (recommendation.spoRecallType === 'RECALL' && hasValue(recallType) && recallType === 'NO_RECALL') {
    valuesToSave.recallType = null
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  appInsightsEvent(event, username, { crn, recommendationId, region }, flags)

  await updateStatuses({
    recommendationId,
    token,
    activate: statuses,
    deActivate: [],
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'ap-rationale-confirmation', urlInfo }))
}

export default { get, post }
