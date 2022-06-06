import { getRedisAsync, createRedisClient } from './redisClient'
import logger from '../../logger'

const TTL_SECONDS = 60 * 60 * 24

const fetchAndCache = async (fetchDataFn: () => Promise<unknown>, redisKey: string) => {
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

export const fetchFromCacheOrApi = async (fetchDataFn: () => Promise<unknown>, redisKey: string) => {
  const stored = await getRedisAsync(redisKey)
  if (stored) {
    logger.info(`Redis cache hit for ${redisKey}`)
    try {
      // kick off a fetch to update the cache, but don't wait for it
      fetchAndCache(fetchDataFn, redisKey)
      return JSON.parse(stored)
    } catch (err) {
      logger.error(err)
    }
  }
  return fetchAndCache(fetchDataFn, redisKey)
}
