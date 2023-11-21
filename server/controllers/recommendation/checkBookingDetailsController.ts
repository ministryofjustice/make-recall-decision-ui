import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { searchForPrisonOffender, updateRecommendation } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
    recommendation,
    statuses,
    flags,
  } = res.locals

  const response = await searchForPrisonOffender(token, recommendation.personOnProbation.nomsNumber)

  const { locationDescription } = response

  const valuesToSave = {
    prisonApiLocationDescription: locationDescription,
  }

  await updateRecommendation({
    recommendationId: recommendation.id,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  let probationArea
  if (recommendation.whoCompletedPartA?.isPersonProbationPractitionerForOffender) {
    probationArea = recommendation?.whoCompletedPartA?.localDeliveryUnit
  } else {
    probationArea = recommendation?.practitionerForPartA?.localDeliveryUnit
  }

  const spoSigned = (statuses as RecommendationStatusResponse[])
    .filter(status => status.active)
    .find(status => status.name === STATUSES.SPO_SIGNED)

  const acoSigned = (statuses as RecommendationStatusResponse[])
    .filter(status => status.active)
    .find(status => status.name === STATUSES.ACO_SIGNED)

  const poRecallConsultSpo = (statuses as RecommendationStatusResponse[])
    .filter(status => status.active)
    .find(status => status.name === STATUSES.PO_RECALL_CONSULT_SPO)

  res.locals = {
    ...res.locals,
    page: {
      id: 'checkBookingDetails',
    },
    custodialStatus: locationDescription,
    probationArea,
    mappaLevel: recommendation.personOnProbation?.mappa?.level,
    spoSigned,
    acoSigned,
    poRecallConsultSpo,
    practitioner: recommendation.practitionerForPartA
      ? recommendation.practitionerForPartA
      : recommendation.whoCompletedPartA,
  }

  res.render(`pages/recommendations/checkBookingDetails`)
  next()
}

async function post(_: Request, res: Response, next: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()
}

export default { get, post }
