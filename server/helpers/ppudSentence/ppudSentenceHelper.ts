import { PpudDetailsSentence } from '../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { determinateCustodyTypes, indeterminateCustodyTypes } from './custodyTypes'
import { formatJSDate } from '../../utils/dates/formatting'

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
  return sentences?.filter(sentence => custodyTypes.includes(sentence.custodyType)) ?? []
}

export function getCustodyGroup(recommendation: RecommendationResponse): CUSTODY_GROUP {
  return recommendation.isIndeterminateSentence ? CUSTODY_GROUP.INDETERMINATE : CUSTODY_GROUP.DETERMINATE
}

export type SentencesByDate = {
  dateOfSentence: string
  sentences: PpudDetailsSentence[]
}

export type CourtGroup = {
  court: string
  sentencesByDate: SentencesByDate[]
}

export function groupSentencesByCourtAndDate(ppudSentences: PpudDetailsSentence[]): CourtGroup[] {
  const byCourt = ppudSentences.reduce(
    (acc: Record<string, PpudDetailsSentence[]>, s) => {
      const court = s.sentencingCourt || 'Unknown'
      if (!acc[court]) acc[court] = []
      acc[court].push(s)
      return acc
    },
    {} as Record<string, PpudDetailsSentence[]>
  )

  return Object.entries(byCourt).map(([court, courtSentences]) => {
    // group by dateOfSentence (formatted)
    const byDate: Record<string, PpudDetailsSentence[]> = {}
    courtSentences.forEach(s => {
      const dateKey = formatJSDate(s.dateOfSentence) // e.g. "20 November 2097"
      if (!byDate[dateKey]) byDate[dateKey] = []
      byDate[dateKey].push(s)
    })

    const sentencesByDate: SentencesByDate[] = Object.entries(byDate).map(([dateOfSentence, sentences]) => ({
      dateOfSentence,
      sentences,
    }))

    return { court, sentencesByDate }
  })
}
