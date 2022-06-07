import { transformLicenceConditions } from './transformLicenceConditions'
import { LicenceConditionsResponse } from '../../../@types/make-recall-decision-api'

describe('sortLicenceConditions', () => {
  it('sorts by licence condition main category code, in descending order', () => {
    const response = {
      convictions: [
        {
          offences: [],
          licenceConditions: [
            {
              licenceConditionTypeMainCat: {
                code: 'NLC4',
              },
            },
            {
              licenceConditionTypeMainCat: {
                code: 'NLC8',
              },
            },
            {
              licenceConditionTypeMainCat: {
                code: 'NLC5',
              },
            },
          ],
        },
      ],
    } as LicenceConditionsResponse
    const result = transformLicenceConditions(response)
    expect(result.convictions[0].licenceConditions).toEqual([
      {
        licenceConditionTypeMainCat: {
          code: 'NLC8',
        },
      },
      {
        licenceConditionTypeMainCat: {
          code: 'NLC5',
        },
      },
      {
        licenceConditionTypeMainCat: {
          code: 'NLC4',
        },
      },
    ])
  })
  it('includes only main offences', () => {
    const response = {
      convictions: [
        {
          offences: [
            {
              mainOffence: false,
            },
            {
              mainOffence: true,
            },
            {
              mainOffence: false,
            },
          ],
          licenceConditions: [],
        },
      ],
    } as LicenceConditionsResponse
    const result = transformLicenceConditions(response)
    expect(result.convictions[0].offences).toEqual([{ mainOffence: true }])
  })
})
