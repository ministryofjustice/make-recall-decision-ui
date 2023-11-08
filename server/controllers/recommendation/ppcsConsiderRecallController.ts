import { NextFunction, Request, Response } from 'express'

async function get(_: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'ppcsConsiderRecall',
    },
  }
  res.render(`pages/recommendations/ppcsConsiderRecall`)
  next()
}

export default { get }
