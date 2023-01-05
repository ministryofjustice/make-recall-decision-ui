import { transformRisk } from './transformRisk'

const riskResponse = {
  roshHistory: {
    registrations: [
      {
        startDate: '2022-10-17',
        notes: null,
        type: {
          code: 'RMRH',
        },
      },
      {
        startDate: '2021-06-03',
        notes: 'Registering Staff ID re-assigned in TR Migration',
        type: {
          code: 'RHRH',
        },
      },
      {
        startDate: '2021-06-05',
        notes: null,
        type: {
          code: 'RVHR',
        },
      },
    ],
  },
  predictorScores: {
    historical: [
      {
        date: '2021-06-04',
        scores: {},
      },
    ],
  },
}

describe('transformRisk', () => {
  it('sorts by newest first, and includes only high and very high RoSH history', () => {
    const transformed = transformRisk(riskResponse)
    expect(transformed.timeline).toEqual([
      {
        type: 'RoSH',
        date: '2021-06-05',
        level: 'VERY_HIGH',
        notes: null,
      },
      {
        date: '2021-06-04',
        scores: {},
      },
      {
        type: 'RoSH',
        date: '2021-06-03',
        level: 'HIGH',
        notes: 'Registering Staff ID re-assigned in TR Migration',
      },
    ])
  })

  it('includes RoSH history error if present', () => {
    const transformed = transformRisk({ ...riskResponse, roshHistory: { error: 'SERVER_ERROR' } })
    expect(transformed.roshHistory).toEqual({ error: 'SERVER_ERROR' })
    expect(transformed.timeline).toEqual([
      {
        date: '2021-06-04',
        scores: {},
      },
    ])
  })

  it('excludes RoSH history if not present', () => {
    const transformed = transformRisk({ ...riskResponse, roshHistory: { registrations: null, error: null } })
    expect(transformed.timeline).toEqual([
      {
        date: '2021-06-04',
        scores: {},
      },
    ])
  })

  it('includes predictor score error if present', () => {
    const transformed = transformRisk({ ...riskResponse, predictorScores: { error: 'NOT_FOUND' } })
    expect(transformed.predictorScores).toEqual({ error: 'NOT_FOUND' })
    expect(transformed.timeline).toEqual([
      {
        date: '2021-06-05',
        level: 'VERY_HIGH',
        notes: null,
        type: 'RoSH',
      },
      {
        date: '2021-06-03',
        level: 'HIGH',
        notes: 'Registering Staff ID re-assigned in TR Migration',
        type: 'RoSH',
      },
    ])
  })
})
