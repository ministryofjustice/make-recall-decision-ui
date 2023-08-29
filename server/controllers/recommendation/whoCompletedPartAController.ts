import { NextFunction, Request, Response } from 'express'
import { booleanToYesNo, isDefined, isMandatoryTextValue } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isValueValid } from '../recommendations/formOptions/formOptions'
import { regionEnum } from '../recommendations/formOptions/region'
import { isEmailValid } from '../../utils/validate-formats'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const { errors, unsavedValues } = res.locals

  res.locals = {
    ...res.locals,

    page: {
      id: 'whoCompletedPartA',
    },
    inputDisplayValues: {
      name: isDefined(errors) ? unsavedValues?.name : recommendation.whoCompletedPartA?.name,
      email: isDefined(errors) ? unsavedValues?.email : recommendation.whoCompletedPartA?.email,
      telephone: isDefined(errors) ? unsavedValues?.telephone : recommendation.whoCompletedPartA?.telephone,
      region: isDefined(errors) ? unsavedValues?.region : recommendation.whoCompletedPartA?.region,
      localDeliveryUnit: isDefined(errors)
        ? unsavedValues?.localDeliveryUnit
        : recommendation.whoCompletedPartA?.localDeliveryUnit,
      isPersonProbationPractitionerForOffender: isDefined(errors)
        ? unsavedValues?.isPersonProbationPractitionerForOffender
        : booleanToYesNo(recommendation.whoCompletedPartA?.isPersonProbationPractitionerForOffender),
    },
    regions: regionEnum,
  }

  res.render(`pages/recommendations/whoCompletedPartA`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { name, email, telephone, region, localDeliveryUnit, isPersonProbationPractitionerForOffender } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(name)) {
    const errorId = 'missingWhoCompletedPartAName'
    errors.push(
      makeErrorObject({
        id: 'name',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!isMandatoryTextValue(email)) {
    const errorId = 'missingWhoCompletedPartAEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      })
    )
  } else if (!isEmailValid(email)) {
    const errorId = 'invalidWhoCompletedPartAEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (
    !isPersonProbationPractitionerForOffender ||
    !isValueValid(isPersonProbationPractitionerForOffender as string, 'yesNo')
  ) {
    const errorId = 'missingIsPersonProbationPractitionerForOffender'
    errors.push(
      makeErrorObject({
        id: 'isPersonProbationPractitionerForOffender',
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
      isPersonProbationPractitionerForOffender,
    }
    return res.redirect(303, req.originalUrl)
  }

  const isPersonProbationPractitionerForOffenderBool = isPersonProbationPractitionerForOffender === 'YES'

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      whoCompletedPartA: {
        name,
        email,
        telephone,
        region,
        localDeliveryUnit,
        isPersonProbationPractitionerForOffender: isPersonProbationPractitionerForOffenderBool,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPageId = isPersonProbationPractitionerForOffenderBool ? 'task-list' : 'practitioner-for-part-a'
  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
