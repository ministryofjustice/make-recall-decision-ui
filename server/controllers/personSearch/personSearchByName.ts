import { Request, Response } from 'express'
import config from '../../config'

export const personSearchByName = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  res.render('pages/personSearchByName')
}
