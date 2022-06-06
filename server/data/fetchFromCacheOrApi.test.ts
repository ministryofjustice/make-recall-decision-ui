import { RedisClient } from 'redis'
import waitForExpect from 'wait-for-expect'
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

  it('should return the cached data, if present, and update the cache', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
      JSON.stringify({
        firstName: 'Bobby',
        lastName: 'Badger',
      })
    )
    fetchFromApi.mockResolvedValue({
      firstName: 'Brian',
      lastName: 'Bling',
    })
    const data = await fetchFromCacheOrApi(fetchFromApi, redisKey)
    expect(data).toEqual({
      firstName: 'Bobby',
      lastName: 'Badger',
    })
    // the value was returned from the cache but a fetch was triggered (and not waited for)
    expect(fetchFromApi).toHaveBeenCalled()
    await waitForExpect(() => {
      expect(redisSet).toHaveBeenCalledWith(
        redisKey,
        JSON.stringify({
          firstName: 'Brian',
          lastName: 'Bling',
        })
      )
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
    expect(redisExpire).toHaveBeenCalledWith(redisKey, 86400)
  })
})
