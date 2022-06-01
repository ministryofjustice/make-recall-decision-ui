import { sortLicenceConditions } from './sortLicenceConditions'
import { LicenceConditionsResponse } from '../../../@types/make-recall-decision-api'

describe('sortLicenceConditions', () => {
  it('sorts by licence condition main category code, in descending order', () => {
    const response = {
      offences: [
        {
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
    const result = sortLicenceConditions(response)
    expect(result.offences[0].licenceConditions).toEqual([
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
})
