import RestClient from './restClient'
import { PpudApiConfig, AgentConfig } from '../config'

export default class PpudRestClient extends RestClient {
  ppudTimeout: {
    response: number
    deadline: number
  }

  protected ppudAgentConfig: AgentConfig

  constructor(name: string, ppudApiConfig: PpudApiConfig, token: string) {
    super(name, ppudApiConfig, token)
    this.ppudTimeout = ppudApiConfig.ppudTimeout
    this.ppudAgentConfig = ppudApiConfig.ppudAgent
  }

  protected override timeoutConfig(): {
    response: number
    deadline: number
  } {
    return this.ppudTimeout
  }
}
