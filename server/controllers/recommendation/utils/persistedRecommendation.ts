import { getValue } from '../../../data/fetchFromCacheOrApi'
import { createRedisClient } from '../../../data/redisClient'

const cacheKey = (crn: string) => `recommendation:${crn}`

export const getRecommendation = async (crn: string) => {
  const existing = await getValue(cacheKey(crn))
  return existing
}

export const saveRecommendation = async ({ data, crn }: { data: unknown; crn: string }) => {
  const redisClient = createRedisClient()
  redisClient.set(cacheKey(crn), JSON.stringify(data))
}
