import { RestClient as HmppsRestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import { AgentConfig } from '../config'

export type ServiceCheck = () => Promise<string>

export class ServiceTimeout {
  response = 5000

  deadline = 5500
}

export function serviceCheckFactory(
  name: string,
  url: string,
  agentOptions: AgentConfig,
  serviceTimeout: ServiceTimeout = new ServiceTimeout(),
): ServiceCheck {
  const parsedUrl = new URL(url)
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`
  const healthPath = parsedUrl.pathname || '/'

  const client = new HmppsRestClient(name, { url: baseUrl, timeout: serviceTimeout, agent: agentOptions }, logger)

  return async () => {
    try {
      await client.get({ path: healthPath, retries: 2 })
      return 'OK'
    } catch (error) {
      logger.error(error.stack, `Error calling ${name}`)
      throw error
    }
  }
}
