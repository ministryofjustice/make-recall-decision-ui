import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation, errors, unsavedValues } = res.locals
  const { firstNames, lastName } = recommendation.bookRecallToPpud

  res.locals = {
    ...res.locals,
    page: {
      id: 'editName',
    },
    errors: res.locals.errors,
    values: isDefined(errors)
      ? unsavedValues
      : {
          firstNames,
          lastName,
        },
  }

  res.render(`pages/recommendations/editName`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { firstNames, lastName } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const errors = []

  if (!isDefined(firstNames) || firstNames.trim().length === 0) {
    const errorId = 'missingFirstNames'

    errors.push(
      makeErrorObject({
        id: 'firstNames',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!isDefined(lastName) || lastName.trim().length === 0) {
    const errorId = 'missingLastName'

    errors.push(
      makeErrorObject({
        id: 'lastName',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      firstNames,
      lastName,
    }
    return res.redirect(303, req.originalUrl)
  }

  const recommendation = await getRecommendation(recommendationId, token)

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookRecallToPpud: {
        ...recommendation.bookRecallToPpud,
        firstNames,
        lastName,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
