import { NextFunction, Request, Response } from 'express'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { validateRecallType } from '../recommendations/recallType/formValidator'
import { inputDisplayValuesRecallType } from '../recommendations/recallType/inputDisplayValues'
import { isEmptyStringOrWhitespace, normalizeCrn } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { availableRecallTypes } from '../recommendations/recallType/availableRecallTypes'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { isFixedTermRecallMandatoryForRecommendation } from '../../utils/fixedTermRecallUtils'

function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals as {
    recommendation: RecommendationResponse
  }

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
    availableRecallTypes: availableRecallTypes(recommendation),
    personOnProbationName: recommendation.personOnProbation.fullName,
    ftrMandatory: isFixedTermRecallMandatoryForRecommendation(recommendation),
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

  const nextPageId = recallType === 'NO_RECALL' ? 'task-list-no-recall' : 'emergency-recall'

  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
