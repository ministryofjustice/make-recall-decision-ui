import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { PpudSentenceLength } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse
  const sentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )

  const formatSentenceLength = (sentenceLength: PpudSentenceLength) => {
    let latch = false
    let result = ''
    if (sentenceLength.partYears) {
      result = `${result + sentenceLength.partYears} years`
      latch = true
    }
    if (sentenceLength.partMonths) {
      result = `${result}${latch ? ', ' : ''}${sentenceLength.partMonths} months`
      latch = true
    }
    if (sentenceLength.partDays) {
      result = `${result}${latch ? ', ' : ''}${sentenceLength.partDays} days`
    }
    return result
  }

  const sentenceSummary = {
    custodyType: sentence.custodyType,
    offence: sentence.offence.indexOffence,
    releaseDate: sentence.releaseDate,
    sentencingCourt: sentence.sentencingCourt,
    dateOfSentence: sentence.dateOfSentence,
    tarrifExpiryDate: sentence.sentenceExpiryDate,
    fullPunishment: formatSentenceLength(sentence.sentenceLength),
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
