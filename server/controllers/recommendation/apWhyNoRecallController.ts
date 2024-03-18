import { NextFunction, Request, Response } from 'express'
import { strings } from '../../textStrings/en'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isMandatoryTextValue, stripHtmlTags } from '../../utils/utils'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  let spoNoRecallRationale
  let odmName
  if (res.locals.errors) {
    spoNoRecallRationale = res.locals.unsavedValues.spoNoRecallRationale
    odmName = res.locals.unsavedValues.odmName
  } else {
    spoNoRecallRationale = recommendation.spoRecallRationale
    odmName = recommendation.odmName
  }

  res.locals = {
    ...res.locals,
    page: { id: 'apWhyNoRecall' },
    inputDisplayValues: {
      errors: res.locals.errors,
      spoNoRecallRationale,
      odmName,
    },
  }

  res.render(`pages/recommendations/apWhyNoRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { spoNoRecallRationale, odmName } = req.body

  const {
    flags,
    user: { token, hasOdmRole },
    urlInfo,
    statuses,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(spoNoRecallRationale)) {
    const errorId = 'missingSpoNoRecallRationale'
    errors.push(
      makeErrorObject({
        id: 'spoNoRecallRationale',
        text: strings.errors[errorId],
        errorId,
      })
    )
  } else if (!isMandatoryTextValue(odmName) && !hasOdmRole) {
    const errorId = 'missingOdmName'
    errors.push(
      makeErrorObject({
        id: 'odmName',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      spoNoRecallRationale,
      odmName,
    }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      // strip html tags on this value as it is written to delius and it's just possible that they are not hardened to XSS.
      spoRecallRationale: stripHtmlTags(spoNoRecallRationale),
      explainTheDecision: true,
      odmName,
    },
    token,
    featureFlags: flags,
  })

  if (!(statuses as RecommendationStatusResponse[]).find(s => s.name === STATUSES.AP_COLLECTED_RATIONALE && s.active)) {
    await updateStatuses({
      recommendationId: String(recommendationId),
      token,
      activate: [STATUSES.AP_COLLECTED_RATIONALE],
      deActivate: [],
    })
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'ap-record-decision', urlInfo }))
}

export default { get, post }
