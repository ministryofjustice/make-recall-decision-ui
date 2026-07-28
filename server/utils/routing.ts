import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'
import ppPaths from '../routes/paths/pp.paths'

function recallTypePath(recommendation: RecommendationResponse) {
  switch (recommendation.sentenceGroup) {
    case SentenceGroup.EXTENDED:
      return ppPaths.recallTypeExtended
    case SentenceGroup.INDETERMINATE:
      return ppPaths.recallTypeIndeterminate
    default:
      return ppPaths.recallType
  }
}

export default recallTypePath
