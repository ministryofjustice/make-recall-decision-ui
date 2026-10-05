import { fetchFromCacheOrApi } from '../data/fetchFromCacheOrApi'
import { ppudSearchActiveUsers, searchMappedUsers } from '../data/makeDecisionApiClient'

const ONE_WEEK_TTL_OVERRIDE_SECONDS = 60 * 60 * 24 * 7

export default async function hasValidPpudUserMapping({
  username,
  userId,
  token,
}: {
  username: string
  userId: string
  token: string
}): Promise<boolean> {
  const mappingRes = await searchMappedUsers(username, token)

  if (!mappingRes.ppudUserMapping) {
    return false
  }

  const ppudUserRes = await fetchFromCacheOrApi({
    fetchDataFn: async () => ppudSearchActiveUsers(token, mappingRes.ppudUserMapping.ppudUserName, null),
    checkWhetherToCacheDataFn: apiResponse => apiResponse.results.length > 0,
    userId,
    redisKey: `ppudUserResponse:${username}`,
    ttlOverrideSeconds: ONE_WEEK_TTL_OVERRIDE_SECONDS,
  })

  return ppudUserRes?.results?.length === 1
}
