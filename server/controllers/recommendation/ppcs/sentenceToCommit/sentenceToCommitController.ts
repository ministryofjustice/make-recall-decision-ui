import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import getDocumentsAndMinutes from './documentsAndMinutes'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
    flags,
  } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse

  const offence = recommendationResponse.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
  )

  const { documents, backgroundInfo, moreInfo } = await getDocumentsAndMinutes(
    recommendationResponse,
    offence?.courtDescription,
    token,
    flags,
  )

  res.locals = {
    ...res.locals,
    page: {
      id: 'sentenceToCommit',
    },
    offence,
    documents,
    backgroundInfo,
    moreInfo,
  }

  res.render(`pages/recommendations/ppcs/sentenceToCommit/sentenceToCommit`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'book-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
