import { transformLicenceConditions } from './transformLicenceConditions'
import { LicenceConditionsResponse } from '../../../@types/make-recall-decision-api'

describe('transformLicenceConditions', () => {
  it('should add an active convictions list with custodial and non-custodial convictions, ordered by sentence expiry date', () => {
    const response = {
      activeConvictions: [
        {
          sentence: {
            isCustodial: true,
            licenceExpiryDate: '2023-06-16',
            sentenceExpiryDate: '2021-11-23',
          },
        },
        {
          sentence: {
            isCustodial: false,
            licenceExpiryDate: '2021-11-24',
            sentenceExpiryDate: '2022-06-18',
          },
        },
      ],
    } as LicenceConditionsResponse

    const transformed = transformLicenceConditions(response)
    expect(transformed.licenceConvictions.active).toEqual([
      {
        isCustodial: false,
        sentence: {
          isCustodial: false,
          licenceExpiryDate: '2021-11-24',
          sentenceExpiryDate: '2022-06-18',
        },
        licenceConditions: [],
      },
      {
        isCustodial: true,
        sentence: {
          isCustodial: true,
          licenceExpiryDate: '2023-06-16',
          sentenceExpiryDate: '2021-11-23',
        },
        licenceConditions: [],
      },
    ])
    expect(transformed.licenceConvictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it("if convictions doesn't exist, return empty array for active", () => {
    const transformed = transformLicenceConditions({ activeConvictions: undefined })
    expect(transformed.licenceConvictions.active).toEqual([])
  })

  it('sets hasAllConvictionsReleasedOnLicence property to false if there are active custodial convictions with statusCode not set to "Released - on licence"', () => {
    const transformed = transformLicenceConditions({
      activeConvictions: [
        { sentence: { isCustodial: false } },
        { sentence: { isCustodial: true, custodialStatusCode: 'B' } },
        { sentence: { isCustodial: true, custodialStatusCode: 'A' } },
      ],
    })
    expect(transformed.hasAllConvictionsReleasedOnLicence).toEqual(false)
  })

  it('sets hasAllConvictionsReleasedOnLicence property to true if all active custodial convictions have statusCode set to "Released - on licence"', () => {
    const transformed = transformLicenceConditions({
      activeConvictions: [
        { sentence: { isCustodial: false } },
        { sentence: { isCustodial: true, custodialStatusCode: 'B' } },
        { sentence: { isCustodial: true, custodialStatusCode: 'B' } },
      ],
    })
    expect(transformed.hasAllConvictionsReleasedOnLicence).toEqual(true)
  })

  it('sets activeCustodial property to an empty array there are no active custodial convictions', () => {
    const transformed = transformLicenceConditions({
      activeConvictions: [{ sentence: { isCustodial: false } }, { sentence: { isCustodial: false } }],
    })
    expect(transformed.licenceConvictions.activeCustodial).toEqual([])
    expect(transformed.licenceConvictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sets hasMultipleActiveCustodial to false if one active custodial conviction', () => {
    const transformed = transformLicenceConditions({
      activeConvictions: [{ sentence: { isCustodial: true } }],
    })
    expect(transformed.licenceConvictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sets hasMultipleActiveCustodial to false if no active convictions', () => {
    const transformed = transformLicenceConditions({
      activeConvictions: [],
    })
    expect(transformed.licenceConvictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sorts active convictions by sentence expiry date', () => {
    const transformed = transformLicenceConditions({
      activeConvictions: [
        { sentence: { sentenceExpiryDate: '2021-01-28' } },
        { sentence: { sentenceExpiryDate: null } },
        { sentence: { sentenceExpiryDate: '2022-05-23' } },
      ],
    })
    expect(transformed.licenceConvictions.active.map(conviction => conviction.sentence.sentenceExpiryDate)).toEqual([
      '2022-05-23',
      '2021-01-28',
      null,
    ])
  })

  it('includes only active licence conditions, and sorts them by description', () => {
    const transformed = transformLicenceConditions({
      activeConvictions: [
        {
          licenceConditions: [
            {
              mainCategory: {
                code: 'NLC5',
                description: 'Poss, own, control, inspect specified items /docs',
              },
            },
            {
              mainCategory: {
                code: 'BB4',
                description: 'Freedom of movement',
              },
            },
          ],
        },
        {
          licenceConditions: [],
        },
      ],
    })
    expect(transformed.licenceConvictions.active.map(conviction => conviction.licenceConditions)).toEqual([
      [
        {
          mainCategory: {
            code: 'BB4',
            description: 'Freedom of movement',
          },
        },
        {
          mainCategory: {
            code: 'NLC5',
            description: 'Poss, own, control, inspect specified items /docs',
          },
        },
      ],
      [],
    ])
  })
})
