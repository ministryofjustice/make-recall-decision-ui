import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import inputDisplayValues from './inputDisplayValues'

const recommendation = RecommendationResponseGenerator.generate({ isServingSOPCSentence: false })

describe('inputDisplayValuesSuitabilityForFixedTermRecall', () => {
  it('should return the API Values', () => {
    const result = inputDisplayValues({ isServingSOPCSentence: { label: 'hello' } }, {}, recommendation)

    expect(result).toEqual({
      isServingSOPCSentence: {
        label: 'hello',
        value: 'NO',
      },
    })
  })

  it('should return the unsavedValues', () => {
    const result = inputDisplayValues(
      { isServingSOPCSentence: { label: 'hello' } },
      { isServingSOPCSentence: 'YES' },
      recommendation,
    )

    expect(result).toEqual({
      isServingSOPCSentence: {
        label: 'hello',
        value: 'YES',
      },
    })
  })
})
