import { transformOverview } from './transformOverview'
import { CaseSummaryOverviewResponse } from '../../../@types/make-recall-decision-api'

describe('transformOverview', () => {
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
    } as CaseSummaryOverviewResponse

    const transformed = transformOverview(response)
    expect(transformed.convictions.active).toEqual([
      {
        active: true,
        isCustodial: false,
        licenceExpiryDate: '2021-11-24',
        offences: {
          additional: [],
          main: [],
        },
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
        sentenceExpiryDate: '2021-11-23',
      },
    ])
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it("if convictions doesn't exist, return empty array for active", () => {
    const transformed = transformOverview({ convictions: undefined })
    expect(transformed.convictions.active).toEqual([])
  })

  it('sets an activeCustodial property if there is one active custodial conviction', () => {
    const transformed = transformOverview({
      convictions: [
        { convictionId: 1, active: true, isCustodial: false, offences: [] },
        { convictionId: 2, active: false, isCustodial: true, offences: [] },
        { convictionId: 3, active: true, isCustodial: true, offences: [] },
      ],
    })
    expect(transformed.convictions.activeCustodial).toEqual({
      convictionId: 3,
      active: true,
      isCustodial: true,
      offences: {
        additional: [],
        main: [],
      },
    })
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sets activeCustodial property to undefined there are no active custodial convictions', () => {
    const transformed = transformOverview({
      convictions: [
        { convictionId: 1, active: true, isCustodial: false, offences: [] },
        { convictionId: 2, active: false, isCustodial: true, offences: [] },
        { convictionId: 3, active: false, isCustodial: true, offences: [] },
      ],
    })
    expect(transformed.convictions.activeCustodial).toBeUndefined()
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sets activeCustodial to undefined if there are multiple active custodial convictions', () => {
    const transformed = transformOverview({
      convictions: [
        { convictionId: 1, active: true, isCustodial: false, offences: [] },
        { convictionId: 2, active: true, isCustodial: true, offences: [] },
        { convictionId: 3, active: true, isCustodial: true, offences: [] },
      ],
    })
    expect(transformed.convictions.activeCustodial).toBeUndefined()
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(true)
  })

  it('sets hasMultipleActiveCustodial to false if one active custodial conviction', () => {
    const transformed = transformOverview({
      convictions: [{ convictionId: 3, active: true, isCustodial: true, offences: [] }],
    })
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sets hasMultipleActiveCustodial to false if no active convictions', () => {
    const transformed = transformOverview({
      convictions: [
        { convictionId: 3, active: false, offences: [] },
        { convictionId: 3, active: false, offences: [] },
      ],
    })
    expect(transformed.convictions.hasMultipleActiveCustodial).toEqual(false)
  })

  it('sorts active convictions by sentence expiry date', () => {
    const transformed = transformOverview({
      convictions: [
        { active: true, sentenceExpiryDate: '2021-01-28', offences: [] },
        { active: true, sentenceExpiryDate: null, offences: [] },
        { active: true, sentenceExpiryDate: '2022-05-23', offences: [] },
      ],
    })
    expect(transformed.convictions.active.map(conviction => conviction.sentenceExpiryDate)).toEqual([
      '2022-05-23',
      '2021-01-28',
      null,
    ])
  })
})
