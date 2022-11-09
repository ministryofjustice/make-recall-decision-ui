import { config } from 'dotenv'
import { setup, defaultClient, TelemetryClient, DistributedTracingModes } from 'applicationinsights'
import applicationVersion from '../applicationVersion'
import logger from '../../logger'

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

export const appInsightsEvent = (eventName: string, crn: string, username: string, recommendationId: string) => {
  if (defaultClient && eventName) {
    const eventProperties = {
      crn,
      userName: username,
      recommendationId,
    }

    logger.info(`About to track the ${eventName} event to app insights`)
    defaultClient.trackEvent({ name: eventName, properties: eventProperties })
    logger.info(`Tracked the ${eventName} event to app insights`)
  }
}
