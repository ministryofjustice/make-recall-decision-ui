import { Request, Response } from 'express'
import config from '../../config'

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  const { flags } = res.locals
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  if (flags.flagSearchByName) {
    res.locals.searchEndpoint = '/search-by-name'
  } else {
    res.locals.searchEndpoint = '/search-by-crn'
  }
  res.render('pages/startPage')
}
