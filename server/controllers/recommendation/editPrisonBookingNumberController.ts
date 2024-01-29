import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation, errors, unsavedValues } = res.locals
  const prisonBookingNumberNomis = recommendation?.prisonOffender?.bookingNo
  const prisonBookingNumberPpudBooked = recommendation?.bookRecallToPpud?.prisonNumber
  const prisonBookingNumber = prisonBookingNumberPpudBooked ?? prisonBookingNumberNomis

  res.locals = {
    ...res.locals,
    page: {
      id: 'editPrisonBookingNumber',
    },
    errors,
    prisonBookingNumber: !isDefined(errors) ? prisonBookingNumber : unsavedValues,
    values: isDefined(errors),
  }
  res.render(`pages/recommendations/editPrisonBookingNumber`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { prisonBookingNumber } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const errors = []
  if (!isDefined(prisonBookingNumber) || prisonBookingNumber.trim().length === 0) {
    const errorId = 'missingPrisionBookingNumber'
    errors.push(
      makeErrorObject({
        id: 'prisonBookingNumber',
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

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        prisonNumber: prisonBookingNumber,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
