import { NextFunction, Request, Response } from 'express'

async function get(_: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'ppcsSearch',
    },
  }
  res.render(`pages/ppcsSearch`)
  next()
}

export default { get }
