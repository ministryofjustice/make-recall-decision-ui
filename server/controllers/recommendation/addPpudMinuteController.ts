import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { isMandatoryTextValue } from '../../utils/utils'
import generateId from '../../utils/generateId'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'addPpudMinute',
    },
  }

  res.render(`pages/recommendations/addPpudMinute`)
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

  if (!isMandatoryTextValue(minute)) {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'supporting-documents', urlInfo }))
  }

  const recommendation = await getRecommendation(recommendationId, token)

  const minutes = recommendation.bookRecallToPpud.minutes || []
  minutes.push({
    id: generateId(),
    text: minute,
  })

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        minutes,
      },
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'supporting-documents', urlInfo }))
}

export default { get, post }
