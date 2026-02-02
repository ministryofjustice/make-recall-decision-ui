import { RiskResponse } from '../../../@types/make-recall-decision-api'
import { sortListByDateField } from '../../../utils/dates'
import { StaticOrDynamicPredictor } from '../../../@types/make-recall-decision-api/models/Scores'
import { formatDateTimeFromIsoString } from '../../../utils/dates/formatting'

export type PredictorScaleViewModel = {
  type?: string
  level?: string
  score?: string
  staticOrDynamic?: string
  lastUpdated?: string
  bandPercentages?: string[]
}

export type PredictorScaleSet = {
  rsr?: PredictorScaleViewModel
  ospc?: PredictorScaleViewModel
  ospi?: PredictorScaleViewModel
  ospdc?: PredictorScaleViewModel
  ospiic?: PredictorScaleViewModel
  ogrs?: PredictorScaleViewModel
  ogp?: PredictorScaleViewModel
  ovp?: PredictorScaleViewModel

  allReoffending?: PredictorScaleViewModel
  violentReoffending?: PredictorScaleViewModel
  seriousViolentReoffending?: PredictorScaleViewModel
  directContactSexual?: PredictorScaleViewModel
  indirectImageContactSexual?: PredictorScaleViewModel
  combinedSerious?: PredictorScaleViewModel
}

const mapLevel = (level?: string | null): string => {
  switch (level) {
    case 'LOW':
    case 'MEDIUM':
    case 'HIGH':
    case 'VERY_HIGH':
      return level
    default:
      return 'NOT_APPLICABLE'
  }
}

const buildV1Predictor = (
  label: string,
  level?: string,
  score?: string,
  lastUpdated?: string,
  bandPercentages: string[] = []
): PredictorScaleViewModel => {
  if (!level) {
    return { type: label, level: 'NOT_APPLICABLE', bandPercentages }
  }

  return {
    type: label,
    level: mapLevel(level),
    score,
    lastUpdated,
    bandPercentages,
  }
}

const buildV2StaticOrDynamicPredictor = (
  label: string,
  predictor?: StaticOrDynamicPredictor,
  lastUpdated?: string,
  bandPercentages: string[] = []
): PredictorScaleViewModel => {
  if (!predictor?.band) {
    return { type: label, level: 'NOT_APPLICABLE', bandPercentages }
  }

  return {
    type: label,
    level: mapLevel(predictor.band),
    score: predictor.score.toString(),
    staticOrDynamic: predictor.staticOrDynamic,
    lastUpdated,
    bandPercentages,
  }
}

const buildV2Predictor = (
  label: string,
  band?: string,
  score?: string,
  lastUpdated?: string,
  bandPercentages: string[] = []
): PredictorScaleViewModel => {
  if (!band) {
    return { type: label, level: 'NOT_APPLICABLE', bandPercentages }
  }

  return {
    type: label,
    level: mapLevel(band),
    score,
    lastUpdated,
    bandPercentages,
  }
}

