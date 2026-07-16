import ppPaths from '../routes/paths/pp.paths'
import recallTypePath from './routing'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'

describe('recallTypePath', () => {
  Object.values(SentenceGroup).forEach(sentenceGroup => {
    let expectedPath: string
    // We deliberately don't have a default case here because we want to ensure that all sentence groups are handled as
    // expected. If we ever add another sentence group and forget to update this function, this test should fail
    // eslint-disable-next-line default-case
    switch (sentenceGroup) {
      case SentenceGroup.ADULT_SDS:
      case SentenceGroup.YOUTH_SDS:
        expectedPath = ppPaths.recallType
        break
      case SentenceGroup.EXTENDED:
        expectedPath = ppPaths.recallTypeExtended
        break
      case SentenceGroup.INDETERMINATE:
        expectedPath = ppPaths.recallTypeIndeterminate
        break
    }

    it(`should return ${expectedPath} for ${sentenceGroup}`, () => {
      const recommendation = RecommendationResponseGenerator.generate({
        sentenceGroup,
      })

      const path = recallTypePath(recommendation)

      expect(path).toEqual(expectedPath)
    })
  })
})
