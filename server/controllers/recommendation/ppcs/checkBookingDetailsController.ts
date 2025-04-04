import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../../recommendations/helpers/urls'
import { getRecommendation, searchForPrisonOffender, updateRecommendation } from '../../../data/makeDecisionApiClient'
import { STATUSES } from '../../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import {
  BookRecallToPpud,
  PpudOffender,
  PrisonOffender,
} from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { convertToTitleCase, hasValue, isDefined } from '../../../utils/utils'
import { PrisonOffenderSearchResponse } from '../../../@types/make-recall-decision-api/models/PrisonOffenderSearchResponse'
import { formatDateTimeFromIsoString } from '../../../utils/dates/format'
import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'

import { checkIfAddressesAreEmpty } from '../../../utils/addressChecker'
import { currentHighestRosh } from '../../recommendations/helpers/rosh'
import { NamedFormError } from '../../../@types/pagesForms'
import { determinePpudEstablishment } from './determinePpudEstablishment'

async function get(_: Request, res: Response, next: NextFunction) {
  const {
    user: { token },
    recommendation,
    statuses,
    flags,
  } = res.locals

  const spoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.SPO_SIGNED)

  const acoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.ACO_SIGNED)

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
          agencyId: nomisPrisonOffender.agencyId,
          agencyDescription: nomisPrisonOffender.agencyDescription,
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

  const edited = {} as Record<string, boolean>

  // if recommendation does not have working values for book to ppud, add them.
  if (!hasValue(recommendation.bookRecallToPpud)) {
    let firstName = ''
    let middleName = ''
    let lastName = ''
    let dateOfBirth = ''
    let currentEstablishment = ''

    if (recommendation.prisonOffender) {
      firstName = convertToTitleCaseIfRequired(recommendation.prisonOffender.firstName)
      middleName = convertToTitleCaseIfRequired(recommendation.prisonOffender.middleName)
      lastName = convertToTitleCaseIfRequired(recommendation.prisonOffender.lastName)
      dateOfBirth = recommendation.prisonOffender.dateOfBirth
      currentEstablishment = await determinePpudEstablishment(recommendation, token)
    }

    const sentToPpcs = (statuses as RecommendationStatusResponse[])
      .filter(s => s.active)
      .find(s => s.name === STATUSES.SENT_TO_PPCS)

    valuesToSave.bookRecallToPpud = {
      firstNames: `${firstName} ${middleName}`.trim(),
      lastName,
      dateOfBirth,
      prisonNumber: recommendation.prisonOffender?.bookingNo,
      cro: recommendation.prisonOffender?.cro,
      receivedDateTime: sentToPpcs?.created,
      currentEstablishment,
    } as BookRecallToPpud
    recommendation.bookRecallToPpud = valuesToSave.bookRecallToPpud
  } else {
    if (
      recommendation.bookRecallToPpud.firstNames !==
      `${convertToTitleCaseIfRequired(recommendation.prisonOffender?.firstName)} ${convertToTitleCaseIfRequired(recommendation.prisonOffender?.middleName)}`.trim()
    ) {
      edited.firstNames = true
    }

    if (
      recommendation.bookRecallToPpud.lastName !== convertToTitleCaseIfRequired(recommendation.prisonOffender?.lastName)
    ) {
      edited.lastName = true
    }

    if (recommendation.bookRecallToPpud.dateOfBirth !== recommendation.prisonOffender?.dateOfBirth) {
      edited.dateOfBirth = true
    }

    if (recommendation.bookRecallToPpud.prisonNumber !== recommendation.prisonOffender?.bookingNo) {
      edited.prisonNumber = true
    }
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

  if (hasValue(recommendation.ppudOffender) && hasValue(recommendation.prisonOffender)) {
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

  // Checks if all addresses are effectively empty,
  // defined as a single-item array with all key attributes set to empty strings and `noFixedAbode` set to false.

  const { addresses } = res.locals.recommendation.personOnProbation
  let hasLastKnownAddress: boolean = false

  if (addresses) {
    hasLastKnownAddress = !checkIfAddressesAreEmpty(addresses)
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'checkBookingDetails',
    },
    errorMessage,
    spoSigned,
    acoSigned,
    practitioner: recommendation.practitionerForPartA
      ? recommendation.practitionerForPartA
      : recommendation.whoCompletedPartA,
    currentHighestRosh: currentHighestRosh(recommendation.currentRoshForPartA),
    warnings,
    edited,
    hasLastKnownAddress,
  }

  res.render(`pages/recommendations/checkBookingDetails`)
  next()

  function convertToTitleCaseIfRequired(name: string): string {
    return requiresTitleCaseConversion(name) ? convertToTitleCase(name) : name
  }

  function requiresTitleCaseConversion(name: string): boolean {
    return name && name.toUpperCase() === name
  }
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    urlInfo,
  } = res.locals

  const errors: NamedFormError[] = []

  const { bookRecallToPpud } = await getRecommendation(recommendationId, token)

  validateBookRecallToPpudField(bookRecallToPpud, 'gender', 'missingGender', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'ethnicity', 'missingEthnicity', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'legislationReleasedUnder', 'missingLegislationReleasedUnder', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'custodyType', 'missingCustodyType', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'currentEstablishment', 'missingCurrentEstablishment', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'probationArea', 'missingProbationArea', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'policeForce', 'missingPoliceForce', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'releasingPrison', 'missingReleasingPrison', errors)

  validateBookRecallToPpudField(bookRecallToPpud, 'mappaLevel', 'missingMappaLevel', errors)

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'select-index-offence', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

  next()

  function validateBookRecallToPpudField(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    bookRecallToPpud: BookRecallToPpud,
    fieldName: keyof BookRecallToPpud,
    errorId: string,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    errors: NamedFormError[]
  ) {
    if (!hasValue(bookRecallToPpud[fieldName]) || bookRecallToPpud[fieldName].length === 0) {
      errors.push(
        makeErrorObject({
          id: fieldName,
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
  }
}

export default { get, post }
