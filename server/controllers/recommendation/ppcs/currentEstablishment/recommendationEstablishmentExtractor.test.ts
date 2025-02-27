import {
  extractCurrentEstablishment,
  extractNomisEstablishment,
  extractPpudEstablishment,
} from './recommendationEstablishmentExtractor'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import {
  BookRecallToPpud,
  PpudOffender,
  PrisonOffender,
} from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'

describe('extractNomisEstablishment', () => {
  let recommendation: RecommendationResponse
  beforeEach(() => {
    recommendation = {
      prisonOffender: {} as PrisonOffender,
    }
  })

  it('extracts non-null establishment', () => {
    recommendation.prisonOffender.agencyId = 'abc'

    const actualNomisEstablishment = extractNomisEstablishment(recommendation)

    expect(actualNomisEstablishment).toEqual(recommendation.prisonOffender.agencyId)
  })

  it('extracts undefined establishment', () => {
    delete recommendation.prisonOffender.agencyId

    const actualNomisEstablishment = extractNomisEstablishment(recommendation)

    expect(actualNomisEstablishment).toBeUndefined()
  })
})

describe('extractPpudEstablishment', () => {
  let recommendation: RecommendationResponse
  beforeEach(() => {
    recommendation = {
      ppudOffender: {} as PpudOffender,
    }
  })

  it('extracts non-null establishment', () => {
    recommendation.ppudOffender.establishment = 'abc'

    const actualPpudEstablishment = extractPpudEstablishment(recommendation)

    expect(actualPpudEstablishment).toEqual(recommendation.ppudOffender.establishment)
  })

  it('handles blank/empty establishment', () => {
    recommendation.ppudOffender.establishment = ''

    const actualPpudEstablishment = extractPpudEstablishment(recommendation)

    expect(actualPpudEstablishment).toEqual('There is a PPUD record but this field is blank')
  })

  it('handles undefined establishment', () => {
    delete recommendation.ppudOffender.establishment

    const actualPpudEstablishment = extractPpudEstablishment(recommendation)

    expect(actualPpudEstablishment).toEqual('There is a PPUD record but this field is blank')
  })
})

describe('extractCurrentEstablishment', () => {
  const validEstablishments = ['abc', 'def', 'ghi']
  let recommendation: RecommendationResponse
  beforeEach(() => {
    recommendation = {
      bookRecallToPpud: {} as BookRecallToPpud,
    }
  })

  it('extracts valid non-null establishment', () => {
    // eslint-disable-next-line prefer-destructuring
    recommendation.bookRecallToPpud.currentEstablishment = validEstablishments[0]

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual(recommendation.bookRecallToPpud.currentEstablishment)
  })

  it('extracts invalid non-null establishment', () => {
    recommendation.bookRecallToPpud.currentEstablishment = 'jkl'

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual('')
  })

  it('extracts undefined establishment', () => {
    delete recommendation.bookRecallToPpud.currentEstablishment

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual('')
  })

  it('extracts blank/empty establishment', () => {
    recommendation.bookRecallToPpud.currentEstablishment = ''

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual('')
  })
})
