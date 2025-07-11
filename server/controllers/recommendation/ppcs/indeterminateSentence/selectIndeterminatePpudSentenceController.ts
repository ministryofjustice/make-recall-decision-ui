import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { getCustodyGroup, getIndeterminateSentences } from '../../../../helpers/ppudSentence/ppudSentenceHelper'
import { makeErrorObject } from '../../../../utils/errors'
import { strings } from '../../../../textStrings/en'
import { PpudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const custodyGroup = getCustodyGroup(recommendation)
  const indeterminateSentences = getIndeterminateSentences(recommendation.ppudOffender.sentences)

  const pageData = {
    nomisSentence: {
      offenceDescription: recommendation.convictionDetail.indexOffenceDescription,
      custodyGroup,
      dateOfSentence: recommendation.convictionDetail.dateOfSentence,
      sentenceExpiryDate: recommendation.convictionDetail.sentenceExpiryDate,
    },
    ppudSentences: indeterminateSentences,
    selectedSentenceId: recommendation.bookRecallToPpud.ppudSentenceId,
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'selectIndeterminatePpudSentence',
    },
    recommendation,
    selectIndeterminatePpudSentencePageData: pageData,
  }

  res.render(`pages/recommendations/ppcs/indeterminateSentence/selectIndeterminatePpudSentence`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { ppudSentenceId } = req.body
  const { recommendation } = res.locals

  const sentences: PpudDetailsSentence[] = getIndeterminateSentences(recommendation.ppudOffender.sentences)

  let errorId
  if (ppudSentenceId === undefined) {
    errorId = 'missingIndeterminatePpudSentence'
  } else {
    const sentenceIds = sentences.map((sentence: PpudDetailsSentence) => sentence.id)
    if (!sentenceIds.includes(ppudSentenceId)) {
      errorId = 'invalidIndeterminatePpudSentenceSelected'
    }
  }

  if (errorId) {
    const error = makeErrorObject({
      id: 'ppudSentenceId',
      text: strings.errors[errorId],
      errorId,
    })
    req.session.errors = [error]
    return res.redirect(303, req.originalUrl)
  }

  const sentence = sentences.find(s => s.id === ppudSentenceId)
  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        ppudSentenceId,
        ppudSentenceData: {
          offenceDescription: sentence.offence.indexOffence,
          releaseDate: sentence.releaseDate,
          sentencingCourt: sentence.sentencingCourt,
          dateOfSentence: sentence.dateOfSentence,
        },
      },
    },
    featureFlags: res.locals.flags,
    token: res.locals.user.token,
  })

  const { urlInfo } = res.locals
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'sentence-to-commit-indeterminate', urlInfo }))
}

export default { get, post }
