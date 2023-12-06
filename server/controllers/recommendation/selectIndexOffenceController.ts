import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, prisonSentences, updateRecommendation } from '../../data/makeDecisionApiClient'
import { NamedFormError } from '../../@types/pagesForms'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { isDefined } from '../../utils/utils'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    recommendation,
  } = res.locals

  const sentences = await prisonSentences(token, recommendation.personOnProbation.nomsNumber)

  let errorMessage
  if (sentences.length === 0) {
    errorMessage = 'No sentences found'
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'selectIndexOffence',
    },
    sentences,
    errorMessage,
  }

  const allOptions = sentences
    .flatMap(sentence => {
      if (sentence.offences) {
        return sentence.offences.map(offence => {
          return {
            offenderChargeId: offence.offenderChargeId,
            offenceCode: offence.offenceCode,
            offenceStatute: offence.offenceStatute,
            offenceDescription: offence.offenceDescription,
            sentenceDate: sentence.sentenceDate,
            courtDescription: sentence.courtDescription,
            sentenceStartDate: sentence.sentenceStartDate,
            sentenceEndDate: sentence.sentenceEndDate,
            bookingId: sentence.bookingId,
          }
        })
      }
      return undefined
    })
    .filter(isDefined)

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      nomisIndexOffence: {
        selected: recommendation.nomisIndexOffence?.selected,
        allOptions,
      },
    },
    token,
    featureFlags: flags,
  })

  res.render(`pages/recommendations/selectIndexOffence`)
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors: NamedFormError[] = []

  const { indexOffence } = req.body

  if (indexOffence === undefined) {
    const errorId = 'noIndexOffenceSelected'
    errors.push(
      makeErrorObject({
        id: 'indexOffence',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      nomisIndexOffence: {
        selected: indexOffence,
        allOptions: recommendation.nomisIndexOffence?.allOptions,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'map-index-offence', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()
}

export default { get, post }
