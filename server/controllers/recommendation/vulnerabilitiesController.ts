import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesVulnerabilities } from '../recommendations/vulnerabilities/inputDisplayValues'
import { validateVulnerabilities } from '../recommendations/vulnerabilities/formValidator'
import { routeUrls } from '../../routes/routeUrls'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  const { recommendation } = res.locals
  res.locals = {
    ...res.locals,
    page: {
      id: 'vulnerabilities',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesVulnerabilities({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.render(`pages/recommendations/vulnerabilities`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateVulnerabilities({
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
  const nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-vulnerability`
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
