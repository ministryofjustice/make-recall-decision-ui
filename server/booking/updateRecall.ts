import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudCreateRecall, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMomento from './BookingMomento'
import { StageEnum } from './StageEnum'

export default async function updateRecall(
  bookingMomento: BookingMomento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const momento = { ...bookingMomento }

  if (momento.stage !== StageEnum.RELEASE_BOOKED) {
    return momento
  }

  const isInCustody = recommendation.prisonOffender?.status === 'ACTIVE IN'

  await ppudCreateRecall(token, momento.offenderId, momento.releaseId, {
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

  momento.stage = StageEnum.RECALL_BOOKED
  momento.failed = undefined
  momento.failedMessage = undefined

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookingMomento: momento,
    },
    token,
    featureFlags,
  })

  return momento
}

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
