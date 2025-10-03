import { NextFunction, Request, Response } from 'express'
import { ppudReferenceList, updateRecommendation } from '../../../../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../../../../utils/errors'
import { strings } from '../../../../../textStrings/en'
import { nextPageLinkUrl } from '../../../../recommendations/helpers/urls'
import { isDefined } from '../../../../../utils/utils'
import { RecommendationResponse } from '../../../../../@types/make-recall-decision-api'
import { NamedFormError } from '../../../../../@types/pagesForms'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
  } = res.locals

  const recommendationResponse = recommendation as RecommendationResponse
  const ppudSentence = recommendationResponse.ppudOffender.sentences.find(
    s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
  )
  const existingSentencingCourt = ppudSentence.sentencingCourt
  const pendingSentenceData = recommendationResponse.bookRecallToPpud.ppudIndeterminateSentenceData

  const list = await ppudReferenceList(token, 'courts')
  const allCourts = list.values.map(value => {
    return {
      text: value,
      value,
    }
  })

  res.locals = {
    ...res.locals,
    page: {
      id: 'editSentencingCourt',
    },
    existingSentencingCourt,
    // If the value hasn't changed, don't preselect anything in the autocomplete
    sentencingCourt:
      existingSentencingCourt === pendingSentenceData.sentencingCourt ? null : pendingSentenceData.sentencingCourt,
    allCourts,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/ppcs/indeterminateSentence/edit/editSentencingCourt`)
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { sentencingCourt } = req.body
  const { recommendationId } = req.params

  const { urlInfo, recommendation } = res.locals

  const errors: NamedFormError[] = []

  if (!isDefined(sentencingCourt)) {
    const errorId = 'missingSentencingCourt'
    errors.push(
      makeErrorObject({
        id: 'sentencingCourt',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        ppudIndeterminateSentenceData: {
          ...recommendation.bookRecallToPpud.ppudIndeterminateSentenceData,
          sentencingCourt,
        },
      },
    },
    featureFlags: res.locals.flags,
    token: res.locals.user.token,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'sentence-to-commit-indeterminate', urlInfo }))
}

export default { get, post }
