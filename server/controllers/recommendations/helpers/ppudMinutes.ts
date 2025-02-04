import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { riskOfSeriousHarmLevel } from './rosh'

export const generateRecallMinuteText = (recommendationResponse: RecommendationResponse) => {
  const extended = recommendationResponse.isExtendedSentence ? 'YES' : 'NO'
  const custody = recommendationResponse.prisonOffender?.status === 'ACTIVE IN' ? 'YES at HMP' : 'NO'
  const rosh = riskOfSeriousHarmLevel(recommendationResponse.currentRoshForPartA)?.toUpperCase()
  const docMinute = recommendationResponse.bookRecallToPpud?.minute
    ? `\nNotes regarding documents added from Consider a Recall:\n${recommendationResponse.bookRecallToPpud?.minute}`
    : ''

  return (
    `BACKGROUND INFO \n` +
    `Extended sentence: ${extended}\n` +
    `Risk of Serious Harm Level: ${rosh}\n` +
    `In custody: ${custody}${docMinute}`
  )
}
