import { transformVulnerabilities } from './transformVulnerabilities'
import { VulnerabilitiesResponse } from '../../../@types/make-recall-decision-api'

describe('transformVulnerabilities', () => {
  it('sets the noData property to true if all properties are null', () => {
    const apiResponse = {
      vulnerabilities: {
        suicide: {
          current: null,
          previous: null,
        },
        selfHarm: {
          current: null,
          previous: null,
        },
        vulnerability: {
          current: null,
          previous: null,
        },
        custody: {
          current: null,
          previous: null,
        },
        hostelSetting: {
          current: null,
          previous: null,
        },
      },
    } as VulnerabilitiesResponse
    const transformed = transformVulnerabilities(apiResponse)
    expect(transformed.vulnerabilities.noData).toEqual(true)
  })

  it('sets the noData property to false if any property is set', () => {
    const apiResponse = {
      vulnerabilities: {
        suicide: {
          current: 'YES',
          previous: null,
        },
        selfHarm: {
          current: null,
          previous: null,
        },
        vulnerability: {
          current: null,
          previous: null,
        },
        custody: {
          current: null,
          previous: null,
        },
        hostelSetting: {
          current: null,
          previous: null,
        },
      },
    } as VulnerabilitiesResponse
    const transformed = transformVulnerabilities(apiResponse)
    expect(transformed.vulnerabilities.noData).toEqual(false)
  })
})
