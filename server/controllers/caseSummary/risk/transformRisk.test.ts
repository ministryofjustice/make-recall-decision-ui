import { transformRisk } from './transformRisk'
import { RiskResponse } from '../../../@types/make-recall-decision-api'
import {
  FourBandRiskScoreBand,
  StaticOrDynamic,
  StaticOrDynamicPredictor,
  ThreeBandRiskScoreBand,
} from '../../../@types/make-recall-decision-api/models/Scores'

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
describe('transformRisk predictorScales', () => {
  const baseDate = '2026-01-01T00:00:00.000Z'

  it('builds V1 predictor scales correctly', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const riskResponse: RiskResponse = {
      predictorScores: {
        error: '',
        current: {
          date: baseDate,
          scores: {
            RSR: { level: 'HIGH', type: 'RSR', score: '5' },
            OSPC: { level: 'MEDIUM', type: 'OSPC', score: '3' },
            OSPI: { level: 'LOW', type: 'OSPI', score: '1' },
            OGRS: { level: 'VERY_HIGH', type: 'OGRS', oneYear: '2.0', twoYears: '4.0' },
            OGP: { level: 'MEDIUM', type: 'OGP', oneYear: '1.0', twoYears: '2.0' },
            OVP: { level: 'LOW', type: 'OVP', oneYear: '0.5', twoYears: '1.0' },
          },
        },
        historical: [],
      },
      roshHistory: { registrations: [], error: null },
    }

    const transformed = transformRisk(riskResponse)
    const { predictorScales } = transformed

    expect(predictorScales?.rsr).toEqual({
      type: 'RSR',
      level: 'HIGH',
      score: '5',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '3%', '6.9%', '25%'],
    })

    expect(predictorScales?.ospc).toEqual({
      type: 'OSPC',
      level: 'MEDIUM',
      score: '3',
      lastUpdated: '1 January 2026',
      bandPercentages: [],
    })

    expect(predictorScales?.ospi).toEqual({
      type: 'OSPI',
      level: 'LOW',
      score: '1',
      lastUpdated: '1 January 2026',
      bandPercentages: [],
    })

    expect(predictorScales?.ospdc).toBeUndefined()
    expect(predictorScales?.ospiic).toBeUndefined()

    expect(predictorScales?.ogrs).toEqual({
      type: 'OGRS3',
      level: 'VERY_HIGH',
      score: '4.0',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '50%', '75%', '90%', '100%'],
    })

    expect(predictorScales?.ogp).toEqual({
      type: 'OGP',
      level: 'MEDIUM',
      score: '2.0',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '34%', '67%', '85%', '100%'],
    })

    expect(predictorScales?.ovp).toEqual({
      type: 'OVP',
      level: 'LOW',
      score: '1.0',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '30%', '60%', '80%', '100%'],
    })
  })

  it('transforms V1 predictors including OSPDC and OSPIIC', () => {
    const riskResponseWithNewV1: RiskResponse = {
      predictorScores: {
        error: '',
        current: {
          date: '2026-01-01',
          scores: {
            RSR: { level: 'HIGH', score: '5', type: 'RSR' },
            OSPDC: { level: 'MEDIUM', score: '4', type: 'OSP/DC' },
            OSPIIC: { level: 'HIGH', score: '6', type: 'OSP/IIC' },
            OGRS: { level: 'VERY_HIGH', twoYears: '4.0', type: 'OGRS' },
            OGP: { level: 'MEDIUM', twoYears: '2.0', type: 'OGP' },
            OVP: { level: 'LOW', twoYears: '1.0', type: 'OVP' },
          },
        },
        historical: [],
      },
      roshHistory: { registrations: [], error: null },
    }

    const transformed = transformRisk(riskResponseWithNewV1)
    const predictorScales = transformed.predictorScales!

    expect(predictorScales?.rsr).toEqual({
      type: 'RSR',
      level: 'HIGH',
      score: '5',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '3%', '6.9%', '25%'],
    })

    expect(predictorScales?.ospc).toBeUndefined()
    expect(predictorScales?.ospi).toBeUndefined()

    expect(predictorScales?.ospdc).toEqual({
      type: 'OSP/DC',
      level: 'MEDIUM',
      score: '4',
      lastUpdated: '1 January 2026',
      bandPercentages: [],
    })

    expect(predictorScales?.ospiic).toEqual({
      type: 'OSP/IIC',
      level: 'HIGH',
      score: '6',
      lastUpdated: '1 January 2026',
      bandPercentages: [],
    })

    expect(predictorScales?.ogrs).toEqual({
      type: 'OGRS3',
      level: 'VERY_HIGH',
      score: '4.0',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '50%', '75%', '90%', '100%'],
    })

    expect(predictorScales?.ogp).toEqual({
      type: 'OGP',
      level: 'MEDIUM',
      score: '2.0',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '34%', '67%', '85%', '100%'],
    })

    expect(predictorScales?.ovp).toEqual({
      type: 'OVP',
      level: 'LOW',
      score: '1.0',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '30%', '60%', '80%', '100%'],
    })
  })

  it('builds V2 predictor scales correctly', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const riskResponse: RiskResponse = {
      predictorScores: {
        error: '',
        current: {
          date: baseDate,
          scores: {
            allReoffendingPredictor: { band: 'HIGH', score: 5, staticOrDynamic: 'STATIC' } as StaticOrDynamicPredictor,
            violentReoffendingPredictor: {
              band: 'MEDIUM',
              score: 3,
              staticOrDynamic: 'DYNAMIC',
            } as StaticOrDynamicPredictor,
            directContactSexualReoffendingPredictor: { band: FourBandRiskScoreBand.LOW, score: 1 },
            indirectImageContactSexualReoffendingPredictor: { band: ThreeBandRiskScoreBand.HIGH, score: 10 },
            seriousViolentReoffendingPredictor: {
              band: 'HIGH',
              score: 4,
              staticOrDynamic: 'STATIC',
            } as StaticOrDynamicPredictor,
            combinedSeriousReoffendingPredictor: {
              band: 'MEDIUM',
              score: 2,
              staticOrDynamic: 'DYNAMIC',
            } as StaticOrDynamicPredictor,
          },
        },
        historical: [],
      },
      roshHistory: { registrations: [], error: null },
    }

    const transformed = transformRisk(riskResponse)
    const { predictorScales } = transformed

    expect(predictorScales?.allReoffending).toEqual({
      type: 'All Reoffending Predictor',
      level: 'HIGH',
      score: '5', // score converted to string inside buildV2StaticOrDynamicPredictor
      staticOrDynamic: 'STATIC',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '50%', '75%', '90%', '100%'],
    })

    expect(predictorScales?.violentReoffending?.level).toBe('MEDIUM')
    expect(predictorScales?.violentReoffending?.score).toBe('3')
    expect(predictorScales?.violentReoffending?.staticOrDynamic).toBe('DYNAMIC')

    expect(predictorScales?.directContactSexual?.level).toBe('LOW')
    expect(predictorScales?.indirectImageContactSexual?.level).toBe('HIGH')

    expect(predictorScales?.combinedSerious?.level).toBe('MEDIUM')
  })

  it('transforms V2 predictors including StaticOrDynamic, FourBand, and ThreeBand', () => {
    const riskResponseV2: RiskResponse = {
      predictorScores: {
        error: '',
        current: {
          date: '2026-01-01',
          scores: {
            allReoffendingPredictor: {
              band: FourBandRiskScoreBand.HIGH,
              score: 7,
              staticOrDynamic: StaticOrDynamic.STATIC,
            },
            violentReoffendingPredictor: {
              band: FourBandRiskScoreBand.MEDIUM,
              score: 5,
              staticOrDynamic: StaticOrDynamic.DYNAMIC,
            },
            seriousViolentReoffendingPredictor: {
              band: FourBandRiskScoreBand.VERY_HIGH,
              score: 9,
              staticOrDynamic: StaticOrDynamic.STATIC,
            },
            directContactSexualReoffendingPredictor: { band: FourBandRiskScoreBand.LOW, score: 2 },
            indirectImageContactSexualReoffendingPredictor: { band: ThreeBandRiskScoreBand.MEDIUM, score: 4 },
            combinedSeriousReoffendingPredictor: {
              band: FourBandRiskScoreBand.HIGH,
              score: 8,
              staticOrDynamic: StaticOrDynamic.DYNAMIC,
            },
          },
        },
        historical: [],
      },
      roshHistory: { registrations: [], error: null },
    }

    const transformed = transformRisk(riskResponseV2)
    const predictorScales = transformed.predictorScales!

    expect(predictorScales?.allReoffending).toEqual({
      type: 'All Reoffending Predictor',
      level: 'HIGH',
      score: '7',
      staticOrDynamic: 'STATIC',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '50%', '75%', '90%', '100%'],
    })

    expect(predictorScales?.violentReoffending).toEqual({
      type: 'Violent Reoffending Predictor',
      level: 'MEDIUM',
      score: '5',
      staticOrDynamic: 'DYNAMIC',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '30%', '60%', '80%', '100%'],
    })

    expect(predictorScales?.seriousViolentReoffending).toEqual({
      type: 'Serious Violent Reoffending Predictor',
      level: 'VERY_HIGH',
      score: '9',
      staticOrDynamic: 'STATIC',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '0.99%', '2.99%', '6.89%', '99%'],
    })

    expect(predictorScales?.directContactSexual).toEqual({
      type: 'Direct Contact - Sexual Reoffending Predictor',
      level: 'LOW',
      score: '2',
      lastUpdated: '1 January 2026',
      bandPercentages: [],
    })

    expect(predictorScales?.indirectImageContactSexual).toEqual({
      type: 'Images and Indirect Contact - Sexual Reoffending Predictor',
      level: 'MEDIUM',
      score: '4',
      lastUpdated: '1 January 2026',
      bandPercentages: [],
    })

    expect(predictorScales?.combinedSerious).toEqual({
      type: 'Combined Serious Reoffending Predictor',
      level: 'HIGH',
      score: '8',
      staticOrDynamic: 'DYNAMIC',
      lastUpdated: '1 January 2026',
      bandPercentages: ['0%', '1%', '3%', '6.9%', '25%'],
    })
  })

  it('handles missing levels/bands as NOT_APPLICABLE', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const riskResponse: RiskResponse = {
      predictorScores: {
        error: '',
        current: {
          date: baseDate,
          scores: {
            RSR: { level: null, type: 'RSR', score: null },
            allReoffendingPredictor: { band: null, score: null, staticOrDynamic: null } as StaticOrDynamicPredictor,
          },
        },
        historical: [],
      },
      roshHistory: { registrations: [], error: null },
    }

    const transformed = transformRisk(riskResponse)
    const { predictorScales } = transformed

    expect(predictorScales?.rsr?.level).toBe('NOT_APPLICABLE')
    expect(predictorScales?.allReoffending?.level).toBe('NOT_APPLICABLE')
  })
})
