import { availableRecallTypes, availableRecallTypesForRecommendation } from './availableRecallTypes'
import { formOptions } from '../formOptions/formOptions'
import {
  isFixedTermRecallMandatoryForRecommendation,
  isStandardRecallMandatoryForRecommendation,
} from '../../../utils/fixedTermRecallUtils'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'

jest.mock('../../../utils/fixedTermRecallUtils')

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
  const recommendation = RecommendationResponseGenerator.generate()

  ;[true, false].forEach(ftr56SentenceConviction => {
    describe(`with FTR56 sentence conviction flag set to ${ftr56SentenceConviction}`, () => {
      it('FTR mandatory -> only FTR and No Recall available', () => {
        const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
          ['FIXED_TERM', 'NO_RECALL'].includes(entry.value),
        )
        ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

        const actualAvailableRecallTypes = availableRecallTypesForRecommendation(
          recommendation,
          ftr56SentenceConviction,
        )

        expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
        expect(isFixedTermRecallMandatoryForRecommendation).toHaveBeenCalledWith(
          recommendation,
          ftr56SentenceConviction,
        )
        expect(isStandardRecallMandatoryForRecommendation).toHaveBeenCalledWith(recommendation, ftr56SentenceConviction)
      })

      it('FTR not mandatory & Standard mandatory -> only Standard and No Recall available', () => {
        const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
          ['STANDARD', 'NO_RECALL'].includes(entry.value),
        )
        ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)
        ;(isStandardRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(true)

        const actualAvailableRecallTypes = availableRecallTypesForRecommendation(
          recommendation,
          ftr56SentenceConviction,
        )

        expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
        expect(isFixedTermRecallMandatoryForRecommendation).toHaveBeenCalledWith(
          recommendation,
          ftr56SentenceConviction,
        )
        expect(isStandardRecallMandatoryForRecommendation).toHaveBeenCalledWith(recommendation, ftr56SentenceConviction)
      })

      it('FTR not mandatory & Standard not mandatory -> FTR, Standard and No Recall available', () => {
        const expectedAvailableRecallTypes = formOptions.recallType
        ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)
        ;(isStandardRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)

        const actualAvailableRecallTypes = availableRecallTypesForRecommendation(
          recommendation,
          ftr56SentenceConviction,
        )

        expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
        expect(isFixedTermRecallMandatoryForRecommendation).toHaveBeenCalledWith(
          recommendation,
          ftr56SentenceConviction,
        )
        expect(isStandardRecallMandatoryForRecommendation).toHaveBeenCalledWith(recommendation, ftr56SentenceConviction)
      })
    })
  })
})
