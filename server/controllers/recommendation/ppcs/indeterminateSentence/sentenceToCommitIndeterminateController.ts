import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { formatPpudSentenceLength } from '../../../../utils/dates/ppudSentenceLength/formatting'
import { ppcsPaths } from '../../../../routes/paths/ppcs.routes'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse
  const ppudSentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )

  const sentenceSummary = {
    ...{
      custodyType: ppudSentence.custodyType,
      offenceDescription: ppudSentence.offence.indexOffence,
      releaseDate: ppudSentence.releaseDate,
      sentencingCourt: ppudSentence.sentencingCourt,
      dateOfSentence: ppudSentence.dateOfSentence,
      tariffExpiryDate: ppudSentence.tariffExpiryDate,
      fullPunishment: formatPpudSentenceLength(ppudSentence.sentenceLength),
    },
    ...(recommendationResponse?.bookRecallToPpud?.ppudIndeterminateSentenceData ?? {}),
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'sentenceToCommitIndeterminate',
    },
    pageData: {
      sentenceSummary,
      editLinks: {
        releaseDate: ppcsPaths.indeterminateEdit.releaseDate,
        dateOfSentence: ppcsPaths.indeterminateEdit.dateOfSentence,
        offenceDescription: ppcsPaths.indeterminateEdit.offenceDescription,
        sentencingCourt: ppcsPaths.indeterminateEdit.sentencingCourt,
      },
    },
  }

  res.render(`pages/recommendations/ppcs/indeterminateSentence/sentenceToCommitIndeterminate`)
  next()
}

async function post(_: Request, res: Response, next: NextFunction) {
  const { urlInfo } = res.locals
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'book-to-ppud', urlInfo }))
}

export default { get, post }
