import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse

  const offence = recommendationResponse.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  const sentenceSummary = {
    custodyType: recommendationResponse.bookRecallToPpud.custodyType,
    offence: recommendationResponse.bookRecallToPpud.indexOffence,
    releaseDate: offence.releaseDate,
    sentencingCourt: offence.courtDescription,
    dateOfSentence: offence.sentenceDate,
    tarrifExpiryDate: offence.sentenceEndDate,
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'sentenceToCommitIndeterminate',
    },
    sentenceSummary,
  }

  res.render(`pages/recommendations/ppcs/sentenceToCommit/sentenceToCommitIndeterminate`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { urlInfo } = res.locals
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'book-to-ppud', urlInfo }))
}

export default { get, post }
