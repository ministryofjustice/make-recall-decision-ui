import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { validateNextAppointment } from '../recommendations/nextAppointment/formValidator'
import { inputDisplayValuesNextAppointment } from '../recommendations/nextAppointment/inputDisplayValues'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,

    page: {
      id: 'nextAppointment',
    },
    inputDisplayValues: inputDisplayValuesNextAppointment({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
  }
  res.render(`pages/recommendations/nextAppointment`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { createLetterTasksComplete } = req.body
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateNextAppointment({
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

  let nextPagePath = nextPageLinkUrl({ nextPageId: 'preview-no-recall', urlInfo })
  if (createLetterTasksComplete === '0') {
    nextPagePath = `${urlInfo.basePath}task-list-no-recall#heading-create-letter`
  }
  res.redirect(303, nextPagePath)
}

export default { get, post }
