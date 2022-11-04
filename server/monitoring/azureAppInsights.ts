import { config } from 'dotenv'
import { setup, defaultClient, TelemetryClient, DistributedTracingModes } from 'applicationinsights'
import { Request } from 'express'
import applicationVersion from '../applicationVersion'
import logger from '../../logger'

const appInsightsClient = buildAppInsightsClient()

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
    if (defaultClient) {
      defaultClient.context.tags['ai.cloud.role'] = name
      defaultClient.context.tags['ai.application.ver'] = version()
    }
    return defaultClient
  }
  return null
}

export const trackEvent = (eventName: string, req: Request) => {
  const requestBody = req.body

  if (appInsightsClient && eventName) {
    const eventProperties = {
      crn: requestBody?.crn,
      userName: req.user?.username,
    }
    logger.info(`About to track the ${eventName} event to app insights`)
    appInsightsClient.trackEvent({ name: eventName, properties: eventProperties })
    logger.info(`Tracked the ${eventName} event to app insights`)
  }
}
