import { Request, Response } from 'express'
import config from '../../config'
import { isBannerDisplayDateRangeValid } from '../../utils/utils'

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.body) && isBannerDisplayDateRangeValid(),
  }
  if (res.locals.user.hasPpcsRole) {
    res.locals.findRecallRequest = '/search-by-name?hasPpcsRole=true'
    res.render('pages/startPPCS')
  } else {
    res.locals.searchEndpoint = '/search-by-name'
    res.render('pages/startPage')
  }
}
