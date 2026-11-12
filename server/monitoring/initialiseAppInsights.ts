import { config } from 'dotenv'
import { initialiseTelemetry, telemetry, flushTelemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import applicationPackageInfo from '../applicationPackageInfo'
import appConfig from '../config'

function defaultName(): string {
  const {
    packageData: { name },
  } = applicationPackageInfo
  return name
}

function version(): string {
  const { buildNumber } = appConfig
  return buildNumber
}

// Runs at import time so that OpenTelemetry instruments bunyan before any other module loads it.
// esbuild hoists all require() calls above executable code, so calling this as a function from
// server.ts would be too late — server/index (and its transitive imports) would already have loaded bunyan.
config()
const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_INSTRUMENTATIONKEY
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

export default flushTelemetry
