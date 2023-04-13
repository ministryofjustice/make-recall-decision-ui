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
    backLink: 'spo-task-list-consider-recall',
    page: {
      id: 'spoRecallRationale',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      spoRecallType: res.locals.errors?.spoRecallType ? '' : recommendation.spoRecallType,
      spoRecallRationale:
        res.locals.errors?.spoRecallRationale || recommendation.spoRecallType !== 'RECALL'
          ? ''
          : recommendation.spoRecallRationale,
      spoNoRecallRationale:
        res.locals.errors?.spoNoRecallRationale || recommendation.spoRecallType !== 'NO_RECALL'
          ? ''
          : recommendation.spoRecallRationale,
    },
  }

  res.render(`pages/recommendations/spoRecallRationale`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { spoRecallType, spoRecallRationale, spoNoRecallRationale } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(spoRecallType)) {
    const errorId = 'noSpoRecallTypeSelected'
    errors.push(
      makeErrorObject({
        id: 'spoRecallType',
        text: strings.errors[errorId],
        errorId,
      })
    )
  } else {
    if (spoRecallType === 'RECALL' && !isMandatoryTextValue(spoRecallRationale)) {
      const errorId = 'missingSpoRecallRationale'
      errors.push(
        makeErrorObject({
          id: 'spoRecallRationale',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }

    if (spoRecallType === 'NO_RECALL' && !isMandatoryTextValue(spoNoRecallRationale)) {
      const errorId = 'missingSpoNoRecallRationale'
      errors.push(
        makeErrorObject({
          id: 'spoNoRecallRationale',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }
  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      spoRecallType,
      spoRecallRationale: spoRecallType === 'RECALL' ? spoRecallRationale : spoNoRecallRationale,
      explainTheDecision: true,
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-task-list-consider-recall', urlInfo }))
}

export default { get, post }