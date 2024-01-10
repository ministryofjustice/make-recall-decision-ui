import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesRecallReceived } from '../recommendations/recallReceived/inputDisplayValues'
import { validateRecallReceived } from '../recommendations/recallReceived/formValidator'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation, statuses } = res.locals
  const sentToPpcs = (statuses as RecommendationStatusResponse[])
    ?.filter(s => s.active)
    .find(s => s.name === STATUSES.SENT_TO_PPCS)

  const recallReceived = recommendation?.bookRecallToPpud?.receivedDateTime ?? sentToPpcs?.created
  recommendation.bookRecallToPpud = { ...recommendation.bookRecallToPpud, recallReceived }
  res.locals = {
    ...res.locals,

    page: {
      id: 'editRecallReceived',
    },
    inputDisplayValues: inputDisplayValuesRecallReceived({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
  }

  res.render(`pages/recommendations/editRecallReceived`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateRecallReceived({
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

  const recommendation = await getRecommendation(recommendationId, token)
  recommendation.bookRecallToPpud.receivedDateTime = valuesToSave.receivedDateTime.toString()

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        receivedDateTime: valuesToSave.receivedDateTime.toString(),
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPagePath)
}

export default { get, post }
