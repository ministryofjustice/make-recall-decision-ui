import RestClient from './restClient'
import { PpudApiConfig } from '../config'

export default class PpudRestClient extends RestClient {
  ppudTimeout: {
    response: number
    deadline: number
  }

  constructor(name: string, ppudApiConfig: PpudApiConfig, token: string) {
    super(name, ppudApiConfig, token)
    this.ppudTimeout = ppudApiConfig.ppudTimeout
  }

  protected override timeoutConfig(): {
    response: number
    deadline: number
  } {
    return this.ppudTimeout
  }
}
