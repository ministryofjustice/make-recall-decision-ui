import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import inputDisplayValuesAlternativesToRecallTried from '../recommendations/alternativesToRecallTried/inputDisplayValues'
import validateAlternativesTried from '../recommendations/alternativesToRecallTried/formValidator'
import ppPaths from '../../routes/paths/pp'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    urlInfo: { basePath, fromPageId },
  } = res.locals

  const backLinkUrl =
    res.locals.flags.flagFTR56Enabled && !fromPageId ? `${basePath}${ppPaths.taskListConsiderRecall}` : undefined

  res.locals = {
    ...res.locals,
    page: {
      id: 'alternativesToRecallTried',
    },
    inputDisplayValues: inputDisplayValuesAlternativesToRecallTried({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
    backLinkUrl,
  }

  res.render(`pages/recommendations/alternativesToRecallTried`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateAlternativesTried({
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

  return res.redirect(
    303,
    nextPageLinkUrl({
      nextPageId: flags.flagFTR56Enabled ? ppPaths.sentenceInformation : ppPaths.taskListConsiderRecall,
      urlInfo,
    }),
  )
}

export default { get, post }
