import { Request, Response } from 'express'
import config from '../../config'
import { isBannerDisplayDateRangeValid } from '../../utils/utils'

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  const { flags } = res.locals
  res.locals.notification = {
    ...config.notification,
    isVisible:
      String(config.notification.active).toLowerCase() === 'true' &&
      Boolean(config.notification.body) &&
      isBannerDisplayDateRangeValid()
  }
  if (flags.flagSearchByName) {
    res.locals.searchEndpoint = '/search-by-name'
  } else {
    res.locals.searchEndpoint = '/search-by-crn'
  }
  res.render('pages/startPage')
}