export const transformRisk = (caseSummary: RiskResponse) => {
  let timeline: unknown[] = []

  if (!caseSummary.roshHistory?.error && Array.isArray(caseSummary.roshHistory?.registrations)) {
    timeline = caseSummary.roshHistory.registrations
      .filter(item => ['RHRH', 'RVHR'].includes(item.type.code))
      .map(({ startDate, notes, type }) => ({
        date: startDate,
        notes,
        level: type.code === 'RHRH' ? 'HIGH' : 'VERY_HIGH',
        type: 'RoSH',
      }))
  }

  if (!caseSummary.predictorScores?.error) {
    timeline = [...timeline, ...(caseSummary.predictorScores?.historical ?? [])]
  }

  if (timeline.length) {
    timeline = sortListByDateField({
      list: timeline as Record<string, unknown>[],
      dateKey: 'date',
      newestFirst: true,
    })
  }

  const currentPredictors = caseSummary.predictorScores?.current
  const lastUpdated = formatDateTimeFromIsoString({
    isoDate: currentPredictors?.date,
    dateOnly: true,
  })
  const scores = currentPredictors?.scores

  const predictorScales: PredictorScaleSet | undefined = scores
    ? {
        // V2 scores
        allReoffending: scores.allReoffendingPredictor
          ? buildV2StaticOrDynamicPredictor('All Reoffending Predictor', scores.allReoffendingPredictor, lastUpdated, [
              '0%',
              '50%',
              '75%',
              '90%',
              '100%',
            ])
          : undefined,

        violentReoffending: scores.violentReoffendingPredictor
          ? buildV2StaticOrDynamicPredictor(
              'Violent Reoffending Predictor',
              scores.violentReoffendingPredictor,
              lastUpdated,
              ['0%', '30%', '60%', '80%', '100%']
            )
          : undefined,

        directContactSexual: scores.directContactSexualReoffendingPredictor
          ? buildV2Predictor(
              'Direct Contact - Sexual Reoffending Predictor',
              scores.directContactSexualReoffendingPredictor.band,
              scores.directContactSexualReoffendingPredictor.score.toString(),
              lastUpdated
            )
          : undefined,

        indirectImageContactSexual: scores.indirectImageContactSexualReoffendingPredictor
          ? buildV2Predictor(
              'Images and Indirect Contact - Sexual Reoffending Predictor',
              scores.indirectImageContactSexualReoffendingPredictor.band,
              scores.indirectImageContactSexualReoffendingPredictor.score.toString(),
              lastUpdated
            )
          : undefined,

        seriousViolentReoffending: scores.seriousViolentReoffendingPredictor
          ? buildV2StaticOrDynamicPredictor(
              'Serious Violent Reoffending Predictor',
              scores.seriousViolentReoffendingPredictor,
              lastUpdated,
              ['0%', '0.99%', '2.99%', '6.89%', '99%']
            )
          : undefined,

        combinedSerious: scores.combinedSeriousReoffendingPredictor
          ? buildV2StaticOrDynamicPredictor(
              'Combined Serious Reoffending Predictor',
              scores.combinedSeriousReoffendingPredictor,
              lastUpdated,
              ['0%', '1%', '3%', '6.9%', '25%']
            )
          : undefined,

        // V1 (legacy) scores
        rsr: scores.RSR
          ? buildV1Predictor('RSR', scores.RSR.level, scores.RSR.score, lastUpdated, ['0%', '3%', '6.9%', '25%'])
          : undefined,

        ospc: scores.OSPC ? buildV1Predictor('OSPC', scores.OSPC.level, scores.OSPC.score, lastUpdated) : undefined,

        ospi: scores.OSPI ? buildV1Predictor('OSPI', scores.OSPI.level, scores.OSPI.score, lastUpdated) : undefined,

        ospdc: scores.OSPDC
          ? buildV1Predictor('OSP/DC', scores.OSPDC.level, scores.OSPDC.score, lastUpdated)
          : undefined,

        ospiic: scores.OSPIIC
          ? buildV1Predictor('OSP/IIC', scores.OSPIIC.level, scores.OSPIIC.score, lastUpdated)
          : undefined,

        ogrs: scores.OGRS
          ? buildV1Predictor('OGRS3', scores.OGRS.level, scores.OGRS.twoYears, lastUpdated, [
              '0%',
              '50%',
              '75%',
              '90%',
              '100%',
            ])
          : undefined,

        ogp: scores.OGP
          ? buildV1Predictor('OGP', scores.OGP.level, scores.OGP.twoYears, lastUpdated, [
              '0%',
              '34%',
              '67%',
              '85%',
              '100%',
            ])
          : undefined,

        ovp: scores.OVP
          ? buildV1Predictor('OVP', scores.OVP.level, scores.OVP.twoYears, lastUpdated, [
              '0%',
              '30%',
              '60%',
              '80%',
              '100%',
            ])
          : undefined,
      }
    : undefined

  return {
    ...caseSummary,
    timeline,
    predictorScales,
  }
}
