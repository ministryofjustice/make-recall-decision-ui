import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { PpudSentenceLength } from '../@types/make-recall-decision-api/models/RecommendationResponse'
import CUSTODY_GROUP from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'

const getTotalSentenceLength = (recommendation: RecommendationResponse): PpudSentenceLength | undefined => {
  const total = recommendation?.bookRecallToPpud?.totalSentenceLength
  if (!total || recommendation.bookRecallToPpud.custodyGroup !== CUSTODY_GROUP.DETERMINATE) {
    return undefined
  }
  const selectedOffence = recommendation.nomisIndexOffence?.allOptions?.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
  )
  return selectedOffence?.consecutiveCount > 0 ? total : undefined
}

export default getTotalSentenceLength
