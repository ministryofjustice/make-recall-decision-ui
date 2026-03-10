import { SentenceGroup } from '../sentenceInformation/formOptions'
import getSentenceGroupDetailsFromEnum from './getSentenceGroupDetails'

describe('get sentence group details', () => {
  const expected = [
    {
      value: 'ADULT_SDS',
      expected: 'Adult determinate sentence',
    },
    {
      value: 'INDETERMINATE',
      expected: 'Indeterminate',
    },
    {
      value: 'EXTENDED',
      expected: 'Extended sentence',
    },
    {
      value: 'YOUTH_SDS',
      expected: 'Youth determinate sentence',
    },
  ]

  expected.forEach(testCase => {
    it(`should return human-readable value for ${testCase.value}`, () => {
      const result = getSentenceGroupDetailsFromEnum(testCase.value as SentenceGroup)
      expect(result.text).toBe(testCase.expected)
    })
  })
})
