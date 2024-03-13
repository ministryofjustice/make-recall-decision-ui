import { NextFunction, Request, Response } from 'express'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isMandatoryTextValue } from '../../utils/utils'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: { id: 'apWhyNoRecall' },
    inputDisplayValues: {
      errors: res.locals.errors,
      spoNoRecallRationale: res.locals.errors?.spoNoRecallRationale ? '' : recommendation.spoRecallRationale,
      odmName: recommendation.odmName,
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
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      spoRecallRationale: spoNoRecallRationale,
      explainTheDecision: true,
      odmName,
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'ap-record-decision', urlInfo }))
}

export default { get, post }
