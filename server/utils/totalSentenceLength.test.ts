import getTotalSentenceLength from './totalSentenceLength'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import CUSTODY_GROUP from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RecommendationResponse } from '../@types/make-recall-decision-api'

describe('getTotalSentenceLength', () => {
  const totalSentenceLength = { partYears: 3, partMonths: 4, partDays: 5 }

  const build = ({
    custodyGroup = CUSTODY_GROUP.DETERMINATE,
    consecutiveCount = 2,
    total = totalSentenceLength,
  }: {
    custodyGroup?: CUSTODY_GROUP
    consecutiveCount?: number
    total?: typeof totalSentenceLength | null
  } = {}): RecommendationResponse => {
    const recommendation = RecommendationResponseGenerator.generate({
      bookRecallToPpud: { custodyGroup },
      nomisIndexOffence: { selectedIndex: 0 },
    })
    recommendation.nomisIndexOffence.allOptions[0].consecutiveCount = consecutiveCount
    recommendation.bookRecallToPpud.totalSentenceLength = total
    return recommendation
  }

  it('returns the total for a determinate sentence in a consecutive sequence', () => {
    expect(getTotalSentenceLength(build())).toEqual(totalSentenceLength)
  })
  it('returns undefined when no total has been entered', () => {
    expect(getTotalSentenceLength(build({ total: null }))).toBeUndefined()
  })
  it('returns undefined when the selected offence has no consecutive sentences', () => {
    expect(getTotalSentenceLength(build({ consecutiveCount: null }))).toBeUndefined()
    expect(getTotalSentenceLength(build({ consecutiveCount: 0 }))).toBeUndefined()
  })
  it('returns undefined for an indeterminate sentence', () => {
    expect(getTotalSentenceLength(build({ custodyGroup: CUSTODY_GROUP.INDETERMINATE }))).toBeUndefined()
  })
  it('handles a missing recommendation / bookRecallToPpud', () => {
    expect(getTotalSentenceLength(undefined)).toBeUndefined()
    expect(getTotalSentenceLength({} as RecommendationResponse)).toBeUndefined()
  })
})
