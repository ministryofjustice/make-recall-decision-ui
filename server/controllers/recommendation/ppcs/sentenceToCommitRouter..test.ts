import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import CUSTODY_GROUP from '../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import ppcsPaths from '../../../routes/paths/ppcs.paths'
import getSentenceToCommitRoute from './sentenceToCommitRouter'

describe('getSentenceToCommitRoute', () => {
  const baseRecommendation = {
    bookRecallToPpud: {},
  } as RecommendationResponse

  it('returns sentence-to-commit-indeterminate when custody group is indeterminate', () => {
    const recommendation = {
      ...baseRecommendation,
      bookRecallToPpud: {
        custodyGroup: CUSTODY_GROUP.INDETERMINATE,
      },
    } as RecommendationResponse

    expect(getSentenceToCommitRoute(recommendation)).toBe(ppcsPaths.sentenceToCommitIndeterminate)
  })

  it('returns sentence-to-commit-existing-offender when recommendation has a PPUD offender', () => {
    const recommendation = {
      ...baseRecommendation,
      ppudOffender: {},
    } as RecommendationResponse

    expect(getSentenceToCommitRoute(recommendation)).toBe(ppcsPaths.sentenceToCommitExistingOffender)
  })

  it('returns sentence-to-commit when there is no PPUD offender and custody group is not indeterminate', () => {
    const recommendation = {
      ...baseRecommendation,
      bookRecallToPpud: {
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
      },
    } as RecommendationResponse

    expect(getSentenceToCommitRoute(recommendation)).toBe(ppcsPaths.sentenceToCommit)
  })

  it('returns sentence-to-commit-indeterminate when custody group is indeterminate even when a PPUD offender exists', () => {
    const recommendation = {
      ...baseRecommendation,
      bookRecallToPpud: {
        custodyGroup: CUSTODY_GROUP.INDETERMINATE,
      },
      ppudOffender: {},
    } as RecommendationResponse

    expect(getSentenceToCommitRoute(recommendation)).toBe(ppcsPaths.sentenceToCommitIndeterminate)
  })
})
