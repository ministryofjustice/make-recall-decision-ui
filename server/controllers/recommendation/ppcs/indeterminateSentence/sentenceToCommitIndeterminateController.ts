import { NextFunction, Request, Response } from 'express'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
<<<<<<< HEAD:server/controllers/recommendation/ppcs/sentenceToCommit/sentenceToCommitIndeterminateController.ts
import { formatPpudSentenceLength } from '../../../../utils/dates/ppudSentenceLength/formatting'
=======
import { formatPpudSentenceLength } from '../../../../utils/dates/format/formatPpudSentenceLength'
import { ppcsPaths } from '../../../../routes/paths/ppcs'
>>>>>>> fb9d790e (Add edit indeterminate sentence release date):server/controllers/recommendation/ppcs/indeterminateSentence/sentenceToCommitIndeterminateController.ts

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse
  const ppudSentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )

  const sentenceSummary = {
    ...{
      custodyType: ppudSentence.custodyType,
      offence: ppudSentence.offence.indexOffence,
      releaseDate: ppudSentence.releaseDate,
      sentencingCourt: ppudSentence.sentencingCourt,
      dateOfSentence: ppudSentence.dateOfSentence,
      tariffExpiryDate: ppudSentence.sentenceExpiryDate,
      fullPunishment: formatPpudSentenceLength(ppudSentence.sentenceLength),
    },
    ...(recommendationResponse?.bookRecallToPpud?.ppudSentenceData ?? {}),
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
