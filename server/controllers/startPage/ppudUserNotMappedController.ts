import { NextFunction, Request, Response } from 'express'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'ppudUserNotMapped',
    },
    ppudUrl: config.ppud,
  }

  res.render('pages/ppudUserNotMapped')
  next()
}

export default { get }
