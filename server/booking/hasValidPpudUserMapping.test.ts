import hasValidPpudUserMapping from './hasValidPpudUserMapping'
import { fetchFromCacheOrApi } from '../data/fetchFromCacheOrApi'
import { ppudSearchActiveUsers, searchMappedUsers } from '../data/makeDecisionApiClient'

jest.mock('../data/fetchFromCacheOrApi')
jest.mock('../data/makeDecisionApiClient')

const mockFetchFromCacheOrApi = fetchFromCacheOrApi as jest.MockedFunction<typeof fetchFromCacheOrApi>
const mockPpudSearchActiveUsers = ppudSearchActiveUsers as jest.MockedFunction<typeof ppudSearchActiveUsers>
const mockSearchMappedUsers = searchMappedUsers as jest.MockedFunction<typeof searchMappedUsers>

describe('hasValidPpudUserMapping', () => {
  const username = 'test.user'
  const userId = '12345'
  const token = 'test-token'
  const ppudUserName = 'mapped.ppud.user'

  const ppudUserMapping = {
    userName: username,
    ppudUserName,
    ppudUserFullName: 'Mapped PPUD User',
    ppudTeamName: 'PPUD Team',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when no PPUD user mapping exists', () => {
    it('returns false', async () => {
      mockSearchMappedUsers.mockResolvedValue({
        ppudUserMapping: undefined,
      })

      const result = await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      expect(result).toBe(false)

      expect(mockSearchMappedUsers).toHaveBeenCalledWith(username, token)
      expect(mockFetchFromCacheOrApi).not.toHaveBeenCalled()
      expect(mockPpudSearchActiveUsers).not.toHaveBeenCalled()
    })
  })

  describe('when a PPUD user mapping exists', () => {
    beforeEach(() => {
      mockSearchMappedUsers.mockResolvedValue({
        ppudUserMapping,
      })
    })

    it('returns true when exactly one active PPUD user is found', async () => {
      mockFetchFromCacheOrApi.mockResolvedValue({
        results: [
          {
            username: ppudUserName,
          },
        ],
      })

      const result = await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      expect(result).toBe(true)

      expect(mockSearchMappedUsers).toHaveBeenCalledWith(username, token)

      expect(mockFetchFromCacheOrApi).toHaveBeenCalledTimes(1)

      expect(mockFetchFromCacheOrApi).toHaveBeenCalledWith({
        fetchDataFn: expect.any(Function),
        checkWhetherToCacheDataFn: expect.any(Function),
        userId,
        redisKey: `ppudUserResponse:${username}`,
        ttlOverrideSeconds: 604800,
      })

      const { fetchDataFn } = mockFetchFromCacheOrApi.mock.calls[0][0]

      await fetchDataFn()

      expect(mockPpudSearchActiveUsers).toHaveBeenCalledWith(token, ppudUserName, null)
    })

    it('returns false when no active PPUD users are found', async () => {
      mockFetchFromCacheOrApi.mockResolvedValue({
        results: [],
      })

      const result = await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      expect(result).toBe(false)

      expect(mockSearchMappedUsers).toHaveBeenCalledWith(username, token)

      expect(mockFetchFromCacheOrApi).toHaveBeenCalledTimes(1)
    })

    it('returns false when more than one active PPUD user is found', async () => {
      mockFetchFromCacheOrApi.mockResolvedValue({
        results: [
          {
            username: 'mapped.ppud.user.1',
          },
          {
            username: 'mapped.ppud.user.2',
          },
        ],
      })

      const result = await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      expect(result).toBe(false)
    })

    it('returns false when the PPUD response is undefined', async () => {
      mockFetchFromCacheOrApi.mockResolvedValue(undefined)

      const result = await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      expect(result).toBe(false)
    })
  })

  describe('cache configuration', () => {
    beforeEach(() => {
      mockSearchMappedUsers.mockResolvedValue({
        ppudUserMapping,
      })

      mockFetchFromCacheOrApi.mockResolvedValue({
        results: [
          {
            username: ppudUserName,
          },
        ],
      })
    })

    it('uses the username-specific Redis key and one-week TTL', async () => {
      await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      expect(mockFetchFromCacheOrApi).toHaveBeenCalledWith({
        fetchDataFn: expect.any(Function),
        checkWhetherToCacheDataFn: expect.any(Function),
        userId,
        redisKey: `ppudUserResponse:${username}`,
        ttlOverrideSeconds: 604800,
      })
    })

    it('caches the response when the API response contains results', async () => {
      await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      const { checkWhetherToCacheDataFn } = mockFetchFromCacheOrApi.mock.calls[0][0]

      expect(
        checkWhetherToCacheDataFn({
          results: [
            {
              username: ppudUserName,
            },
          ],
        }),
      ).toBe(true)
    })

    it('does not cache the response when the API response contains no results', async () => {
      await hasValidPpudUserMapping({
        username,
        userId,
        token,
      })

      const { checkWhetherToCacheDataFn } = mockFetchFromCacheOrApi.mock.calls[0][0]

      expect(
        checkWhetherToCacheDataFn({
          results: [],
        }),
      ).toBe(false)
    })
  })
})
