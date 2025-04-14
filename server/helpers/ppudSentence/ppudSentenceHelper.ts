import { PpudDetailsSentence } from '../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

const determinateCustodyTypes = ['Determinate', 'EDS', 'EDS (non parole)']

const indeterminateCustodyTypes = [
  'IPP',
  'DPP',
  'Mandatory (MLP)',
  'Discretionary',
  'Discretionary (Tariff Expired)',
  'Automatic',
]

export function getDeterminateSentences(sentences: PpudDetailsSentence[]): PpudDetailsSentence[] {
  return getSentencesByCustodyType(sentences, determinateCustodyTypes)
}

export function getIndeterminateSentences(sentences: PpudDetailsSentence[]): PpudDetailsSentence[] {
  return getSentencesByCustodyType(sentences, indeterminateCustodyTypes)
}

function getSentencesByCustodyType(sentences: PpudDetailsSentence[], custodyTypes: string[]) {
  return sentences.filter(sentence => custodyTypes.includes(sentence.custodyType))
}

export function getCustodyGroup(recommendation: RecommendationResponse): CUSTODY_GROUP {
  return recommendation.isIndeterminateSentence ? CUSTODY_GROUP.INDETERMINATE : CUSTODY_GROUP.DETERMINATE
}
