import { Readable } from 'stream'
import { RestClient as HmppsRestClient, ApiConfig } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'

interface GetRequest {
  path?: string
  query?: string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (path: string, method: string, error: Error) => void
}

export default class RestClient {
  private readonly client: HmppsRestClient

  constructor(
    private readonly name: string,
    protected readonly config: ApiConfig,
    private readonly token: string,
  ) {
    this.client = new HmppsRestClient(name, config, logger)
  }

  protected timeoutConfig(): {
    response: number
    deadline: number
  } {
    return this.config.timeout
  }

  async get({ path = null, query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path} ${query}`)

    const result = await this.client.get(
      {
        path,
        query,
        headers,
        responseType,
        raw,
        timeout: this.timeoutConfig(),
      },
      this.token,
    )

    if (
      !raw &&
      result !== null &&
      typeof result === 'object' &&
      !Array.isArray(result) &&
      Object.keys(result).length === 0
    ) {
      return null
    }

    return result
  }

  async post({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<unknown> {
    logger.info(`Post using user credentials: calling ${this.name}: ${path}`)
    return this.client.post(
      {
        path,
        headers,
        responseType,
        data,
        raw,
        timeout: this.timeoutConfig(),
      },
      this.token,
    )
  }

  async put({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<unknown> {
    logger.info(`Put using user credentials: calling ${this.name}: ${path}`)
    return this.client.put(
      {
        path,
        headers,
        responseType,
        data,
        raw,
        timeout: this.timeoutConfig(),
      },
      this.token,
    )
  }

  async delete({ path = null, headers = {}, responseType = '', raw = false }: PostRequest = {}): Promise<unknown> {
    logger.info(`Delete using user credentials: calling ${this.name}: ${path}`)
    return this.client.delete(
      {
        path,
        headers,
        responseType,
        raw,
        timeout: this.timeoutConfig(),
      },
      this.token,
    )
  }

  async patch<T>({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<T> {
    return this.client.patch<T>(
      {
        path,
        headers,
        responseType,
        data,
        raw,
        timeout: this.timeoutConfig(),
      },
      this.token,
    )
  }

  async stream({ path = null, headers = {} }: StreamRequest = {}): Promise<Readable> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return this.client.stream(
      {
        path,
        headers,
        timeout: this.timeoutConfig(),
      },
      this.token,
    )
  }
}
