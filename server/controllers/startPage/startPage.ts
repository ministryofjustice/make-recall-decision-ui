import { Request, Response } from 'express'
import config from '../../config'
import { isBannerDisplayDateRangeValid } from '../../utils/utils'

export enum HMPPS_AUTH_ROLE {
  PPCS = 'ROLE_MAKE_RECALL_DECISION_PPCS',
}

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.body) && isBannerDisplayDateRangeValid(),
  }

  if (res.locals.user.hasPpcsRole) {
    res.render('pages/startPPCS')
  } else {
    res.locals.searchEndpoint = '/search-by-name'
    res.render('pages/startPage')
  }
}
