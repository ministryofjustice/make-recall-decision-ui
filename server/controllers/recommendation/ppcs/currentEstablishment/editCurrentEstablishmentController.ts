import { NextFunction, Request, Response } from 'express'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { isDefined } from '../../../../utils/utils'
import { makeErrorObject } from '../../../../utils/errors'
import { strings } from '../../../../textStrings/en'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import {
  extractCurrentEstablishment,
  extractNomisEstablishment,
  extractPpudEstablishment,
} from './recommendationEstablishmentExtractor'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
    recommendation,
  } = res.locals

  const referenceListEstablishments = await ppudReferenceList(token, 'establishments')

  const establishments = referenceListEstablishments.values.map(value => {
    return {
      text: value,
      value,
    }
  })

  const nomisEstablishment = extractNomisEstablishment(recommendation)
  const ppudEstablishment = extractPpudEstablishment(recommendation)
  const currentEstablishment = extractCurrentEstablishment(recommendation, referenceListEstablishments.values)

  res.locals = {
    ...res.locals,
    page: {
      id: 'editCurrentEstablishment',
    },
    nomisEstablishment,
    ppudEstablishment,
    currentEstablishment,
    establishments,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/editCurrentEstablishment`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { currentEstablishment } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  if (!isDefined(currentEstablishment) || currentEstablishment.trim().length === 0) {
    const errorId = 'missingCurrentEstablishment'

    req.session.errors = [
      makeErrorObject({
        id: 'currentEstablishment',
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
        currentEstablishment,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
