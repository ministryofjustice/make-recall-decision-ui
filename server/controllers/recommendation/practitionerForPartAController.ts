import { NextFunction, Request, Response } from 'express'
import { isDefined, isMandatoryTextValue } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import strings from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import regionEnum from '../recommendations/formOptions/region'
import jobTitleEnum from '../recommendations/formOptions/jobTitle'
import { isEmailValid, isGovUkEmail } from '../../utils/validate-formats'

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
      jobTitle: isDefined(errors) ? unsavedValues?.jobTitle : recommendation.practitionerForPartA?.jobTitle,
      email: isDefined(errors) ? unsavedValues?.email : recommendation.practitionerForPartA?.email,
      telephone: isDefined(errors) ? unsavedValues?.telephone : recommendation.practitionerForPartA?.telephone,
    },
    regions: regionEnum,
    jobTitles: jobTitleEnum,
  }

  res.render(`pages/recommendations/practitionerForPartA`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { name, jobTitle, email, telephone } = req.body

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
      }),
    )
  }

  if (!isMandatoryTextValue(jobTitle)) {
    const errorId = 'missingPractitionerForPartAJobTitle'
    errors.push(
      makeErrorObject({
        id: 'jobTitle',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }

  if (!isMandatoryTextValue(email)) {
    const errorId = 'missingPractitionerForPartAEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  } else if (!isEmailValid(email)) {
    const errorId = 'invalidPractitionerForPartAEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  } else if (!isGovUkEmail(email)) {
    const errorId = 'nonGovUkPractitionerForPartAEmail'
    errors.push(
      makeErrorObject({
        id: 'email',
        text: strings.errors[errorId],
        errorId,
      }),
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      name,
      jobTitle,
      email,
      telephone,
    }
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      practitionerForPartA: {
        name,
        jobTitle,
        email,
        telephone,
      },
    },
    token,
    featureFlags: flags,
  })

  return res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list', urlInfo }))
}

export default { get, post }
