import { RedisClient } from 'redis'
import * as redisExports from './redisClient'
import { fetchFromCacheOrApi } from './fetchFromCacheOrApi'

describe('fetchFromCacheOrApi', () => {
  const fetchFromApi = jest.fn()
  const redisSet = jest.fn()
  const redisExpire = jest.fn()
  const redisKey = 'prefix:123'

  beforeEach(() => {
    jest
      .spyOn(redisExports, 'createRedisClient')
      .mockReturnValue({ set: redisSet, expire: redisExpire } as unknown as RedisClient)
  })

  it('should return the cached data, if present', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
      JSON.stringify({
        firstName: 'Bobby',
        lastName: 'Badger',
      })
    )
    const data = await fetchFromCacheOrApi(fetchFromApi, redisKey)
    expect(data).toEqual({
      firstName: 'Bobby',
      lastName: 'Badger',
    })
  })

  it('should return the API data, if cache is empty', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    fetchFromApi.mockResolvedValue({
      firstName: 'Brian',
      lastName: 'Bling',
    })
    const data = await fetchFromCacheOrApi(fetchFromApi, redisKey)
    expect(data).toEqual({
      firstName: 'Brian',
      lastName: 'Bling',
    })
  })

  it('should populate the cache with the API data, if cache is empty', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    fetchFromApi.mockResolvedValue({
      firstName: 'Brian',
      lastName: 'Bling',
    })
    await fetchFromCacheOrApi(fetchFromApi, redisKey)
    expect(redisSet).toHaveBeenCalledWith(
      redisKey,
      JSON.stringify({
        firstName: 'Brian',
        lastName: 'Bling',
      })
    )
    expect(redisExpire).toHaveBeenCalledWith(redisKey, 3600)
  })
})
