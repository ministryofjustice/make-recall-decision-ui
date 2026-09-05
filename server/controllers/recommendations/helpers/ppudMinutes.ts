import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { riskOfSeriousHarmLevel } from './rosh'
import { SentenceGroup } from '../sentenceInformation/formOptions'

const generateRecallMinuteText = (recommendationResponse: RecommendationResponse) => {
  const extended = recommendationResponse.sentenceGroup === SentenceGroup.EXTENDED ? 'Yes' : 'No'

  const custody =
    recommendationResponse.prisonOffender?.status === 'ACTIVE IN'
      ? `Yes${recommendationResponse.prisonOffender?.locationDescription ? ` (at HMP ${recommendationResponse.prisonOffender?.locationDescription})` : ''}`
      : 'No'

  const rosh = riskOfSeriousHarmLevel(recommendationResponse.currentRoshForPartA)?.toUpperCase()

  const offence = recommendationResponse.nomisIndexOffence?.allOptions?.find(
    option => option.offenderChargeId === recommendationResponse.nomisIndexOffence.selected,
  )

  const sentencingCourt = offence?.courtDescription || ''

  return (
    `Background information\n` +
    `Extended sentence: ${extended}\n` +
    `Risk of serious harm level: ${rosh}\n` +
    `In custody: ${custody}\n` +
    `Sentencing court: ${sentencingCourt}\n\n` +
    `More information\n`
  )
}

export default generateRecallMinuteText
