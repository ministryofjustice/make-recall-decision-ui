import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { booleanToYesNo } from '../../utils/utils'
import { validateIsExtendedSentence } from '../recommendations/isExtendedSentence/formValidator'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    backLink: 'is-indeterminate',
    page: {
      id: 'isExtendedSentence',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.isExtendedSentence ? '' : booleanToYesNo(recommendation.isExtendedSentence),
    },
  }

  res.render(`pages/recommendations/isExtendedSentence`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateIsExtendedSentence({
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
  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  const isIndeterminateSentence = req.body.isIndeterminateSentence === '1'

  let nextPageId
  if (isIndeterminateSentence) {
    nextPageId = 'indeterminate-type'
  } else if (flags.flagTriggerWork) {
    nextPageId = 'task-list-consider-recall'
  } else {
    nextPageId = valuesToSave.isExtendedSentence ? 'recall-type-indeterminate' : 'recall-type'
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
