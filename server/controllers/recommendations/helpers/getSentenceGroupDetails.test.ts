import { SentenceGroup } from '../sentenceInformation/formOptions'
import getSentenceGroupDetailsFromEnum from './getSentenceGroupDetails'

describe('get sentence group details', () => {
  const expected = [
    {
      value: SentenceGroup.ADULT_SDS,
      expected: 'Adult determinate sentence',
    },
    {
      value: SentenceGroup.INDETERMINATE,
      expected: 'Indeterminate',
    },
    {
      value: SentenceGroup.EXTENDED,
      expected: 'Extended sentence',
    },
    {
      value: SentenceGroup.YOUTH_SDS,
      expected: 'Youth determinate sentence',
    },
  ]

  expected.forEach(testCase => {
    it(`should return human-readable value for ${testCase.value}`, () => {
      const result = getSentenceGroupDetailsFromEnum(testCase.value)
      expect(result.text).toBe(testCase.expected)
    })
  })
})
