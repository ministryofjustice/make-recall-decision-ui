import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const minute = (recommendation as RecommendationResponse)?.bookRecallToPpud?.minute
  res.locals = {
    ...res.locals,
    minute,
    page: {
      id: 'editPpudMinute',
    },
  }

  res.render(`pages/recommendations/editPpudMinute`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { minute } = req.body
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        minute,
      },
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'supporting-documents', urlInfo }))
}

export default { get, post }
