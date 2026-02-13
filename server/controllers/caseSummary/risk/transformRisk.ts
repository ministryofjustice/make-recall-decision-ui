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
    case 'NOT_APPLICABLE':
      return level
    default:
      return 'UNKNOWN'
  }
}

const buildV1Predictor = ({
  label,
  level,
  score,
  staticOrDynamic,
  lastUpdated,
  bandPercentages = [],
}: {
  label: string
  level: string
  score: string
  staticOrDynamic?: string
  lastUpdated: string
  bandPercentages?: string[]
}): PredictorScaleViewModel => {
  if (!level) {
    return { type: label, level: 'NOT_APPLICABLE', bandPercentages }
  }

  return {
    type: label,
    level: mapLevel(level),
    score,
    staticOrDynamic,
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
    score: predictor.score?.toString(),
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

export type TimelinePredictor = {
  level: string
  type: string
  score?: string
  staticOrDynamic?: string
}

export type TimelineItem = {
  date: string
  scores: Record<string, TimelinePredictor>
}

const V2_PREDICTOR_LABELS: Record<string, string> = {
  allReoffendingPredictor: 'All Reoffending Predictor',
  violentReoffendingPredictor: 'Violent Reoffending Predictor',
  directContactSexualReoffendingPredictor: 'Direct Contact – Sexual Reoffending Predictor',
  indirectImageContactSexualReoffendingPredictor: 'Images and Indirect Contact – Sexual Reoffending Predictor',
  seriousViolentReoffendingPredictor: 'Serious Violent Reoffending Predictor',
  combinedSeriousReoffendingPredictor: 'Combined Serious Reoffending Predictor',
}

export const normaliseTimelineScores = (scores: Record<string, unknown>): Record<string, TimelinePredictor> => {
  const normalised: Record<string, TimelinePredictor> = {}

  Object.entries(scores).forEach(([key, value]) => {
    if (!value) return

    // V1 predictors
    if (['RSR', 'OSPC', 'OSPI', 'OSPDC', 'OSPIIC', 'OGRS', 'OGP', 'OVP', 'SNSV'].includes(key)) {
      const v1 = value as {
        level: string
        type: string
        score?: string | number
        staticOrDynamic?: string
        twoYears?: string | number
      }

      normalised[key] = {
        level: v1.level,
        type: v1.type,
        score: key === 'OGRS' || key === 'OGP' || key === 'OVP' ? v1.twoYears?.toString() : v1.score?.toString(),
        staticOrDynamic: v1.staticOrDynamic,
      }

      return
    }

    // V2 predictors
    if (key in V2_PREDICTOR_LABELS) {
      const v2 = value as {
        band: string | null
        score?: number
        staticOrDynamic?: string
      }

      normalised[key] = {
        level: v2.band ?? undefined,
        type: V2_PREDICTOR_LABELS[key],
        score: v2.score?.toString(),
        staticOrDynamic: v2.staticOrDynamic,
      }
    }
  })

  return normalised
}

export const transformRisk = (caseSummary: RiskResponse) => {
  let timeline: unknown[] = []

  if (!caseSummary.roshHistory?.error && Array.isArray(caseSummary.roshHistory?.registrations)) {
    timeline = caseSummary.roshHistory.registrations
      .filter(item => ['RHRH', 'RVHR'].includes(item.type.code))
      .map(({ startDate, notes, type }) => ({
        date: startDate,
        formattedDate: formatDateTimeFromIsoString({ isoDate: startDate }),
        notes,
        level: type.code === 'RHRH' ? 'HIGH' : 'VERY_HIGH',
        type: 'RoSH',
      }))
  }

  if (!caseSummary.predictorScores?.error) {
    timeline = [
      ...timeline,
      ...(caseSummary.predictorScores?.historical ?? []).map(item => ({
        date: item.date,
        formattedDate: formatDateTimeFromIsoString({ isoDate: item.date }),
        scores: normaliseTimelineScores(item.scores),
      })),
    ]
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
              scores.directContactSexualReoffendingPredictor.score?.toString(),
              lastUpdated
            )
          : undefined,

        indirectImageContactSexual: scores.indirectImageContactSexualReoffendingPredictor
          ? buildV2Predictor(
              'Images and Indirect Contact - Sexual Reoffending Predictor',
              scores.indirectImageContactSexualReoffendingPredictor.band,
              scores.indirectImageContactSexualReoffendingPredictor.score?.toString(),
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
          ? buildV1Predictor({
              label: scores.RSR.type,
              level: scores.RSR.level,
              score: scores.RSR.score,
              staticOrDynamic: scores.RSR.staticOrDynamic,
              lastUpdated,
              bandPercentages: ['0%', '3%', '6.9%', '25%'],
            })
          : undefined,

        ospc: scores.OSPC
          ? buildV1Predictor({
              label: scores.OSPC.type,
              level: scores.OSPC.level,
              score: scores.OSPC.score,
              lastUpdated,
            })
          : undefined,

        ospi: scores.OSPI
          ? buildV1Predictor({
              label: scores.OSPI.type,
              level: scores.OSPI.level,
              score: scores.OSPI.score,
              lastUpdated,
            })
          : undefined,

        ospdc: scores.OSPDC
          ? buildV1Predictor({
              label: scores.OSPDC.type,
              level: scores.OSPDC.level,
              score: scores.OSPDC.score,
              lastUpdated,
            })
          : undefined,

        ospiic: scores.OSPIIC
          ? buildV1Predictor({
              label: scores.OSPIIC.type,
              level: scores.OSPIIC.level,
              score: scores.OSPIIC.score,
              lastUpdated,
            })
          : undefined,

        ogrs: scores.OGRS
          ? buildV1Predictor({
              label: scores.OGRS.type,
              level: scores.OGRS.level,
              score: scores.OGRS.twoYears,
              lastUpdated,
              bandPercentages: ['0%', '50%', '75%', '90%', '100%'],
            })
          : undefined,

        ogp: scores.OGP
          ? buildV1Predictor({
              label: scores.OGP.type,
              level: scores.OGP.level,
              score: scores.OGP.twoYears,
              lastUpdated,
              bandPercentages: ['0%', '34%', '67%', '85%', '100%'],
            })
          : undefined,

        ovp: scores.OVP
          ? buildV1Predictor({
              label: scores.OVP.type,
              level: scores.OVP.level,
              score: scores.OVP.twoYears,
              lastUpdated,
              bandPercentages: ['0%', '30%', '60%', '80%', '100%'],
            })
          : undefined,
      }
    : undefined

  return {
    ...caseSummary,
    timeline,
    predictorScales,
  }
}
