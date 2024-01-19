import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { getRecommendation, searchForPrisonOffender, updateRecommendation } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import {
  BookRecallToPpud,
  PpudOffender,
  PrisonOffender,
} from '../../@types/make-recall-decision-api/models/RecommendationResponse'
import { hasValue, isDefined } from '../../utils/utils'
import { PrisonOffenderSearchResponse } from '../../@types/make-recall-decision-api/models/PrisonOffenderSearchResponse'
import { formatDateTimeFromIsoString } from '../../utils/dates/format'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
    recommendation,
    statuses,
    flags,
  } = res.locals

  const sentToPpcs = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.SENT_TO_PPCS)
  const recallReceived = recommendation.bookRecallToPpud?.receivedDateTime ?? sentToPpcs?.created
  const spoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.SPO_SIGNED)

  const acoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.ACO_SIGNED)

  const poRecallConsultSpo = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.PO_RECALL_CONSULT_SPO)

  let errorMessage
  const valuesToSave = {
    prisonOffender: undefined,
    bookRecallToPpud: undefined,
  } as { bookRecallToPpud: BookRecallToPpud; prisonOffender: PrisonOffender }

  // if recommendation does not have prison offender from nomis, look it up and add it.
  if (!hasValue(recommendation.prisonOffender)) {
    if (hasValue(recommendation.personOnProbation.nomsNumber)) {
      const nomisPrisonOffender = (await searchForPrisonOffender(
        token,
        recommendation.personOnProbation.nomsNumber
      )) as PrisonOffenderSearchResponse

      if (!isDefined(nomisPrisonOffender)) {
        errorMessage = 'No NOMIS record found'
      } else {
        valuesToSave.prisonOffender = {
          image: nomisPrisonOffender.image,
          locationDescription: nomisPrisonOffender.locationDescription,
          bookingNo: nomisPrisonOffender.bookingNo,
          facialImageId: nomisPrisonOffender.facialImageId,
          firstName: nomisPrisonOffender.firstName,
          middleName: nomisPrisonOffender.middleName,
          lastName: nomisPrisonOffender.lastName,
          dateOfBirth: nomisPrisonOffender.dateOfBirth,
          status: nomisPrisonOffender.status,
          gender: nomisPrisonOffender.physicalAttributes.gender,
          ethnicity: nomisPrisonOffender.physicalAttributes.ethnicity,
          cro: nomisPrisonOffender.identifiers.find(id => id.type === 'CRO')?.value,
          pnc: nomisPrisonOffender.identifiers.find(id => id.type === 'PNC')?.value,
        }
        recommendation.prisonOffender = valuesToSave.prisonOffender
      }
    } else {
      errorMessage = "No NOMIS number found in 'Consider a recall'"
    }
  }

  // if recommendation does not have working values for book to ppud, add them.
  if (!hasValue(recommendation.bookRecallToPpud)) {
    let firstName = ''
    let middleName = ''
    let lastName = ''
    let dateOfBirth = ''

    if (recommendation.prisonOffender) {
      firstName = recommendation.prisonOffender.firstName
      middleName = recommendation.prisonOffender.middleName
      lastName = recommendation.prisonOffender.lastName
      dateOfBirth = recommendation.prisonOffender.dateOfBirth
    }

    valuesToSave.bookRecallToPpud = {
      firstNames: `${firstName} ${middleName}`,
      lastName,
      dateOfBirth,
      prisonNumber: recommendation.prisonOffender.bookingNo,
      cro: recommendation.prisonOffender?.cro,
      decisionDateTime: poRecallConsultSpo?.created.substring(0, 19),
      isInCustody: recommendation?.custodyStatus?.selected !== 'NO',
      riskOfContrabandDetails: recommendation?.hasContrabandRisk?.selected
        ? recommendation.hasContrabandRisk.details
        : '',
      riskOfSeriousHarmLevel: currentHighestRosh(recommendation.currentRoshForPartA),
      receivedDateTime: poRecallConsultSpo?.created.substring(0, 19),
      releaseDate: null,
      sentenceDate: null,
    } as BookRecallToPpud
    recommendation.bookRecallToPpud = valuesToSave.bookRecallToPpud
  }

  if (isDefined(valuesToSave.bookRecallToPpud) || isDefined(valuesToSave.prisonOffender)) {
    await updateRecommendation({
      recommendationId: recommendation.id,
      valuesToSave,
      token,
      featureFlags: flags,
    })
  }

  const warnings = {} as Record<string, string>

  if (isDefined(recommendation.ppudOffender) && isDefined(recommendation.prisonOffender)) {
    const ppudOffender = recommendation.ppudOffender as PpudOffender
    const prisonOffender = recommendation.prisonOffender as PrisonOffender
    const bookToPpud = recommendation.bookRecallToPpud as BookRecallToPpud
    if (prisonOffender.firstName !== ppudOffender.firstNames && bookToPpud.firstNames !== ppudOffender.firstNames) {
      warnings['PPUD-First name'] = ppudOffender.firstNames
    }
    if (prisonOffender.lastName !== ppudOffender.familyName && bookToPpud.lastName !== ppudOffender.familyName) {
      warnings['PPUD-Last name'] = ppudOffender.familyName
    }
    if (
      prisonOffender.bookingNo !== ppudOffender.prisonNumber &&
      bookToPpud.prisonNumber !== ppudOffender.prisonNumber
    ) {
      warnings['PPUD-Prison booking number'] = ppudOffender.prisonNumber
    }
    if (
      prisonOffender.dateOfBirth !== ppudOffender.dateOfBirth &&
      bookToPpud.dateOfBirth !== ppudOffender.dateOfBirth
    ) {
      warnings['PPUD-Date of birth'] = formatDateTimeFromIsoString({
        isoDate: ppudOffender.dateOfBirth,
        dateOnly: true,
      })
    }
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'checkBookingDetails',
    },
    errorMessage,
    spoSigned,
    acoSigned,
    poRecallConsultSpo,
    practitioner: recommendation.practitionerForPartA
      ? recommendation.practitionerForPartA
      : recommendation.whoCompletedPartA,
    currentHighestRosh: currentHighestRosh(recommendation.currentRoshForPartA),
    recallReceived,
    warnings,
  }

  res.render(`pages/recommendations/checkBookingDetails`)
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  const recommendation = await getRecommendation(recommendationId, token)

  if (!hasValue(recommendation.bookRecallToPpud.gender) || recommendation.bookRecallToPpud.gender.length === 0) {
    const errorId = 'missingGender'
    errors.push(
      makeErrorObject({
        id: 'gender',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (!hasValue(recommendation.bookRecallToPpud.ethnicity) || recommendation.bookRecallToPpud.ethnicity.length === 0) {
    const errorId = 'missingEthnicity'
    errors.push(
      makeErrorObject({
        id: 'ethnicity',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (
    !hasValue(recommendation.bookRecallToPpud.legislationReleasedUnder) ||
    recommendation.bookRecallToPpud.legislationReleasedUnder.length === 0
  ) {
    const errorId = 'missingLegislationReleasedUnder'
    errors.push(
      makeErrorObject({
        id: 'legislationReleasedUnder',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (
    !hasValue(recommendation.bookRecallToPpud.custodyType) ||
    recommendation.bookRecallToPpud.custodyType.length === 0
  ) {
    const errorId = 'missingCustodyType'
    errors.push(
      makeErrorObject({
        id: 'custodyType',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (
    !hasValue(recommendation.bookRecallToPpud.probationArea) ||
    recommendation.bookRecallToPpud.probationArea.length === 0
  ) {
    const errorId = 'missingProbationArea'
    errors.push(
      makeErrorObject({
        id: 'probationArea',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (
    !hasValue(recommendation.bookRecallToPpud.policeForce) ||
    recommendation.bookRecallToPpud.policeForce.length === 0
  ) {
    const errorId = 'missingPoliceForce'
    errors.push(
      makeErrorObject({
        id: 'policeForce',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (
    !hasValue(recommendation.bookRecallToPpud.releasingPrison) ||
    recommendation.bookRecallToPpud.releasingPrison.length === 0
  ) {
    const errorId = 'missingReleasingPrison'
    errors.push(
      makeErrorObject({
        id: 'releasingPrison',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (
    !hasValue(recommendation.bookRecallToPpud.mappaLevel) ||
    recommendation.bookRecallToPpud.mappaLevel.length === 0
  ) {
    const errorId = 'missingMappaLevel'
    errors.push(
      makeErrorObject({
        id: 'mappaLevel',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

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
      return 'VeryHigh'
    }
    if (val === 2) {
      return 'High'
    }
    if (val === 3) {
      return 'Medium'
    }
    if (val === 4) {
      return 'Low'
    }
    if (val === 5) {
      return 'Not Applicable'
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
