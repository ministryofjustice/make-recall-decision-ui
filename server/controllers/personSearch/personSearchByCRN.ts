import { Request, Response } from 'express'
import config from '../../config'

export const personSearchByCRN = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.active === 'true'.toLowerCase()) && Boolean(config.notification.body),
  }
  const { flags } = res.locals
  if (flags.flagSearchByName) {
    res.render('pages/personSearchByCRN')
  } else {
    res.render('pages/personSearch')
  }
}
