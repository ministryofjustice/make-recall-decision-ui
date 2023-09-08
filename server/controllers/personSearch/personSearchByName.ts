import { Request, Response } from 'express'
import config from '../../config'

export const personSearchByName = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.active === 'true'.toLowerCase()) && Boolean(config.notification.body),
  }
  res.render('pages/personSearchByName')
}
