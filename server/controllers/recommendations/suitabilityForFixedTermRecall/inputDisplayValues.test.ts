import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import inputDisplayValues from './inputDisplayValues'

const recommendation = RecommendationResponseGenerator.generate({ isSentence48MonthsOrOver: false })

describe('inputDisplayValuesSuitabilityForFixedTermRecall', () => {
  it('should return the API Values', () => {
    const result = inputDisplayValues({ isSentence48MonthsOrOver: { label: 'hello' } }, {}, recommendation)

    expect(result).toEqual({
      isSentence48MonthsOrOver: {
        label: 'hello',
        value: 'NO',
      },
    })
  })

  it('should return the unsavedValues', () => {
    const result = inputDisplayValues(
      { isSentence48MonthsOrOver: { label: 'hello' } },
      { isSentence48MonthsOrOver: 'YES' },
      recommendation,
    )

    expect(result).toEqual({
      isSentence48MonthsOrOver: {
        label: 'hello',
        value: 'YES',
      },
    })
  })
})
