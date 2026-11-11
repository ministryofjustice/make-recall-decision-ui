import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { performance } from 'perf_hooks'
import applicationPackageInfo from '../applicationPackageInfo'
import logger from '../../logger'

import type { FeatureFlags } from '../@types/featureFlags'

export function defaultName(): string {
  const {
    packageData: { name },
  } = applicationPackageInfo
  return name
}


export const appInsightsEvent = (
  eventName: string,
  userName: string,
  eventData: Record<string, unknown>,
  _: FeatureFlags,
) => {
  if (eventName) {
    try {
      const attributes: Record<string, string | number | boolean> = { userName }
      for (const [key, value] of Object.entries(eventData)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            attributes[key] = value
          } else {
            attributes[key] = JSON.stringify(value)
          }
        }
      }
      telemetry.trackEvent(eventName, attributes)
    } catch (err) {
      logger.warn('AppInsights error:', err)
    }
  } else {
    logger.warn('No event name provided for appInsights')
  }
}

export const appInsightsTimingMetric = ({ name, startTime }: { name: string; startTime: number }) => {
  try {
    telemetry.trackEvent(name, { durationMs: Math.round(performance.now() - startTime) })
  } catch {
    // silently ignore timing metric failures
  }
}
