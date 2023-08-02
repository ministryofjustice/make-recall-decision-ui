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
    page: {
      id: 'triggerLeadingToRecall',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.triggerLeadingToRecall ? '' : recommendation.triggerLeadingToRecall,
    },
  }

  res.render(`pages/recommendations/triggerLeadingToRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { triggerLeadingToRecall } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(triggerLeadingToRecall)) {
    const errorId = 'missingTriggerLeadingToRecall'
    errors.push(
      makeErrorObject({
        id: 'triggerLeadingToRecall',
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
      triggerLeadingToRecall,
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-consider-recall', urlInfo }))
}

export default { get, post }
