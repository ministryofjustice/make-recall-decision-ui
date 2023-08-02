import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesLicenceConditions } from '../recommendations/licenceConditions/inputDisplayValues'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'
import { validateLicenceConditionsBreached } from '../recommendations/licenceConditions/formValidator'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
  } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'licenceConditions',
    },
    inputDisplayValues: inputDisplayValuesLicenceConditions({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
  }

  res.locals.caseSummary = await fetchAndTransformLicenceConditions({
    crn: recommendation.crn,
    token,
  })

  res.render(`pages/recommendations/licenceConditions`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateLicenceConditionsBreached({
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

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-consider-recall', urlInfo }))
}

export default { get, post }
