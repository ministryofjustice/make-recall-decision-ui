import { currentHighestRosh } from './rosh'

describe('rosh', () => {
  it('null or undefined input', async () => {
    expect(currentHighestRosh(undefined)).toEqual(undefined)

    expect(currentHighestRosh(null)).toEqual(undefined)
  })

  it('ensuring ROSH in pascal case and spaces with no underscores', async () => {
    expect(
      currentHighestRosh({
        riskToPrisoners: 'HIGH',
        riskToPublic: 'LOW',
        riskToStaff: 'MEDIUM',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'MEDIUM',
      })
    ).toEqual('High')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'LOW',
        riskToStaff: 'VERY_HIGH',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'MEDIUM',
      })
    ).toEqual('Very High')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'MEDIUM',
        riskToStaff: 'LOW',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'LOW',
      })
    ).toEqual('Medium')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'LOW',
        riskToStaff: 'LOW',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'LOW',
      })
    ).toEqual('Low')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'NOT_APPLICABLE',
        riskToPublic: 'NOT_APPLICABLE',
        riskToStaff: 'NOT_APPLICABLE',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'NOT_APPLICABLE',
      })
    ).toEqual('Not Applicable')
  })
})
