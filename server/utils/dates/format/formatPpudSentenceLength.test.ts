import { PpudSentenceLength } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { formatPpudSentenceLength } from './formatPpudSentenceLength'

describe('formatPpudSentenceLength', () => {
  it('formats sentence length with all values equal to 1', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 1,
      partMonths: 1,
      partYears: 1,
    }
    const expectedSentenceLengthDisplay = '1 year, 1 month, 1 day'

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  })

  it('formats sentence length with all values greater than 1', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: 3,
      partYears: 4,
    }
    const expectedSentenceLengthDisplay = '4 years, 3 months, 2 days'

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  })

  it('formats sentence length with zero years', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: 3,
      partYears: 0,
    }
    testWithNoYears(sentenceLength)
  })

  it('formats sentence length with null years', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: 3,
      partYears: null,
    }
    testWithNoYears(sentenceLength)
  })

  it('formats sentence length with undefined years', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: 3,
      partYears: undefined,
    }
    testWithNoYears(sentenceLength)
  })

  function testWithNoYears(sentenceLength: PpudSentenceLength) {
    const expectedSentenceLengthDisplay = `${sentenceLength.partMonths} months, ${sentenceLength.partDays} days`

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  }

  it('formats sentence length with zero months', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: 0,
      partYears: 4,
    }
    testWithNoMonths(sentenceLength)
  })

  it('formats sentence length with null months', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: null,
      partYears: 4,
    }
    testWithNoMonths(sentenceLength)
  })

  it('formats sentence length with undefined months', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: undefined,
      partYears: 4,
    }
    testWithNoMonths(sentenceLength)
  })

  function testWithNoMonths(sentenceLength: PpudSentenceLength) {
    const expectedSentenceLengthDisplay = `${sentenceLength.partYears} years, ${sentenceLength.partDays} days`

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  }

  it('formats sentence length with zero days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 0,
      partMonths: 3,
      partYears: 4,
    }
    testWithNoDays(sentenceLength)
  })

  it('formats sentence length with null days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: null,
      partMonths: 3,
      partYears: 4,
    }
    testWithNoDays(sentenceLength)
  })

  it('formats sentence length with undefined days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: undefined,
      partMonths: 3,
      partYears: 4,
    }
    testWithNoDays(sentenceLength)
  })

  function testWithNoDays(sentenceLength: PpudSentenceLength) {
    const expectedSentenceLengthDisplay = `${sentenceLength.partYears} years, ${sentenceLength.partMonths} months`

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  }

  it('formats sentence length with zero years and months', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: 0,
      partYears: 0,
    }
    testWithNoYearsOrMonths(sentenceLength)
  })

  it('formats sentence length with null years and months', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: null,
      partYears: null,
    }
    testWithNoYearsOrMonths(sentenceLength)
  })

  it('formats sentence length with undefined years and months', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 2,
      partMonths: undefined,
      partYears: undefined,
    }
    testWithNoYearsOrMonths(sentenceLength)
  })

  function testWithNoYearsOrMonths(sentenceLength: PpudSentenceLength) {
    const expectedSentenceLengthDisplay = `${sentenceLength.partDays} days`

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  }

  it('formats sentence length with zero years and days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 0,
      partMonths: 3,
      partYears: 0,
    }
    testWithNoYearsOrDays(sentenceLength)
  })

  it('formats sentence length with null years and days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: null,
      partMonths: 3,
      partYears: null,
    }
    testWithNoYearsOrDays(sentenceLength)
  })

  it('formats sentence length with undefined years and days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: undefined,
      partMonths: 3,
      partYears: undefined,
    }
    testWithNoYearsOrDays(sentenceLength)
  })

  function testWithNoYearsOrDays(sentenceLength: PpudSentenceLength) {
    const expectedSentenceLengthDisplay = `${sentenceLength.partMonths} months`

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  }

  it('formats sentence length with zero months and days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: 0,
      partMonths: 0,
      partYears: 4,
    }
    testWithNoMonthsOrDays(sentenceLength)
  })

  it('formats sentence length with null months and days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: null,
      partMonths: null,
      partYears: 4,
    }
    testWithNoMonthsOrDays(sentenceLength)
  })

  it('formats sentence length with undefined months and days', () => {
    const sentenceLength: PpudSentenceLength = {
      partDays: undefined,
      partMonths: undefined,
      partYears: 4,
    }
    testWithNoMonthsOrDays(sentenceLength)
  })

  function testWithNoMonthsOrDays(sentenceLength: PpudSentenceLength) {
    const expectedSentenceLengthDisplay = `${sentenceLength.partYears} years`

    const actualSentenceLengthDisplay = formatPpudSentenceLength(sentenceLength)

    expect(actualSentenceLengthDisplay).toEqual(expectedSentenceLengthDisplay)
  }
})
