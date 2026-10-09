import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import CUSTODY_GROUP from '../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import ppcsPaths from '../../../routes/paths/ppcs.paths'

function getSentenceToCommitRoute(recommendation: RecommendationResponse): string {
  if (recommendation.bookRecallToPpud.custodyGroup === CUSTODY_GROUP.INDETERMINATE) {
    return ppcsPaths.sentenceToCommitIndeterminate
  }

  if (recommendation.ppudOffender) {
    return ppcsPaths.sentenceToCommitExistingOffender
  }

  return ppcsPaths.sentenceToCommit
}

export default getSentenceToCommitRoute
