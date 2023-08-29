import { NextFunction, Request, Response } from 'express'
import { isDefined, isMandatoryTextValue } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { regionEnum } from '../recommendations/formOptions/region'
import { isEmailValid } from '../../utils/validate-formats'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const { errors, unsavedValues } = res.locals

  res.locals = {
    ...res.locals,

    page: {
      id: 'practitionerForPartA',
    },
    inputDisplayValues: {
      name: isDefined(errors) ? unsavedValues?.name : recommendation.practitionerForPartA?.name,
      email: isDefined(errors) ? unsavedValues?.email : recommendation.practitionerForPartA?.email,
      telephone: isDefined(errors) ? unsavedValues?.telephone : recommendation.practitionerForPartA?.telephone,
      region: isDefined(errors) ? unsavedValues?.region : recommendation.practitionerForPartA?.region,
      localDeliveryUnit: isDefined(errors)
        ? unsavedValues?.localDeliveryUnit
        : recommendation.practitionerForPartA?.localDeliveryUnit,
    },
    regions: regionEnum,
  }

  res.render(`pages/recommendations/practitionerForPartA`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { name, email, telephone, region, localDeliveryUnit } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(name)) {
    const errorId = 'missingPractitionerForPartAName'
    errors.push(
      makeErrorObject({
        id: 'name',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!isMandatoryTextValue(email)) {
    const errorId = 'missingPractitionerForPartAEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      })
    )
  } else if (!isEmailValid(email)) {
    const errorId = 'invalidPractitionerForPartAEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      name,
      email,
      telephone,
      region,
      localDeliveryUnit,
    }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      practitionerForPartA: {
        name,
        email,
        telephone,
        region,
        localDeliveryUnit,
      },
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list', urlInfo }))
}

export default { get, post }
