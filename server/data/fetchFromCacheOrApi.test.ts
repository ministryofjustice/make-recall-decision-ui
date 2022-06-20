import { RedisClient } from 'redis'
import waitForExpect from 'wait-for-expect'
import * as redisExports from './redisClient'
import { fetchFromCacheOrApi } from './fetchFromCacheOrApi'

describe('fetchFromCacheOrApi', () => {
  const fetchDataFn = jest.fn()
  const checkWhetherToCacheDataFn = jest.fn()
  const redisSet = jest.fn()
  const redisDel = jest.fn()
  const redisExpire = jest.fn()
  const redisKey = 'prefix:123'
  const userId = 'a123-b456'

  beforeEach(() => {
    jest
      .spyOn(redisExports, 'createRedisClient')
      .mockReturnValue({ set: redisSet, expire: redisExpire, del: redisDel } as unknown as RedisClient)
  })

  describe('CRN is excluded or restricted', () => {
    beforeEach(() => checkWhetherToCacheDataFn.mockReturnValue(false))

    it('should return the API response not the cached data, if the userId is not on the whitelist', async () => {
      jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
        JSON.stringify({
          userIds: ['x987-y654'],
          data: {
            firstName: 'Bobby',
            lastName: 'Badger',
          },
        })
      )
      fetchDataFn.mockResolvedValue({
        lastName: 'Smith',
      })
      const data = await fetchFromCacheOrApi({ fetchDataFn, checkWhetherToCacheDataFn, userId, redisKey })
      expect(fetchDataFn).toHaveBeenCalled()
      // API data should be returned
      expect(data).toEqual({
        lastName: 'Smith',
      })
      expect(redisSet).not.toHaveBeenCalled()
    })

    it('should not cache the API data if checkWhetherToCacheDataFn returns false, and deletes any existing cache', async () => {
      checkWhetherToCacheDataFn.mockReturnValue(false)
      jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
        JSON.stringify({
          userIds: [userId],
          data: {
            firstName: 'Bobby',
            lastName: 'Badger',
          },
        })
      )
      fetchDataFn.mockResolvedValue({
        userExcluded: true,
      })
      const data = await fetchFromCacheOrApi({ fetchDataFn, checkWhetherToCacheDataFn, userId, redisKey })
      expect(data).toEqual({
        firstName: 'Bobby',
        lastName: 'Badger',
      })
      // the value was returned from the cache but a fetch was triggered (and not waited for)
      expect(fetchDataFn).toHaveBeenCalled()
      await waitForExpect(() => {
        expect(redisSet).not.toHaveBeenCalled()
        // the new value from the API is uncacheable (eg restricted / excluded), so remove any existing value from the cache
        expect(redisDel).toHaveBeenCalledWith(redisKey)
      })
    })
  })

  describe('CRN is not excluded or restricted', () => {
    beforeEach(() => checkWhetherToCacheDataFn.mockReturnValue(true))

    it("should return the cached data, if the user has previously cached it and they're on the whitelist, and then update the cache", async () => {
      jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
        JSON.stringify({
          userIds: ['other-user', userId],
          data: {
            firstName: 'Bobby',
            lastName: 'Badger',
          },
        })
      )
      fetchDataFn.mockResolvedValue({
        firstName: 'Brian',
        lastName: 'Bling',
      })
      const data = await fetchFromCacheOrApi({ fetchDataFn, checkWhetherToCacheDataFn, userId, redisKey })
      expect(data).toEqual({
        firstName: 'Bobby',
        lastName: 'Badger',
      })
      // the value was returned from the cache but a fetch was triggered (and not waited for)
      expect(fetchDataFn).toHaveBeenCalled()
      // the API response should have been cached, and the user IDs updated with the current user
      await waitForExpect(() => {
        expect(redisSet).toHaveBeenCalledWith(
          redisKey,
          JSON.stringify({
            userIds: [userId, 'other-user'],
            data: {
              firstName: 'Brian',
              lastName: 'Bling',
            },
          })
        )
      })
    })

    it('should populate the cache with the API data, if cache is empty', async () => {
      jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
      fetchDataFn.mockResolvedValue({
        firstName: 'Brian',
        lastName: 'Bling',
      })
      await fetchFromCacheOrApi({ fetchDataFn, checkWhetherToCacheDataFn, userId, redisKey })
      expect(redisSet).toHaveBeenCalledWith(
        redisKey,
        JSON.stringify({
          userIds: [userId],
          data: {
            firstName: 'Brian',
            lastName: 'Bling',
          },
        })
      )
      expect(redisExpire).toHaveBeenCalledWith(redisKey, 86400)
    })

    it('should return the API data, if cache is empty', async () => {
      jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
      fetchDataFn.mockResolvedValue({
        firstName: 'Brian',
        lastName: 'Bling',
      })
      const data = await fetchFromCacheOrApi({ fetchDataFn, checkWhetherToCacheDataFn, userId, redisKey })
      expect(data).toEqual({
        firstName: 'Brian',
        lastName: 'Bling',
      })
    })

    it('should return the API data, if user is not on the whitelist', async () => {
      jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
        JSON.stringify({
          userIds: ['other-user'],
          data: {
            firstName: 'Bobby',
            lastName: 'Badger',
          },
        })
      )
      fetchDataFn.mockResolvedValue({
        firstName: 'Brian',
        lastName: 'Bling',
      })
      const data = await fetchFromCacheOrApi({ fetchDataFn, checkWhetherToCacheDataFn, userId, redisKey })
      expect(data).toEqual({
        firstName: 'Brian',
        lastName: 'Bling',
      })
    })
  })
})
