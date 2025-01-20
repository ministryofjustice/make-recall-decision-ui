import { Request, Response } from 'express'
import config from '../../config'
import { isBannerDisplayDateRangeValid } from '../../utils/utils'
import { ppudSearchActiveUsers, searchMappedUsers } from '../../data/makeDecisionApiClient'
import { fetchFromCacheOrApi } from '../../data/fetchFromCacheOrApi'

export enum HMPPS_AUTH_ROLE {
  PPCS = 'ROLE_MAKE_RECALL_DECISION_PPCS',
}

const ONE_WEEK_TTL_OVERRIDE_SECONDS = 60 * 60 * 24 * 7

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.body) && isBannerDisplayDateRangeValid(),
  }
  const {
    user: { username, userId, token },
  } = res.locals

  if (res.locals.user.hasPpcsRole) {
    const mappingRes = await searchMappedUsers(username, token)
    if (mappingRes.ppudUserMapping) {
      const ppudUserRes = await fetchFromCacheOrApi({
        fetchDataFn: async () => {
          return ppudSearchActiveUsers(token, mappingRes.ppudUserMapping.userName, null)
        },
        checkWhetherToCacheDataFn: apiResponse => apiResponse.results.length > 0,
        userId,
        redisKey: `ppudUserResponse:${username}`,
        ttlOverrideSeconds: ONE_WEEK_TTL_OVERRIDE_SECONDS,
      })
      res.locals.validMappingAndPpudUser = ppudUserRes?.results.length === 1
    }
    res.render('pages/startPPCS')
  } else {
    res.locals.searchEndpoint = '/search-by-name'
    res.render('pages/startPage')
  }
}
