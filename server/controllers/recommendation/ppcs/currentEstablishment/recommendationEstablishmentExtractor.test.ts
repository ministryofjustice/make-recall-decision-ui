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
import { PPUD_ESTABLISHMENT_NOT_SPECIFIED } from '../establishmentMapping'

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
  let recommendation: RecommendationResponse
  beforeEach(() => {
    recommendation = {
      bookRecallToPpud: {} as BookRecallToPpud,
    }
  })

  const extractsValidNonNullEstablishment = (validEstablishments: string[]) => {
    // eslint-disable-next-line prefer-destructuring
    recommendation.bookRecallToPpud.currentEstablishment = validEstablishments[0]

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual(recommendation.bookRecallToPpud.currentEstablishment)
  }

  const extractsInvalidNonNullEstablishment = (
    invalidEstablishment: string,
    validEstablishments: string[],
    expectedCurrentEstablishment: string
  ) => {
    recommendation.bookRecallToPpud.currentEstablishment = invalidEstablishment

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual(expectedCurrentEstablishment)
  }

  const extractsUndefinedEstablishment = (validEstablishments: string[], expectedCurrentEstablishment: string) => {
    delete recommendation.bookRecallToPpud.currentEstablishment

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual(expectedCurrentEstablishment)
  }

  const extractsBlankEstablishment = (validEstablishments: string[], expectedCurrentEstablishment: string) => {
    recommendation.bookRecallToPpud.currentEstablishment = ''

    const actualPpudEstablishment = extractCurrentEstablishment(recommendation, validEstablishments)

    expect(actualPpudEstablishment).toEqual(expectedCurrentEstablishment)
  }

  describe('with "Not Specified" available', () => {
    const validEstablishments = ['abc', 'def', 'ghi', PPUD_ESTABLISHMENT_NOT_SPECIFIED]

    it('extracts valid non-null establishment', () => {
      extractsValidNonNullEstablishment(validEstablishments)
    })

    it('extracts invalid non-null establishment', () => {
      extractsInvalidNonNullEstablishment('jkl', validEstablishments, PPUD_ESTABLISHMENT_NOT_SPECIFIED)
    })

    it('extracts undefined establishment', () => {
      extractsUndefinedEstablishment(validEstablishments, PPUD_ESTABLISHMENT_NOT_SPECIFIED)
    })

    it('extracts blank/empty establishment', () => {
      extractsBlankEstablishment(validEstablishments, PPUD_ESTABLISHMENT_NOT_SPECIFIED)
    })
  })

  describe('with "Not Specified" unavailable', () => {
    const validEstablishments = ['abc', 'def', 'ghi']

    it('extracts valid non-null establishment', () => {
      extractsValidNonNullEstablishment(validEstablishments)
    })

    it('extracts invalid non-null establishment', () => {
      extractsInvalidNonNullEstablishment('jkl', validEstablishments, '')
    })

    it('extracts undefined establishment', () => {
      extractsUndefinedEstablishment(validEstablishments, '')
    })

    it('extracts blank/empty establishment', () => {
      extractsBlankEstablishment(validEstablishments, '')
    })
  })
})
