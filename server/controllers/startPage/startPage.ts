import { Request, Response } from 'express'
import jwtDecode from 'jwt-decode'
import config from '../../config'
import { isBannerDisplayDateRangeValid } from '../../utils/utils'

export enum HMPPS_AUTH_ROLE {
  PPCS = 'ROLE_MARD_PPCS',
}

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.body) && isBannerDisplayDateRangeValid(),
  }
  const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }
  res.locals.user.roles = roles
  res.locals.user.hasPpcsRole = roles.includes(HMPPS_AUTH_ROLE.PPCS)
  if (res.locals.user.hasPpcsRole) {
    res.locals.findRecallRequest = '/find-a-recall-request' // TODO !!
    res.render('pages/startPPCS')
  } else {
    res.locals.searchEndpoint = '/search-by-name'
    res.render('pages/startPage')
  }
}
