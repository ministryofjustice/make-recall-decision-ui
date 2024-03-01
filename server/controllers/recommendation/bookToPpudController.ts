import { NextFunction, Request, Response } from 'express'
import {
  getRecommendation,
  getStatuses,
  ppudCreateOffender,
  ppudCreateRecall,
  ppudUpdateOffence,
  ppudUpdateOffender,
  ppudUpdateRelease,
  ppudUpdateSentence,
  updateRecommendation,
  updateStatuses,
} from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'
import { PpudAddress } from '../../@types/make-recall-decision-api/models/PpudCreateOffenderRequest'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { PpudSentence } from '../../@types/make-recall-decision-api/models/RecommendationResponse'

async function get(_: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'bookToPpud',
    },
  }

  res.render(`pages/recommendations/bookToPpud`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    urlInfo,
    flags,
  } = res.locals

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationResponse

  const isInCustody = recommendation.prisonOffender?.status === 'ACTIVE IN'

  const statuses = await getStatuses({
    recommendationId: String(recommendation.id),
    token,
  })

  let address
  if (recommendation.personOnProbation.addresses && recommendation.personOnProbation.addresses.length > 0) {
    const addr = recommendation.personOnProbation.addresses[0]
    if (addr.noFixedAbode) {
      address = {
        premises: '',
        line1: 'No Fixed Abode',
        line2: '',
        postcode: '',
        phoneNumber: '',
      }
    } else {
      address = {
        premises: addr.line1 || '',
        line1: addr.line2 || '',
        line2: addr.town || '',
        postcode: addr.postcode || '',
        phoneNumber: '',
      }
    }
  }

  const additionalAddresses: PpudAddress[] = []
  if (!recommendation.isMainAddressWherePersonCanBeFound?.selected) {
    additionalAddresses.push({
      premises: recommendation.isMainAddressWherePersonCanBeFound?.details || '',
      line1: '',
      line2: '',
      postcode: '',
      phoneNumber: '',
    })
  }
  try {
    let offenderId
    let sentenceId
    if (recommendation.ppudOffender) {
      offenderId = recommendation.ppudOffender.id
      const sentences = recommendation.ppudOffender.sentences as PpudSentence[]
      sentenceId = sentences.find(s => s.id === recommendation.bookRecallToPpud.ppudSentenceId)?.id

      await ppudUpdateOffender(token, offenderId, {
        nomsId: recommendation.personOnProbation.nomsNumber,
        croNumber: recommendation.personOnProbation.croNumber,
        dateOfBirth: recommendation.bookRecallToPpud?.dateOfBirth,
        ethnicity: recommendation.bookRecallToPpud?.ethnicity,
        firstNames: recommendation.bookRecallToPpud?.firstNames,
        familyName: recommendation.bookRecallToPpud?.lastName,
        gender: recommendation.bookRecallToPpud?.gender,
        isInCustody,
        prisonNumber: recommendation.bookRecallToPpud?.prisonNumber,
        address,
        additionalAddresses,
      })
    } else {
      const createOffenderResponse = await ppudCreateOffender(token, {
        nomsId: recommendation.personOnProbation.nomsNumber,
        croNumber: recommendation.personOnProbation.croNumber,
        custodyType: recommendation.bookRecallToPpud?.custodyType,
        dateOfBirth: recommendation.bookRecallToPpud?.dateOfBirth,
        dateOfSentence: recommendation.bookRecallToPpud?.sentenceDate,
        ethnicity: recommendation.bookRecallToPpud?.ethnicity,
        firstNames: recommendation.bookRecallToPpud?.firstNames,
        familyName: recommendation.bookRecallToPpud?.lastName,
        gender: recommendation.bookRecallToPpud?.gender,
        isInCustody,
        indexOffence: recommendation.bookRecallToPpud?.indexOffence,
        mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
        prisonNumber: recommendation.bookRecallToPpud?.prisonNumber,
        address,
        additionalAddresses,
      })

      offenderId = createOffenderResponse.offender.id
      sentenceId = createOffenderResponse.offender.sentence.id

      // write ppudOffender details, so that create offender is never called again, but rather update offender.
      await updateRecommendation({
        recommendationId: String(recommendationId),
        valuesToSave: {
          ppudOffender: {
            id: createOffenderResponse.offender.id,
            croOtherNumber: recommendation.personOnProbation.croNumber,
            dateOfBirth: recommendation.bookRecallToPpud?.dateOfBirth,
            ethnicity: recommendation.bookRecallToPpud?.ethnicity,
            familyName: recommendation.bookRecallToPpud?.lastName,
            firstNames: recommendation.bookRecallToPpud?.firstNames,
            gender: recommendation.bookRecallToPpud?.gender,
            immigrationStatus: 'N/A',
            nomsId: recommendation.personOnProbation?.nomsNumber,
            prisonerCategory: 'N/A',
            prisonNumber: recommendation.bookRecallToPpud?.prisonNumber,
            sentences: [],
            status: 'N/A',
            youngOffender: 'N/A',
          },
        },
        token,
        featureFlags: flags,
      })
    }

    const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
      o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
    )

    const offenceTerm = nomisOffence.terms.find(term => term.code === 'IMP')

    const sentenceLength =
      offenceTerm != null
        ? {
            partDays: offenceTerm?.days || 0,
            partMonths: offenceTerm?.months || 0,
            partYears: offenceTerm?.years || 0,
          }
        : null

    await ppudUpdateSentence(token, offenderId, sentenceId, {
      custodyType: recommendation.bookRecallToPpud?.custodyType,
      mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
      dateOfSentence: nomisOffence.sentenceDate,
      licenceExpiryDate: nomisOffence.licenceExpiryDate,
      releaseDate: nomisOffence.releaseDate,
      sentenceLength,
      sentenceExpiryDate: nomisOffence.sentenceEndDate,
      sentencingCourt: nomisOffence.courtDescription,
    })

    await ppudUpdateOffence(token, offenderId, sentenceId, {
      indexOffence: recommendation.bookRecallToPpud?.indexOffence,
      dateOfIndexOffence: nomisOffence.offenceDate,
    })

    const acoSigned = (statuses as RecommendationStatusResponse[])
      .filter(s => s.active)
      .find(s => s.name === STATUSES.ACO_SIGNED)

    const releaseResponse = await ppudUpdateRelease(token, offenderId, sentenceId, {
      dateOfRelease: nomisOffence.releaseDate,
      postRelease: {
        assistantChiefOfficer: {
          name: acoSigned.createdByUserFullName,
          faxEmail: acoSigned.emailAddress,
        },
        offenderManager: {
          name:
            (recommendation.whoCompletedPartA?.isPersonProbationPractitionerForOffender
              ? recommendation.whoCompletedPartA?.name
              : recommendation.practitionerForPartA?.name) || '',
          faxEmail:
            (recommendation.whoCompletedPartA?.isPersonProbationPractitionerForOffender
              ? recommendation.whoCompletedPartA?.email
              : recommendation.practitionerForPartA?.email) || '',
          telephone:
            (recommendation.whoCompletedPartA?.isPersonProbationPractitionerForOffender
              ? recommendation.whoCompletedPartA?.telephone
              : recommendation.practitionerForPartA?.telephone) || '',
        },
        spoc: {
          name: recommendation.bookRecallToPpud.policeForce,
          faxEmail: '',
        },
        probationService: recommendation.bookRecallToPpud.probationArea,
      },
      releasedFrom: recommendation.bookRecallToPpud.releasingPrison,
      releasedUnder: recommendation.bookRecallToPpud.legislationReleasedUnder,
    })

    await ppudCreateRecall(token, offenderId, releaseResponse.release.id, {
      decisionDateTime: recommendation.bookRecallToPpud.decisionDateTime,
      isExtendedSentence: recommendation.isExtendedSentence,
      isInCustody,
      mappaLevel: recommendation.bookRecallToPpud.mappaLevel,
      policeForce: recommendation.bookRecallToPpud.policeForce,
      probationArea: recommendation.bookRecallToPpud.probationArea,
      receivedDateTime: recommendation.bookRecallToPpud.receivedDateTime,
      riskOfContrabandDetails: recommendation.hasContrabandRisk?.details || '',
      riskOfSeriousHarmLevel: currentHighestRosh({
        riskToChildren: String(recommendation.currentRoshForPartA.riskToChildren),
        riskToPublic: String(recommendation.currentRoshForPartA.riskToPublic),
        riskToKnownAdult: String(recommendation.currentRoshForPartA.riskToKnownAdult),
        riskToPrisoners: String(recommendation.currentRoshForPartA.riskToPrisoners),
        riskToStaff: String(recommendation.currentRoshForPartA.riskToStaff),
      }),
    })
  } catch (err) {
    if (err.status !== undefined) {
      const errorId = 'ppudBookingError'
      req.session.errors = [
        makeErrorObject({
          id: 'ppudBooking',
          text: strings.errors[errorId],
          errorId,
        }),
      ]
      return res.redirect(303, req.originalUrl)
    }
    throw err
  }

  await updateStatuses({
    recommendationId,
    token,
    activate: [STATUSES.BOOKED_TO_PPUD, STATUSES.REC_CLOSED],
    deActivate: [],
  })

  const nextPagePath = nextPageLinkUrl({ nextPageId: 'booked-to-ppud', urlInfo })
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
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
      return 'NotApplicable'
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
