import { config } from 'dotenv'
import { setup, defaultClient, TelemetryClient, DistributedTracingModes } from 'applicationinsights'
import { performance } from 'perf_hooks'
import applicationVersion from '../applicationVersion'

import { FeatureFlags } from '../@types/featureFlags'

function defaultName(): string {
  const {
    packageData: { name },
  } = applicationVersion
  return name
}

function version(): string {
  const { buildNumber } = applicationVersion
  return buildNumber
}

export function initialiseAppInsights(): void {
  // Loads .env file contents into | process.env
  config()
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient(name = defaultName()): TelemetryClient {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    return defaultClient
  }
  return null
}

export const appInsightsEvent = (
  eventName: string,
  userName: string,
  eventData: Record<string, unknown>,
  _: FeatureFlags
) => {
  if (defaultClient && eventName) {
    defaultClient.trackEvent({ name: eventName, properties: { ...eventData, userName } })
  }
}

export const appInsightsTimingMetric = ({ name, startTime }: { name: string; startTime: number }) => {
  defaultClient?.trackMetric({ name, value: Math.round(performance.now() - startTime) })
}
