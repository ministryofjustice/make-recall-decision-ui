import { config } from 'dotenv'
import { initialiseTelemetry, telemetry, flushTelemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { performance } from 'perf_hooks'
import applicationPackageInfo from '../applicationPackageInfo'
import appConfig from '../config'

import type { FeatureFlags } from '../@types/featureFlags'
import logger from '../../logger'

export function defaultName(): string {
  const {
    packageData: { name },
  } = applicationPackageInfo
  return name
}

function version(): string {
  const { buildNumber } = appConfig
  return buildNumber
}

export function initialiseAppInsights(): void {
  // Loads .env file contents into | process.env
  config()
  const connectionString =
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_INSTRUMENTATIONKEY
  if (connectionString) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    initialiseTelemetry({
      serviceName: defaultName(),
      serviceVersion: version(),
      connectionString,
    })
      .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/assets/*']))
      .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
      .startRecording()
  }
}

export { flushTelemetry }

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
