import { PpudSentenceLength } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { pluralise } from '../formatting'

export const formatPpudSentenceLength = ({ partYears, partMonths, partDays }: PpudSentenceLength) => {
  const sentenceLengthPeriods: string[] = []
  if (partYears) sentenceLengthPeriods.push(`${partYears} ${pluralise('year', partYears)}`)
  if (partMonths) sentenceLengthPeriods.push(`${partMonths} ${pluralise('month', partMonths)}`)
  if (partDays) sentenceLengthPeriods.push(`${partDays} ${pluralise('day', partDays)}`)

  return sentenceLengthPeriods.join(', ')
}
