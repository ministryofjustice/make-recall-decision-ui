import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { availableRecallTypes, availableRecallTypesForRecommendation } from './availableRecallTypes'
import { formOptions } from '../formOptions/formOptions'
import { isFixedTermRecallMandatoryForRecommendation } from '../../../utils/fixedTermRecallUtils'

jest.mock('../../../utils/fixedTermRecallUtils')

describe('availableRecallTypes', () => {
  it('only FTR and No Recall available when FTR is mandatory', () => {
    const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
      ['FIXED_TERM', 'NO_RECALL'].includes(entry.value)
    )

    const actualAvailableRecallTypes = availableRecallTypes(true)

    expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })

  it(`all types are available when FTR is discretionary`, () => {
    const actualAvailableRecallTypes = availableRecallTypes(false)

    expect(actualAvailableRecallTypes).toEqual(formOptions.recallType)
  })
})

describe('availableRecallTypesForRecommendation', () => {
  const recommendation: RecommendationResponse = RecommendationResponseGenerator.generate()

  it('only FTR and No Recall available when FTR is mandatory', () => {
    const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
      ['FIXED_TERM', 'NO_RECALL'].includes(entry.value)
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
