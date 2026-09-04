import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import getSentenceToCommitRoute from './ppcs/sentenceToCommitRouter'
import generateRecallMinuteText from '../recommendations/helpers/ppudMinutes'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  const savedMinute = recommendation.bookRecallToPpud?.minute

  const minute = savedMinute ?? generateRecallMinuteText(recommendation)

  res.locals = {
    ...res.locals,
    minute,
    page: {
      id: 'addMinute',
    },
  }

  res.render('pages/recommendations/addMinute')
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { minute } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { recommendation } = res.locals

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
  const nextPageId = getSentenceToCommitRoute(recommendation)
  const nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
