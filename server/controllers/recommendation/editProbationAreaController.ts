import { NextFunction, Request, Response } from 'express'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
  } = res.locals

  const list = await ppudReferenceList(token, 'probation-services')

  const ppudProbationAreas = list.values.map(value => {
    return {
      text: value,
      value,
    }
  })
  ppudProbationAreas.unshift({
    text: 'Select probation area',
    value: '',
  })

  let partAProbationArea
  if (recommendation.whoCompletedPartA?.isPersonProbationPractitionerForOffender) {
    partAProbationArea = recommendation?.whoCompletedPartA?.localDeliveryUnit
  } else {
    partAProbationArea = recommendation?.practitionerForPartA?.localDeliveryUnit
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'editProbationArea',
    },
    partAProbationArea,
    ppudProbationAreas,
    errors: res.locals.errors,
  }

  res.render(`pages/recommendations/editProbationArea`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { probationArea } = req.body

  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  if (!isDefined(probationArea) || probationArea.trim().length === 0) {
    const errorId = 'missingProbationArea'

    req.session.errors = [
      makeErrorObject({
        id: 'probationArea',
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
        probationArea,
      },
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
