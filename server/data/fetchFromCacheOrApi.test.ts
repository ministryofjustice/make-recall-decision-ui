import waitForExpect from 'wait-for-expect'
import { createRedisClient, RedisClient } from './redisClient'
import { fetchFromCacheOrApi } from './fetchFromCacheOrApi'

jest.mock('./redisClient')

// see test cases at https://dsdmoj.atlassian.net/browse/MRD-254
describe('fetchFromCacheOrApi', () => {
  const fetchDataFn = jest.fn()
  const checkWhetherToCacheDataFn = jest.fn()
  const redisGet = jest.fn()
  const redisSet = jest.fn()
  const redisDel = jest.fn()
  const redisExpire = jest.fn()
  const redisKey = 'prefix:123'
  const currentUserId = 'a123-b456'

  beforeEach(() => {
    ;(createRedisClient as jest.Mock).mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      get: redisGet,
      set: redisSet,
      expire: redisExpire,
      del: redisDel,
    } as unknown as RedisClient)
  })

  const cachedData = {
    firstName: 'Bobby',
    lastName: 'Badger',
  }

  describe('CRN is not excluded or restricted', () => {
    const apiData = {
      userAccessResponse: {
        firstName: 'Brian',
        lastName: 'Bling',
      },
    }

    beforeEach(() => checkWhetherToCacheDataFn.mockReturnValue(true))

    it('should return the cached data, if it has been previously cached for this user. Then update the cache with the API response', async () => {
      redisGet.mockResolvedValue(
        JSON.stringify({
          userIds: ['other-user', currentUserId],
          data: cachedData,
        })
      )
      fetchDataFn.mockResolvedValue(apiData)
      const data = await fetchFromCacheOrApi({
        fetchDataFn,
        checkWhetherToCacheDataFn,
        userId: currentUserId,
        redisKey,
      })

      expect(data).toEqual(cachedData)

      // a fetch was triggered (and not waited for) to refresh the cache (also update the cached user IDs with current user)
      expect(fetchDataFn).toHaveBeenCalled()
      await waitForExpect(() => {
        expect(redisSet).toHaveBeenCalledWith(
          redisKey,
          JSON.stringify({
            userIds: [currentUserId, 'other-user'],
            data: apiData,
          })
        )
      })
    })

    it('should return API data and populate the cache with it, if cache is empty', async () => {
      redisGet.mockResolvedValue(null)
      fetchDataFn.mockResolvedValue(apiData)
      const data = await fetchFromCacheOrApi({
        fetchDataFn,
        checkWhetherToCacheDataFn,
        userId: currentUserId,
        redisKey,
      })

      expect(data).toEqual(apiData)
      expect(redisSet).toHaveBeenCalledWith(
        redisKey,
        JSON.stringify({
          userIds: [currentUserId],
          data: apiData,
        })
      )
      expect(redisExpire).toHaveBeenCalledWith(redisKey, 86400)
    })

    it('should return the API data, if user has not previously viewed the cached data', async () => {
      redisGet.mockResolvedValue(
        JSON.stringify({
          userIds: ['other-user'],
          data: cachedData,
        })
      )
      fetchDataFn.mockResolvedValue(apiData)
      const data = await fetchFromCacheOrApi({
        fetchDataFn,
        checkWhetherToCacheDataFn,
        userId: currentUserId,
        redisKey,
      })
      expect(data).toEqual(apiData)
      expect(redisSet).toHaveBeenCalledWith(
        redisKey,
        JSON.stringify({
          userIds: [currentUserId, 'other-user'],
          data: apiData,
        })
      )
    })
  })

  describe('CRN is excluded or restricted', () => {
    beforeEach(() => checkWhetherToCacheDataFn.mockReturnValue(false))

    // if the response changes to include an indication that the case is restricted / excluded for other users
    // then add tests here to check the cache will be deleted
    // describe('User has permission to view', () => {})

    describe('User does not have permission to view', () => {
      const apiData = {
        userAccessResponse: {
          userExcluded: true,
        },
      }

      it('should return the API response, if user has not previously viewed the cached data, and deletes any existing cache', async () => {
        redisGet.mockResolvedValue(
          JSON.stringify({
            userIds: ['x987-y654'],
            data: cachedData,
          })
        )
        fetchDataFn.mockResolvedValue(apiData)
        const data = await fetchFromCacheOrApi({
          fetchDataFn,
          checkWhetherToCacheDataFn,
          userId: currentUserId,
          redisKey,
        })
        expect(fetchDataFn).toHaveBeenCalled()
        expect(data).toEqual(apiData)
        await waitForExpect(() => {
          expect(redisSet).not.toHaveBeenCalled()
          // the new value from the API is uncacheable (eg restricted / excluded), so remove any existing value from the cache
          expect(redisDel).toHaveBeenCalledWith(redisKey)
        })
      })

      it("should return the cached data if the user has previously viewed it, but then delete the cache and don't update with API response", async () => {
        redisGet.mockResolvedValue(
          JSON.stringify({
            userIds: [currentUserId],
            data: cachedData,
          })
        )
        fetchDataFn.mockResolvedValue({
          userExcluded: true,
        })
        const data = await fetchFromCacheOrApi({
          fetchDataFn,
          checkWhetherToCacheDataFn,
          userId: currentUserId,
          redisKey,
        })
        expect(data).toEqual(cachedData)
        // the value was returned from the cache but a fetch was triggered (and not waited for)
        expect(fetchDataFn).toHaveBeenCalled()
        await waitForExpect(() => {
          expect(redisSet).not.toHaveBeenCalled()
          // the new value from the API is uncacheable (eg restricted / excluded), so remove any existing value from the cache
          expect(redisDel).toHaveBeenCalledWith(redisKey)
        })
      })

      it('should return the API response, if the cache is empty, and not update the cache with API response', async () => {
        redisGet.mockResolvedValue(null)
        fetchDataFn.mockResolvedValue(apiData)
        const data = await fetchFromCacheOrApi({
          fetchDataFn,
          checkWhetherToCacheDataFn,
          userId: currentUserId,
          redisKey,
        })
        expect(fetchDataFn).toHaveBeenCalled()
        expect(data).toEqual(apiData)
        await waitForExpect(() => {
          expect(redisSet).not.toHaveBeenCalled()
          expect(redisDel).toHaveBeenCalledWith(redisKey)
        })
      })
    })
  })
})
