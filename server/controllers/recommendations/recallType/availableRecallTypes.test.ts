import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { availableRecallTypes, availableRecallTypesForRecommendation } from './availableRecallTypes'
import { formOptions } from '../formOptions/formOptions'
import { isFixedTermRecallMandatoryForRecommendation } from '../../../utils/fixedTermRecallUtils'
import { SentenceGroup } from '../sentenceInformation/formOptions'

jest.mock('../../../utils/fixedTermRecallUtils')

describe('availableRecallTypesForRecommendation', () => {
  const recommendation: RecommendationResponse = RecommendationResponseGenerator.generate()

  it('only FTR and No Recall available when FTR is mandatory', () => {
    const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
      ['FIXED_TERM', 'NO_RECALL'].includes(entry.value),
    )
    ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

    const actualAvailableRecallTypes = availableRecallTypesForRecommendation(recommendation)

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })
  it('all types are available when FTR is discretionary', () => {
    ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)

    const actualAvailableRecallTypes = availableRecallTypesForRecommendation(recommendation)

    expect(actualAvailableRecallTypes).toEqual(formOptions.recallType)
  })
})

describe('availableRecallTypes', () => {
  it('only FTR and No Recall available when FTR is mandatory', () => {
    const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
      ['FIXED_TERM', 'NO_RECALL'].includes(entry.value),
    )

    const actualAvailableRecallTypes = availableRecallTypes(true, false)

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })

  it('only Standard and No Recall available when Standard is mandatory', () => {
    const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
      ['STANDARD', 'NO_RECALL'].includes(entry.value),
    )

    const actualAvailableRecallTypes = availableRecallTypes(false, true)

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })

  it(`all types are available when neither FTR nor Standard is mandatory`, () => {
    const actualAvailableRecallTypes = availableRecallTypes(false, false)

    expect(actualAvailableRecallTypes).toEqual(formOptions.recallType)
  })
})

describe('availableRecallTypesForRecommendation', () => {
  describe('Adult SDS sentence', () => {
    const recommendation: RecommendationResponse = RecommendationResponseGenerator.generate({
      sentenceGroup: SentenceGroup.ADULT_SDS,
    })
    it('FTR mandatory -> only FTR and No Recall available', () => {
      const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
        ['FIXED_TERM', 'NO_RECALL'].includes(entry.value),
      )
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

      const actualAvailableRecallTypes = availableRecallTypesForRecommendation(recommendation)

      expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
    })

    it('FTR not mandatory -> only Standard and No Recall available', () => {
      const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
        ['STANDARD', 'NO_RECALL'].includes(entry.value),
      )
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)

      const actualAvailableRecallTypes = availableRecallTypesForRecommendation(recommendation)

      expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
    })
  })

  describe('Youth SDS sentence', () => {
    const recommendation: RecommendationResponse = RecommendationResponseGenerator.generate({
      sentenceGroup: SentenceGroup.YOUTH_SDS,
    })
    it('FTR mandatory -> only FTR and No Recall available', () => {
      const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
        ['FIXED_TERM', 'NO_RECALL'].includes(entry.value),
      )
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

      const actualAvailableRecallTypes = availableRecallTypesForRecommendation(recommendation)

      expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
    })

    it('FTR not mandatory -> Standard, FTR and No Recall available', () => {
      const expectedAvailableRecallTypes = formOptions.recallType
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)

      const actualAvailableRecallTypes = availableRecallTypesForRecommendation(recommendation)

      expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
    })
  })
})
