import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../utils/errors'
import { convertGmtDatePartsToUtc, splitIsoDateToParts } from '../../utils/dates/conversion'
import { dateHasError } from '../../utils/dates'
import { ValidationError } from '../../@types/dates'
import { isDefined } from '../../utils/utils'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation, errors, unsavedValues } = res.locals
  const dobNomis = recommendation?.prisonOffender?.dateOfBirth
  const dobPpudBooked = recommendation?.bookRecallToPpud?.dateOfBirth
  res.locals = {
    ...res.locals,
    page: {
      id: 'editDateOfBirth',
    },
    errors,
    dateOfBirth: !isDefined(errors) ? splitIsoDateToParts(dobPpudBooked ?? dobNomis) : unsavedValues,
  }

  res.render(`pages/recommendations/editDateOfBirth`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { day, month, year } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const dateOfBirthParts = {
    day,
    month,
    year,
  }

  const dateOfBirthIso = convertGmtDatePartsToUtc(dateOfBirthParts as Record<string, string>, {
    includeTime: false,
    dateMustBeInPast: true,
    validatePartLengths: false,
  })
  const errors = []

  if (dateHasError(dateOfBirthIso)) {
    errors.push(
      makeErrorObject({
        name: 'dateOfBirth',
        id: invalidDateInputPart(dateOfBirthIso as ValidationError, 'dateOfBirth'),
        text: formatValidationErrorMessage(dateOfBirthIso as ValidationError, 'date of birth'),
        errorId: (dateOfBirthIso as ValidationError).errorId,
        invalidParts: (dateOfBirthIso as ValidationError).invalidParts,
        values: dateOfBirthParts,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = dateOfBirthParts
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        dateOfBirth: dateOfBirthIso,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
