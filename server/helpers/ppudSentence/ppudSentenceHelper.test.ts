import { PpudDetailsSentence } from '../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { getDeterminateSentences, getIndeterminateSentences, calculatePartACustodyGroup } from './ppudSentenceHelper'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { ppudDetailsSentence } from '../../@types/make-recall-decision-api/models/ppud/PpudDetailsResponse.testFactory'

const DETERMINATE_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '1',
  custodyType: 'Determinate',
})

const EDS_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '2',
  custodyType: 'EDS',
})

const EDS_NON_PAROLE_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '3',
  custodyType: 'EDS (non parole)',
})

const IPP_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '4',
  custodyType: 'IPP',
})

const DPP_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '5',
  custodyType: 'DPP',
})

const MANDATORY_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '6',
  custodyType: 'Mandatory (MLP)',
})

const DISCRETIONARY_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '7',
  custodyType: 'Discretionary',
})

const DISCRETIONARY_TARIFF_EXPIRED_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '8',
  custodyType: 'Discretionary (Tariff Expired)',
})

const AUTOMATIC_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '9',
  custodyType: 'Automatic',
})

const OTHER_SENTENCE: PpudDetailsSentence = ppudDetailsSentence({
  id: '10',
  custodyType: 'Other',
})

const determinateSentences: PpudDetailsSentence[] = [DETERMINATE_SENTENCE, EDS_SENTENCE, EDS_NON_PAROLE_SENTENCE]

const indeterminateSentences: PpudDetailsSentence[] = [
  IPP_SENTENCE,
  DPP_SENTENCE,
  MANDATORY_SENTENCE,
  DISCRETIONARY_SENTENCE,
  DISCRETIONARY_TARIFF_EXPIRED_SENTENCE,
  AUTOMATIC_SENTENCE,
]

const sentences: PpudDetailsSentence[] = [...determinateSentences, ...indeterminateSentences, OTHER_SENTENCE]

describe('getDeterminateSentences', () => {
  it('filters out all but the expected custody types', () => {
    const actualDeterminateSentences = getDeterminateSentences(sentences)

    expect(actualDeterminateSentences).toEqual(determinateSentences)
  })

  it('returns an empty list if no sentences of the expected custody types found', () => {
    const actualDeterminateSentences = getDeterminateSentences(indeterminateSentences)

    expect(actualDeterminateSentences).toEqual([])
  })

  it('returns an empty list if given an empty list', () => {
    const actualDeterminateSentences = getDeterminateSentences([])

    expect(actualDeterminateSentences).toEqual([])
  })

  it('returns an empty list if given an undefined list', () => {
    const actualDeterminateSentences = getDeterminateSentences(undefined)

    expect(actualDeterminateSentences).toEqual([])
  })
})

describe('getIndeterminateSentences', () => {
  it('filters out all but the expected custody types', () => {
    const actualIndeterminateSentences = getIndeterminateSentences(sentences)

    expect(actualIndeterminateSentences).toEqual(indeterminateSentences)
  })

  it('returns an empty list if no sentences of the expected custody types found', () => {
    const actualIndeterminateSentences = getIndeterminateSentences(determinateSentences)

    expect(actualIndeterminateSentences).toEqual([])
  })

  it('returns an empty list if given an empty list', () => {
    const actualIndeterminateSentences = getIndeterminateSentences([])

    expect(actualIndeterminateSentences).toEqual([])
  })

  it('returns an empty list if given an undefined list', () => {
    const actualIndeterminateSentences = getIndeterminateSentences(undefined)

    expect(actualIndeterminateSentences).toEqual([])
  })
})

describe('getSentenceType', () => {
  it('returns DETERMINATE when indeterminate flag set to false', () => {
    const recommendation: RecommendationResponse = {
      isIndeterminateSentence: false,
    }
    const actualSentenceType = calculatePartACustodyGroup(recommendation)

    expect(actualSentenceType).toEqual(CUSTODY_GROUP.DETERMINATE)
  })

  it('returns INDETERMINATE when indeterminate flag set to true', () => {
    const recommendation: RecommendationResponse = {
      isIndeterminateSentence: true,
    }
    const actualSentenceType = calculatePartACustodyGroup(recommendation)

    expect(actualSentenceType).toEqual(CUSTODY_GROUP.INDETERMINATE)
  })

  it('returns DETERMINATE when indeterminate flag not present', () => {
    const recommendation: RecommendationResponse = {}
    const actualSentenceType = calculatePartACustodyGroup(recommendation)

    expect(actualSentenceType).toEqual(CUSTODY_GROUP.DETERMINATE)
  })

  it('returns DETERMINATE when indeterminate flag set to null', () => {
    const recommendation: RecommendationResponse = {
      isIndeterminateSentence: null,
    }
    const actualSentenceType = calculatePartACustodyGroup(recommendation)

    expect(actualSentenceType).toEqual(CUSTODY_GROUP.DETERMINATE)
  })

  it('returns DETERMINATE when indeterminate flag set to undefined', () => {
    const recommendation: RecommendationResponse = {
      isIndeterminateSentence: undefined,
    }
    const actualSentenceType = calculatePartACustodyGroup(recommendation)

    expect(actualSentenceType).toEqual(CUSTODY_GROUP.DETERMINATE)
  })
})
