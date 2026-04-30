import { FliptClient } from '@flipt-io/flipt-client-js'
import createClient from '../data/fliptClient'
import logger from '../../logger'
import { HmppsAuthUser } from '../@types/make-recall-decision-api/models/hmpps-auth/User'

const cache = new Map<string, { value: FeatureFlagResponse[]; expiresAt: number }>()
const cacheTTL = 30 * 1000 // 30 second cache

interface FeatureFlagResponse {
  key: string
  description: string
  enabled: boolean
  type: 'BOOLEAN_FLAG_TYPE' | 'VARIANT_FLAG_TYPE'
}

export default class FeatureFlagService {
  client: FliptClient

  user: HmppsAuthUser

  constructor(user: HmppsAuthUser) {
    this.user = user
  }

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
      const flags: FeatureFlagResponse[] = await (await this.fliptClient()).listFlags()

      const evaluatedFlags = await Promise.all(
        flags.map(async flag => {
          const enabled = await this.isFeatureEnabled(flag.key, flag.type)
          return { ...flag, enabled }
        }),
      )

      cache.set(cacheKey, { value: evaluatedFlags, expiresAt: now + cacheTTL })
      return flags
    } catch (error) {
      logger.error(error, 'Error retrieving all flags')
      return []
    }
  }

  async isFeatureEnabled(key: string, flagType: FeatureFlagResponse['type']): Promise<boolean> {
    try {
      const evaluationArguments = {
        entityId: this.user.username,
        flagKey: key,
        context: {
          Time: new Date(Date.now()).toISOString(),
        },
      }

      const flag =
        flagType === 'BOOLEAN_FLAG_TYPE'
          ? await (await this.fliptClient()).evaluateBoolean(evaluationArguments)
          : await (await this.fliptClient()).evaluateVariant(evaluationArguments)

      return flag.enabled
    } catch (error) {
      logger.error(`Error evaluating flag with key ${key}:`, error)
      return null
    }
  }

  clearCache() {
    cache.clear()
  }
}
