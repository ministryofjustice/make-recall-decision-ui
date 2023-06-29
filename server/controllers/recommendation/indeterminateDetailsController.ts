import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesIndeterminateDetails } from '../recommendations/indeterminateOrExtendedSentenceDetails/inputDisplayValues'
import { validateIndeterminateDetails } from '../recommendations/indeterminateOrExtendedSentenceDetails/formValidator'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'indeterminateOrExtendedSentenceDetails',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesIndeterminateDetails({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.render(`pages/recommendations/indeterminateOrExtendedSentenceDetails`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateIndeterminateDetails({
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
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'sensitive-info', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
