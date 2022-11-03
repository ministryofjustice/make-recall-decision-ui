import { transformLicenceConditions } from './transformLicenceConditions'
import { LicenceConditionsResponse } from '../../../@types/make-recall-decision-api'

describe('transformLicenceConditions', () => {
  it('should add an active convictions list with custodial and non-custodial convictions, ordered by sentence expiry date', () => {
    const response = {
      convictions: [
        {
          active: true,
          isCustodial: true,
          licenceExpiryDate: '2023-06-16',
          sentenceExpiryDate: '2021-11-23',
          offences: [],
        },
        {
          active: false,
          isCustodial: true,
          licenceExpiryDate: '2021-03-24',
          offences: [],
        },
        {
          active: true,
          isCustodial: false,
          licenceExpiryDate: '2021-11-24',
          sentenceExpiryDate: '2022-06-18',
          offences: [],
        },
      ],
    } as LicenceConditionsResponse

    const transformed = transformLicenceConditions(response)
    expect(transformed.convictions.active).toEqual([
      {
        active: true,
        isCustodial: false,
        licenceExpiryDate: '2021-11-24',
        offences: {
          additional: [],
          main: [],
        },
        licenceConditions: [],
        sentenceExpiryDate: '2022-06-18',
      },
      {
        active: true,
        isCustodial: true,
        licenceExpiryDate: '2023-06-16',
        offences: {
          additional: [],
          main: [],
        },
        licenceConditions: [],
        sentenceExpiryDate: '2021-11-23',
      },
    ])
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it("if convictions doesn't exist, return empty array for active", () => {
    const transformed = transformLicenceConditions({ convictions: undefined })
    expect(transformed.convictions.active).toEqual([])
  })

  it('sets hasAllConvictionsReleasedOnLicence property to false if there are active custodial convictions with statusCode not set to "Released - on licence"', () => {
    const transformed = transformLicenceConditions({
      convictions: [
        { convictionId: 1, active: true, isCustodial: false, offences: [], licenceConditions: [] },
        {
          convictionId: 2,
          active: true,
          isCustodial: true,
          statusCode: 'A',
          offences: [],
          licenceConditions: [],
        },
        { convictionId: 3, active: false, isCustodial: true, offences: [], licenceConditions: [] },
        {
          convictionId: 4,
          active: true,
          isCustodial: true,
          statusCode: 'B',
          offences: [],
          licenceConditions: [],
        },
      ],
    })
    expect(transformed.convictions.hasAllConvictionsReleasedOnLicence).toEqual(false)
  })

  it('sets hasAllConvictionsReleasedOnLicence property to true if all active custodial convictions have statusCode set to "Released - on licence"', () => {
    const transformed = transformLicenceConditions({
      convictions: [
        { convictionId: 1, active: true, isCustodial: false, offences: [], licenceConditions: [] },
        {
          convictionId: 2,
          active: true,
          isCustodial: true,
          statusCode: 'B',
          offences: [],
          licenceConditions: [],
        },
        { convictionId: 3, active: false, isCustodial: true, offences: [], licenceConditions: [] },
        {
          convictionId: 4,
          active: true,
          isCustodial: true,
          statusCode: 'B',
          offences: [],
          licenceConditions: [],
        },
      ],
    })
    expect(transformed.convictions.hasAllConvictionsReleasedOnLicence).toEqual(true)
  })

  it('sets activeCustodial property to an empty array there are no active custodial convictions', () => {
    const transformed = transformLicenceConditions({
      convictions: [
        { convictionId: 1, active: true, isCustodial: false, offences: [], licenceConditions: [] },
        { convictionId: 2, active: false, isCustodial: true, offences: [], licenceConditions: [] },
        { convictionId: 3, active: false, isCustodial: true, offences: [], licenceConditions: [] },
      ],
    })
    expect(transformed.convictions.activeCustodial).toEqual([])
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sets hasMultipleActiveCustodial to false if one active custodial conviction', () => {
    const transformed = transformLicenceConditions({
      convictions: [
        {
          convictionId: 3,
          active: true,
          isCustodial: true,
          statusDescription: 'Released - On Licence',
          offences: [],
          licenceConditions: [],
        },
      ],
    })
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sets hasMultipleActiveCustodial to false if no active convictions', () => {
    const transformed = transformLicenceConditions({
      convictions: [
        { convictionId: 3, active: false, offences: [], licenceConditions: [] },
        { convictionId: 3, active: false, offences: [], licenceConditions: [] },
      ],
    })
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sorts active convictions by sentence expiry date', () => {
    const transformed = transformLicenceConditions({
      convictions: [
        { active: true, sentenceExpiryDate: '2021-01-28', offences: [], licenceConditions: [] },
        { active: true, sentenceExpiryDate: null, offences: [], licenceConditions: [] },
        { active: true, sentenceExpiryDate: '2022-05-23', offences: [], licenceConditions: [] },
      ],
    })
    expect(transformed.convictions.active.map(conviction => conviction.sentenceExpiryDate)).toEqual([
      '2022-05-23',
      '2021-01-28',
      null,
    ])
  })

  it('includes only active licence conditions, and sorts them by description', () => {
    const transformed = transformLicenceConditions({
      convictions: [
        {
          convictionId: 1,
          active: true,
          offences: [],
          licenceConditions: [
            {
              active: true,
              startDate: '2021-08-23',
              licenceConditionTypeMainCat: {
                code: 'NLC5',
                description: 'Poss, own, control, inspect specified items /docs',
              },
            },
            { active: false, startDate: '2022-05-12' },
            {
              active: true,
              startDate: '2021-08-23',
              licenceConditionTypeMainCat: {
                code: 'BB4',
                description: 'Freedom of movement',
              },
            },
          ],
        },
        {
          convictionId: 2,
          active: true,
          offences: [],
          licenceConditions: [
            { active: false, startDate: '2022-05-12' },
            { active: false, startDate: '2021-08-23' },
          ],
        },
      ],
    })
    expect(transformed.convictions.active.map(conviction => conviction.licenceConditions)).toEqual([
      [
        {
          active: true,
          licenceConditionTypeMainCat: {
            code: 'BB4',
            description: 'Freedom of movement',
          },
          startDate: '2021-08-23',
        },
        {
          active: true,
          licenceConditionTypeMainCat: {
            code: 'NLC5',
            description: 'Poss, own, control, inspect specified items /docs',
          },
          startDate: '2021-08-23',
        },
      ],
      [],
    ])
  })
})
