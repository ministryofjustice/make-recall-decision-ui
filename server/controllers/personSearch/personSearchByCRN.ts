import { Request, Response } from 'express'
import config from '../../config'

export const personSearchByCRN = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  const { flags } = res.locals
  if (flags.flagSearchByName) {
    res.render('pages/personSearchByCRN')
  } else {
    res.render('pages/personSearch')
  }
}
