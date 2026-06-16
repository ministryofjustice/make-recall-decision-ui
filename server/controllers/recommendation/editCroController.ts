import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import strings from '../../textStrings/en'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation, errors, unsavedValues } = res.locals
  const { cro } = recommendation.bookRecallToPpud

  res.locals = {
    ...res.locals,
    page: {
      id: 'editCro',
    },
    errors: res.locals.errors,
    values: isDefined(errors)
      ? unsavedValues
      : {
          cro: cro || recommendation.prisonOffender?.cro || '',
        },
  }
  res.render(`pages/recommendations/editCro`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { cro } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const recommendation = await getRecommendation(recommendationId, token)

  const croFromPartA = recommendation.prisonOffender?.cro
  const croFromPpud = recommendation.ppudOffender?.croOtherNumber
  const croEmpty = !cro || cro.trim().length === 0

  if (croEmpty && !croFromPartA && !croFromPpud) {
    const errorId = 'missingCro'
    req.session.errors = [
      makeErrorObject({
        id: 'cro',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        cro,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
