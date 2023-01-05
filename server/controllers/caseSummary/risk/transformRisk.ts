import { RiskResponse } from '../../../@types/make-recall-decision-api'
import { sortListByDateField } from '../../../utils/dates'

export const transformRisk = (caseSummary: RiskResponse) => {
  let timeline: unknown[] = []
  if (!caseSummary.roshHistory.error && Array.isArray(caseSummary.roshHistory.registrations)) {
    timeline = caseSummary.roshHistory.registrations
      .filter(item => ['RHRH', 'RVHR'].includes(item.type.code))
      .map(({ startDate, notes, type }) => ({
        date: startDate,
        notes,
        level: type.code === 'RHRH' ? 'HIGH' : 'VERY_HIGH',
        type: 'RoSH',
      }))
  }
  if (!caseSummary.predictorScores.error) {
    timeline = [...timeline, ...caseSummary.predictorScores.historical]
  }
  if (timeline.length) {
    timeline = sortListByDateField({ list: timeline, dateKey: 'date', newestFirst: true })
  }
  return {
    ...caseSummary,
    timeline,
  }
}
