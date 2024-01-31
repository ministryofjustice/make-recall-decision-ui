import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { hasValue } from '../../utils/utils'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse

  const offence = recommendationResponse.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  const addNewSentence =
    !hasValue(recommendationResponse.ppudOffender) ||
    recommendationResponse.bookRecallToPpud.ppudSentenceId === 'ADD_NEW'

  res.locals = {
    ...res.locals,
    page: {
      id: 'sentenceToCommit',
    },
    offence,
    addNewSentence,
  }

  res.render(`pages/recommendations/sentenceToCommit`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'book-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
