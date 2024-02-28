import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { PpudSentence } from '../../@types/make-recall-decision-api/models/RecommendationResponse'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse

  const offence = recommendationResponse.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  const sentences = recommendation.ppudOffender.sentences as PpudSentence[]
  const ppudSentence = sentences.find(s => s.id === recommendation.bookRecallToPpud.ppudSentenceId)

  res.locals = {
    ...res.locals,
    page: {
      id: 'sentenceToCommitExistingOffender',
    },
    offence,
    ppudSentence,
  }

  res.render(`pages/recommendations/sentenceToCommitExistingOffender`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'book-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
