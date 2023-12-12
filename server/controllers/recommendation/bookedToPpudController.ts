import { NextFunction, Request, Response } from 'express'

async function get(_: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'bookedToPpud',
    },
  }

  res.render(`pages/recommendations/bookedToPpud`)
  next()
}

export default { get }
