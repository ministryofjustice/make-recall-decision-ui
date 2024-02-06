import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'

// TODO BS screen depends on upload story
async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation, errors, unsavedValues } = res.locals
  const ppudMinute = recommendation?.bookRecallToPpud?.ppudMinute // TODO BS field location TBD

  res.locals = {
    ...res.locals,
    page: {
      id: 'editMinute',
    },
    errors,
    ppudMinute: ppudMinute,
  }
  res.render(`pages/recommendations/editMinute`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { ppudMinute } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        ppudMinute, // TODO BS add to response object here and to API - TBD
      }, // TODO BS tests
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo }) // TODO BS not check-booking-details, screen not built yet
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
