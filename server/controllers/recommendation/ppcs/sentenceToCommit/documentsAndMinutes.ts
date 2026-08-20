import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import { getSupportingDocuments } from '../../../../data/makeDecisionApiClient'
import { riskOfSeriousHarmLevel } from '../../../recommendations/helpers/rosh'
import { SentenceGroup } from '../../../recommendations/sentenceInformation/formOptions'
import type { FeatureFlags } from '../../../../@types/featureFlags'

export default async function getDocumentsAndMinutes(
  recommendationResponse: RecommendationResponse,
  offenceCourtDescription: string,
  token: string,
  flags: FeatureFlags,
) {
  const documents = await getSupportingDocuments({
    recommendationId: String(recommendationResponse.id),
    token,
    featureFlags: flags,
  })

  const extended = recommendationResponse.sentenceGroup === SentenceGroup.EXTENDED ? 'Yes' : 'No'
  const custody =
    recommendationResponse.prisonOffender?.status === 'ACTIVE IN'
      ? `Yes at ${recommendationResponse.prisonOffender?.locationDescription || 'HMP Prison'}`
      : 'No'
  const rosh = riskOfSeriousHarmLevel(recommendationResponse.currentRoshForPartA)
  const sentencingCourt = offenceCourtDescription || ''

  const backgroundInfo =
    `Extended sentence: ${extended}\n` +
    `Risk of serious harm level: ${rosh}\n` +
    `In custody: ${custody}\n` +
    `Sentencing court: ${sentencingCourt}`

  const moreInfo = recommendationResponse.bookRecallToPpud?.minute

  return { documents, backgroundInfo, moreInfo }
}
