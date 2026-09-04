import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import CUSTODY_GROUP from '../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

function getSentenceToCommitRoute(recommendation: RecommendationResponse): string {
  if (recommendation.bookRecallToPpud.custodyGroup === CUSTODY_GROUP.INDETERMINATE) {
    return 'sentence-to-commit-indeterminate'
  }

  if (recommendation.ppudOffender) {
    return 'sentence-to-commit-existing-offender'
  }

  return 'sentence-to-commit'
}

export default getSentenceToCommitRoute
