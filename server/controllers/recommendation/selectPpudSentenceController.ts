import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { NamedFormError } from '../../@types/pagesForms'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { ppcsPaths } from '../../routes/paths/ppcs'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const offence = (recommendation as RecommendationResponse).nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  res.locals = {
    ...res.locals,
    page: {
      id: 'selectPpudSentence',
    },
    offence,
  }

  res.render(`pages/recommendations/selectPpudSentence`)
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const { ppudSentenceId } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors: NamedFormError[] = []

  if (ppudSentenceId === undefined) {
    const errorId = 'noPpudSentenceSelected'
    errors.push(
      makeErrorObject({
        id: 'ppudSentenceId',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = await getRecommendation(recommendationId, token)
  const ppudSentence = recommendation.ppudOffender.sentences?.find(sentence => sentence.id === ppudSentenceId)

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        ppudSentenceId,
        custodyType: ppudSentence.custodyType,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({
    nextPageId: ppudSentenceId === 'ADD_NEW' ? ppcsPaths.editCustodyType : ppcsPaths.sentenceToCommitExistingOffender,
    urlInfo,
  })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()
}

export default { get, post }
