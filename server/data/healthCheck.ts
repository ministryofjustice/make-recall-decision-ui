import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
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
  serviceTimeout: ServiceTimeout = new ServiceTimeout()
): ServiceCheck {
  const keepaliveAgent = url.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)

  return () =>
    new Promise((resolve, reject) => {
      superagent
        .get(url)
        .agent(keepaliveAgent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message} when calling ${name}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(serviceTimeout)
        .end((error, result) => {
          if (error) {
            logger.error(error.stack, `Error calling ${name}`)
            reject(error)
          } else if (result.status === 200) {
            resolve('OK')
          } else {
            reject(result.status)
          }
        })
    })
}
