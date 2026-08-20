import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { PpudSentence } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import getDocumentsAndMinutes from './documentsAndMinutes'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
    flags,
  } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse

  const offence = recommendationResponse.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
  )

  const sentences = recommendation.ppudOffender.sentences as PpudSentence[]
  const ppudSentence = sentences.find(s => s.id === recommendation.bookRecallToPpud.ppudSentenceId)

  const { documents, backgroundInfo, moreInfo } = await getDocumentsAndMinutes(
    recommendationResponse,
    offence?.courtDescription,
    token,
    flags,
  )

  res.locals = {
    ...res.locals,
    page: {
      id: 'sentenceToCommitExistingOffender',
    },
    offence,
    ppudSentence,
    documents,
    backgroundInfo,
    moreInfo,
  }

  res.render(`pages/recommendations/ppcs/sentenceToCommit/sentenceToCommitExistingOffender`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'book-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
