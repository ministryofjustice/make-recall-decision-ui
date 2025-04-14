import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { getCustodyGroup, getIndeterminateSentences } from '../../../../helpers/ppudSentence/ppudSentenceHelper'
import { makeErrorObject } from '../../../../utils/errors'
import { strings } from '../../../../textStrings/en'
import { PpudDetailsSentence } from '../../../../@types/make-recall-decision-api/models/PpudDetailsResponse'

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

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const { ppudSentenceId } = req.body
  const { recommendation } = res.locals

  let errorId
  if (ppudSentenceId === undefined) {
    errorId = 'noIndeterminatePpudSentenceSelected'
  } else {
    const sentences: PpudDetailsSentence[] = getIndeterminateSentences(recommendation.ppudOffender.sentences)
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

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        ppudSentenceId,
      },
    },
    featureFlags: res.locals.flags,
    token: res.locals.user.token,
  })

  // TODO MRD-2687 redirect to the next page once it's ready
}

export default { get, post }
