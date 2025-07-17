import { PpudDetailsSentence } from '../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { determinateCustodyTypes, indeterminateCustodyTypes } from './custodyTypes'

export function getDeterminateSentences(sentences: PpudDetailsSentence[]): PpudDetailsSentence[] {
  return getSentencesByCustodyType(
    sentences,
    determinateCustodyTypes.map(ct => ct.toString())
  )
}

export function getIndeterminateSentences(sentences: PpudDetailsSentence[]): PpudDetailsSentence[] {
  return getSentencesByCustodyType(
    sentences,
    indeterminateCustodyTypes.map(ct => ct.toString())
  )
}

function getSentencesByCustodyType(sentences: PpudDetailsSentence[], custodyTypes: string[]) {
  return sentences.filter(sentence => custodyTypes.includes(sentence.custodyType))
}

export function getCustodyGroup(recommendation: RecommendationResponse): CUSTODY_GROUP {
  return recommendation.isIndeterminateSentence ? CUSTODY_GROUP.INDETERMINATE : CUSTODY_GROUP.DETERMINATE
}
