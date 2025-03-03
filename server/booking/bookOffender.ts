import { PpudAddress } from '../@types/make-recall-decision-api/models/PpudCreateOffenderRequest'
import { PpudSentence, RecommendationResponse } from '../@types/make-recall-decision-api/models/RecommendationResponse'
import { ppudCreateOffender, ppudUpdateOffender, updateRecommendation } from '../data/makeDecisionApiClient'
import { FeatureFlags } from '../@types/featureFlags'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'

export default async function bookOffender(
  bookingMemento: BookingMemento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== StageEnum.STARTED) {
    return memento
  }

  const isInCustody = recommendation.prisonOffender?.status === 'ACTIVE IN'

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

  if (recommendation.ppudOffender) {
    memento.offenderId = recommendation.ppudOffender.id
    const sentences = recommendation.ppudOffender.sentences as PpudSentence[]
    memento.sentenceId = sentences.find(s => s.id === recommendation.bookRecallToPpud.ppudSentenceId)?.id

    await ppudUpdateOffender(token, memento.offenderId, {
      nomsId: recommendation.personOnProbation.nomsNumber,
      croNumber: recommendation.bookRecallToPpud.cro,
      dateOfBirth: recommendation.bookRecallToPpud?.dateOfBirth,
      ethnicity: recommendation.bookRecallToPpud?.ethnicity,
      firstNames: recommendation.bookRecallToPpud?.firstNames,
      familyName: recommendation.bookRecallToPpud?.lastName,
      gender: recommendation.bookRecallToPpud?.gender,
      isInCustody,
      establishment: recommendation.bookRecallToPpud?.currentEstablishment,
      prisonNumber: recommendation.bookRecallToPpud?.prisonNumber,
      address,
      additionalAddresses,
    })
  } else {
    const createOffenderResponse = await ppudCreateOffender(token, {
      nomsId: recommendation.personOnProbation.nomsNumber,
      croNumber: recommendation.bookRecallToPpud?.cro,
      custodyType: recommendation.bookRecallToPpud?.custodyType,
      dateOfBirth: recommendation.bookRecallToPpud?.dateOfBirth,
      dateOfSentence: recommendation.bookRecallToPpud?.sentenceDate,
      ethnicity: recommendation.bookRecallToPpud?.ethnicity,
      firstNames: recommendation.bookRecallToPpud?.firstNames,
      familyName: recommendation.bookRecallToPpud?.lastName,
      gender: recommendation.bookRecallToPpud?.gender,
      isInCustody,
      establishment: recommendation.bookRecallToPpud?.currentEstablishment,
      indexOffence: recommendation.bookRecallToPpud?.indexOffence,
      mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
      prisonNumber: recommendation.bookRecallToPpud?.prisonNumber,
      address,
      additionalAddresses,
    })

    memento.offenderId = createOffenderResponse.offender.id
    memento.sentenceId = createOffenderResponse.offender.sentence.id

    // write ppudOffender details, so that create offender is never called again, but rather update offender.
    await updateRecommendation({
      recommendationId: String(recommendation.id),
      valuesToSave: {
        ppudOffender: {
          id: createOffenderResponse.offender.id,
          croOtherNumber: recommendation.bookRecallToPpud?.cro ?? '',
          dateOfBirth: recommendation.bookRecallToPpud?.dateOfBirth,
          ethnicity: recommendation.bookRecallToPpud?.ethnicity,
          familyName: recommendation.bookRecallToPpud?.lastName,
          firstNames: recommendation.bookRecallToPpud?.firstNames,
          gender: recommendation.bookRecallToPpud?.gender,
          immigrationStatus: 'N/A',
          establishment: recommendation.bookRecallToPpud?.currentEstablishment,
          nomsId: recommendation.personOnProbation?.nomsNumber,
          prisonerCategory: 'N/A',
          prisonNumber: recommendation.bookRecallToPpud?.prisonNumber,
          sentences: [],
          status: 'N/A',
          youngOffender: 'N/A',
        },
      },
      token,
      featureFlags,
    })
  }

  memento.stage = StageEnum.OFFENDER_BOOKED
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
