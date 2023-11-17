import { NextFunction, Request, Response } from 'express'

async function get(_: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'searchPpud',
    },
  }
  res.render(`pages/recommendations/searchPpud`)
  next()
}

export default { get }
