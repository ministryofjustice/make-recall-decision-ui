import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { validateReasonsForNoRecall } from '../recommendations/reasonsForNoRecall/formValidator'
import { inputDisplayValuesReasonsForNoRecall } from '../recommendations/reasonsForNoRecall/inputDisplayValues'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,

    page: {
      id: 'reasonsForNoRecall',
    },
    inputDisplayValues: inputDisplayValuesReasonsForNoRecall({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
  }

  res.render(`pages/recommendations/reasonsForNoRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateReasonsForNoRecall({
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
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'appointment-no-recall', urlInfo })
  res.redirect(303, nextPagePath)
}

export default { get, post }
