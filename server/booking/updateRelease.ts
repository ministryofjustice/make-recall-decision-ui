import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { STATUSES } from '../middleware/recommendationStatusCheck'
import { getStatuses, ppudUpdateRelease, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'
import { CUSTODY_GROUP } from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'

function calculateReleaseDate(recommendation: RecommendationResponse) {
  const { custodyGroup } = recommendation.bookRecallToPpud
  switch (custodyGroup) {
    case CUSTODY_GROUP.DETERMINATE:
      // eslint-disable-next-line no-case-declarations
      const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
        o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
      )
      return nomisOffence.releaseDate
    case CUSTODY_GROUP.INDETERMINATE:
      return recommendation.bookRecallToPpud.ppudIndeterminateSentenceData.releaseDate
    default:
      custodyGroup satisfies never
  }
}

export default async function updateRelease(
  bookingMemento: BookingMemento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== StageEnum.OFFENCE_BOOKED) {
    return memento
  }

  const releaseDate = calculateReleaseDate(recommendation)

  const statuses = await getStatuses({
    recommendationId: String(recommendation.id),
    token,
  })

  const acoSigned = (statuses as RecommendationStatusResponse[])
    .filter(s => s.active)
    .find(s => s.name === STATUSES.ACO_SIGNED)

  const releaseResponse = await ppudUpdateRelease(token, memento.offenderId, memento.sentenceId, {
    dateOfRelease: releaseDate,
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

  memento.releaseId = releaseResponse.release.id
  memento.stage = StageEnum.RELEASE_BOOKED
  memento.failed = undefined
  memento.failedMessage = undefined

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookingMemento: memento,
    },
    token,
    featureFlags,
  })

  return memento
}
