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

  let errorMessage
  let prisonOffender

  if (
    recommendation.personOnProbation.nomsNumber !== undefined &&
    recommendation.personOnProbation.nomsNumber !== null
  ) {
    prisonOffender = await searchForPrisonOffender(token, recommendation.personOnProbation.nomsNumber)

    if (prisonOffender === undefined) {
      errorMessage = 'No NOMIS record found'
    }
  } else {
    errorMessage = "No NOMIS number found in 'Consider a recall'"
  }

  if (prisonOffender === undefined) {
    prisonOffender = {
      locationDescription: undefined,
      bookingNo: undefined,
      facialImageId: undefined,
      firstName: undefined,
      middleName: undefined,
      lastName: undefined,
      dateOfBirth: undefined,
      status: undefined,
      physicalAttributes: { gender: undefined, ethnicity: undefined },
      identifiers: [],
      image: undefined,
    }
  }

  const {
    locationDescription,
    bookingNo,
    facialImageId,
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    status,
    physicalAttributes: { gender, ethnicity },
    identifiers,
    image,
  } = prisonOffender

  const valuesToSave = {
    prisonOffender: {
      locationDescription,
      bookingNo,
      facialImageId,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      status,
      gender,
      ethnicity,
      CRO: identifiers.find(id => id.type === 'CRO')?.value,
      PNC: identifiers.find(id => id.type === 'PNC')?.value,
    },
  }

  if (!errorMessage) {
    await updateRecommendation({
      recommendationId: recommendation.id,
      valuesToSave,
      token,
      featureFlags: flags,
    })
  }

  let probationArea
  if (recommendation.whoCompletedPartA?.isPersonProbationPractitionerForOffender) {
    probationArea = recommendation?.whoCompletedPartA?.localDeliveryUnit
  } else {
    probationArea = recommendation?.practitionerForPartA?.localDeliveryUnit
  }

  const spoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.SPO_SIGNED)

  const acoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.ACO_SIGNED)

  const poRecallConsultSpo = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.PO_RECALL_CONSULT_SPO)

  res.locals = {
    ...res.locals,
    page: {
      id: 'checkBookingDetails',
    },
    image,
    errorMessage,
    prisonOffender: valuesToSave.prisonOffender,
    probationArea,
    mappaLevel: recommendation.personOnProbation?.mappa?.level,
    spoSigned,
    acoSigned,
    poRecallConsultSpo,
    practitioner: recommendation.practitionerForPartA
      ? recommendation.practitionerForPartA
      : recommendation.whoCompletedPartA,
    currentHighestRosh: currentHighestRosh(recommendation.currentRoshForPartA),
  }

  res.render(`pages/recommendations/checkBookingDetails`)
  next()
}

async function post(_: Request, res: Response, next: NextFunction) {
  const { urlInfo } = res.locals

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'select-index-offence', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()
}

export default { get, post }

type Rosh = {
  riskToChildren: string
  riskToPublic: string
  riskToKnownAdult: string
  riskToStaff: string
  riskToPrisoners: string
}

export function currentHighestRosh(rosh?: Rosh | null) {
  if (rosh === undefined || rosh === null) {
    return undefined
  }

  const values = []

  function mapToNumber(val: string) {
    if (val === 'VERY_HIGH') {
      return 1
    }
    if (val === 'HIGH') {
      return 2
    }
    if (val === 'MEDIUM') {
      return 3
    }
    if (val === 'LOW') {
      return 4
    }
    if (val === 'NOT_APPLICABLE') {
      return 5
    }
  }

  function mapFromNumber(val: number) {
    if (val === 1) {
      return 'VERY_HIGH'
    }
    if (val === 2) {
      return 'HIGH'
    }
    if (val === 3) {
      return 'MEDIUM'
    }
    if (val === 4) {
      return 'LOW'
    }
    if (val === 5) {
      return 'NOT_APPLICABLE'
    }
  }

  values.push(mapToNumber(rosh.riskToChildren))
  values.push(mapToNumber(rosh.riskToPublic))
  values.push(mapToNumber(rosh.riskToKnownAdult))
  values.push(mapToNumber(rosh.riskToStaff))
  values.push(mapToNumber(rosh.riskToPrisoners))

  values.sort()

  return mapFromNumber(values[0])
}
