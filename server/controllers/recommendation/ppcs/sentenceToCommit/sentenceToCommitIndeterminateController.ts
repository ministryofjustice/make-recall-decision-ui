import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { formatPpudSentenceLength } from '../../../../utils/dates/format/formatPpudSentenceLength'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse
  const ppudSentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )

  const sentenceSummary = {
    custodyType: ppudSentence.custodyType,
    offence: ppudSentence.offence.indexOffence,
    releaseDate: ppudSentence.releaseDate,
    sentencingCourt: ppudSentence.sentencingCourt,
    dateOfSentence: ppudSentence.dateOfSentence,
    tariffExpiryDate: ppudSentence.sentenceExpiryDate,
    fullPunishment: formatPpudSentenceLength(ppudSentence.sentenceLength),
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
