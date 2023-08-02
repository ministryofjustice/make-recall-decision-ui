import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { booleanToYesNo } from '../../utils/utils'
import { validateIsIndeterminateSentence } from '../recommendations/isIndeterminateSentence/formValidator'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'isIndeterminateSentence',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.isIndeterminateSentence ? '' : booleanToYesNo(recommendation.isIndeterminateSentence),
    },
  }

  res.render(`pages/recommendations/isIndeterminateSentence`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateIsIndeterminateSentence({
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

  if (urlInfo.fromPageId === 'task-list-consider-recall') {
    urlInfo.fromPageId = undefined
  }

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'is-extended', urlInfo }))
}

export default { get, post }
