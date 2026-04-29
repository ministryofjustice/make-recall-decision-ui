import { FliptClient } from '@flipt-io/flipt-client-js'
import createClient from '../data/fliptClient'
import logger from '../../logger'

const cache = new Map<string, { value: FeatureFlagResponse[]; expiresAt: number }>()
const cacheTTL = 30 * 1000 // 30 second cache

interface FeatureFlagResponse {
  key: string
  description: string
  enabled: boolean
}

export default class FeatureFlagService {
  client: FliptClient

  async fliptClient(): Promise<FliptClient> {
    if (!this.client) {
      try {
        this.client = createClient()
      } catch (err) {
        logger.error(err, 'Unable to connect to feature flag service')
        throw Error('Unable to connect to feature flag service')
      }
    }

    return this.client
  }

  async getAll(): Promise<FeatureFlagResponse[]> {
    const cacheKey = 'allFlags'
    const now = Date.now()
    const cached = cache.get(cacheKey)

    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    try {
      logger.info('Making flipt flag request')
      const flags = (await this.fliptClient()).listFlags()
      cache.set(cacheKey, { value: flags, expiresAt: now + cacheTTL })
      return flags
    } catch (error) {
      logger.error(error, 'Error retrieving all flags')
      return []
    }
  }

  clearCache() {
    cache.clear()
  }
}
