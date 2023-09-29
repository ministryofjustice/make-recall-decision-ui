import { Request, Response } from 'express'
import config from '../../config'
import { isBannerDisplayDateRangeValid } from '../../utils/utils'

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.body) && isBannerDisplayDateRangeValid(),
  }
  res.locals.searchEndpoint = '/search-by-name'
  res.render('pages/startPage')
}
