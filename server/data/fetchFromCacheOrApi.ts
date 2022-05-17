import { getRedisAsync, createRedisClient } from './redisClient'
import logger from '../../logger'

const TTL_SECONDS = 60 * 10

export const fetchFromCacheOrApi = async (fetchDataFn: () => Promise<unknown>, redisKey: string) => {
  const stored = await getRedisAsync(redisKey)
  if (stored) {
    logger.info(`Redis cache hit for ${redisKey}`)
    try {
      return JSON.parse(stored)
    } catch (err) {
      logger.error(err)
    }
  }
  const data = await fetchDataFn()
  try {
    const redisClient = createRedisClient()
    redisClient.set(redisKey, JSON.stringify(data))
    redisClient.expire(redisKey, TTL_SECONDS)
  } catch (err) {
    logger.error(err)
  }
  return data
}
