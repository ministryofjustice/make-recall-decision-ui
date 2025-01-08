import { Request, Response } from 'express'
import config from '../../config'
import { isBannerDisplayDateRangeValid } from '../../utils/utils'
import { ppudSearchActiveUsers, searchMappedUsers } from '../../data/makeDecisionApiClient'

export enum HMPPS_AUTH_ROLE {
  PPCS = 'ROLE_MAKE_RECALL_DECISION_PPCS',
}

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.body) && isBannerDisplayDateRangeValid(),
  }
  const {
    user: { username, token },
  } = res.locals

  if (res.locals.user.hasPpcsRole) {
    const mappingRes = await searchMappedUsers(username, token)
    if (mappingRes.ppudUserMapping) {
      const ppudUserRes = await ppudSearchActiveUsers(token, mappingRes.ppudUserMapping.userName, null)
      res.locals.validMappingAndPpudUser = ppudUserRes.results.length === 1
    }
    res.render('pages/startPPCS')
  } else {
    res.locals.searchEndpoint = '/search-by-name'
    res.render('pages/startPage')
  }
}
