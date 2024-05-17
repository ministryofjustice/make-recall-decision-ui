import { NextFunction, Request, Response } from 'express'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { validateRecallType } from '../recommendations/recallType/formValidator'
import { inputDisplayValuesRecallType } from '../recommendations/recallType/inputDisplayValues'
import { isEmptyStringOrWhitespace, normalizeCrn } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  // TODO: remove when MRD-2501 is complete. This is to allow testing MRD-2502 in solation
  const f = req.query.f as string | undefined

  if (f) {
    switch (f.toLowerCase()) {
      case 'no':
        recommendation.isUnder18 = false
        recommendation.isSentence12MonthsOrOver = false
        recommendation.isMappaLevelAbove1 = false
        recommendation.hasBeenConvictedOfSeriousOffence = false
        break
      case 'yes':
        recommendation.isUnder18 = true
        recommendation.isSentence12MonthsOrOver = true
        recommendation.isMappaLevelAbove1 = true
        recommendation.hasBeenConvictedOfSeriousOffence = true
        break
      case 'mixed':
        recommendation.isUnder18 = false
        recommendation.isSentence12MonthsOrOver = true
        recommendation.isMappaLevelAbove1 = true
        recommendation.hasBeenConvictedOfSeriousOffence = false
        break
      default:
        break
    }
  }
  // TODO: remove above block when 2501 is completed

  res.locals = {
    ...res.locals,
    page: {
      id: 'recallType',
    },
    inputDisplayValues: inputDisplayValuesRecallType({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
  }

  res.render(`pages/recommendations/recallType`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { recallType } = req.body
  const {
    flags,
    user: { token, username, region },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues, monitoringEvent } = await validateRecallType({
    requestBody: req.body,
    recommendationId,
    urlInfo,
    token,
  })

  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }

  if (recallType === 'NO_RECALL') {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.NO_RECALL_DECIDED],
      deActivate: [STATUSES.RECALL_DECIDED],
    })
  } else {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.RECALL_DECIDED],
      deActivate: [STATUSES.NO_RECALL_DECIDED],
    })
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  const nextPageId = recallType === 'NO_RECALL' ? 'task-list-no-recall' : 'emergency-recall'

  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))

  const crn = normalizeCrn(req.body.crn)
  if (!isEmptyStringOrWhitespace(crn)) {
    appInsightsEvent(
      monitoringEvent.eventName,
      username,
      {
        ...monitoringEvent.data,
        crn,
        recommendationId,
        region,
      },
      flags
    )
  }
}

export default { get, post }
