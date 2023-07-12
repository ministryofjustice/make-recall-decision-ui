import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { routeUrls } from '../../routes/routeUrls'
import { validateVictimContactScheme } from '../recommendations/victimContactScheme/formValidator'
import { inputDisplayValuesVictimContactScheme } from '../recommendations/victimContactScheme/inputDisplayValues'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'victimContactScheme',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesVictimContactScheme({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.render(`pages/recommendations/victimContactScheme`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateVictimContactScheme({
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

  const nextPageId =
    req.body.hasVictimsInContactScheme === 'YES' ? 'victim-liaison-officer' : 'task-list#heading-victim-liaison'
  const nextPagePath = `${routeUrls.recommendations}/${recommendationId}/${nextPageId}`

  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
