import redis, { RedisClient } from 'redis'

import config from '../config'

let redisClient: RedisClient

export const createRedisClient = () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      port: config.redis.port,
      password: config.redis.password,
      host: config.redis.host,
      tls: config.redis.tls_enabled === 'true' ? {} : false,
    })
  }
  return redisClient
}
