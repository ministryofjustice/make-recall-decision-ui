import { FliptClient } from '@flipt-io/flipt-client-js'
import createClient from '../data/fliptClient'
import logger from '../../logger'
import { HmppsAuthUser } from '../@types/make-recall-decision-api/models/hmpps-auth/User'

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
        this.client = await createClient()
      } catch (err) {
        logger.error(err, 'Unable to connect to feature flag service')
        throw Error('Unable to connect to feature flag service')
      }
    }

    return this.client
  }

  private closeClient(): void {
    if (this.client) {
      try {
        this.client.close()
      } catch (error) {
        logger.warn(error, 'Error closing flipt client')
      } finally {
        this.client = undefined
      }
    }
  }

  async getAll(): Promise<FeatureFlagResponse[]> {
    try {
      logger.info('Making flipt flag request')
      const client = await this.fliptClient()
      const flags: FeatureFlagResponse[] = await client.listFlags()

      const evaluatedFlags = await Promise.all(
        flags.map(async flag => {
          const enabled = await this.isFeatureEnabled(flag.key, flag.type)
          return { ...flag, enabled }
        }),
      )

      return evaluatedFlags
    } catch (error) {
      logger.error(error, 'Error retrieving all flags')
      return []
    } finally {
      this.closeClient()
    }
  }

  private async isFeatureEnabled(key: string, flagType: FeatureFlagResponse['type']): Promise<boolean> {
    try {
      const evaluationArguments = {
        entityId: this.user.username,
        flagKey: key,
        context: {
          Time: new Date(Date.now()).toISOString(),
        },
      }

      const client = await this.fliptClient()
      const flag =
        flagType === 'BOOLEAN_FLAG_TYPE'
          ? await client.evaluateBoolean(evaluationArguments)
          : await client.evaluateVariant(evaluationArguments)

      return flag.enabled
    } catch (error) {
      logger.error(`Error evaluating flag with key ${key}:`, error)
      return null
    }
  }
}
