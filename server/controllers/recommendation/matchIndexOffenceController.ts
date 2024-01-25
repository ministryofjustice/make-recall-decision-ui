import { NextFunction, Request, Response } from 'express'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
  } = res.locals

  const offence = (recommendation as RecommendationResponse).nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  const list = await ppudReferenceList(token, 'index-offences')

  const indexOffences = list.values.map(value => {
    return {
      text: value,
      value,
    }
  })
  indexOffences.unshift({
    text: 'Select an offence',
    value: '',
  })

  res.locals = {
    ...res.locals,
    page: {
      id: 'matchIndexOffence',
    },
    indexOffences,
    offence,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/matchIndexOffence`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { indexOffence } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  if (!isDefined(indexOffence) || indexOffence.trim().length === 0) {
    const errorId = 'missingIndexOffence'

    req.session.errors = [
      makeErrorObject({
        id: 'indexOffence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        indexOffence,
      },
    },
    token,
    featureFlags: flags,
  })

  const offenderExistsAndHasSentences = recommendation.ppudOffender && recommendation.ppudOffender.sentences.length > 0

  const nextPagePath = nextPageLinkUrl({
    nextPageId: offenderExistsAndHasSentences ? 'select-ppud-sentence' : 'sentence-to-commit',
    urlInfo,
  })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
